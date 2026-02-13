import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let message = "";
    let file: File | null = null;

    // Handle multipart/form-data (file uploads)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      message = (formData.get("message") as string) || "";
      file = (formData.get("file") as File) || null;
      console.log("📎 Multipart request received");
    } else {
      // Handle JSON (text only)
      const body = await req.json();
      message = body.messages?.[body.messages.length - 1]?.content || "";
      console.log("💬 JSON request received");
    }

    // ✅ Use the correct Vercel environment variable
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Generative AI API key is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let response;

    // Handle file uploads
    if (file) {
      console.log("📎 Processing file:", file.name, file.type, file.size);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString("base64");

      let mimeType = file.type;
      if (!mimeType || mimeType === "application/octet-stream") {
        if (file.name.endsWith(".pdf")) mimeType = "application/pdf";
        else if (file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) mimeType = "image/jpeg";
        else if (file.name.endsWith(".png")) mimeType = "image/png";
        else if (file.name.endsWith(".txt")) mimeType = "text/plain";
        else if (file.name.endsWith(".doc")) mimeType = "application/msword";
        else if (file.name.endsWith(".docx"))
          mimeType =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      }

      const parts: any[] = [];

      if (message) parts.push({ text: message });
      else
        parts.push({
          text: "Please analyze this file and tell me what it contains.",
        });

      if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
        parts.push({
          inlineData: { mimeType, data: base64Data },
        });
      } else if (mimeType === "text/plain") {
        const textContent = buffer.toString("utf-8");
        parts.push({ text: `\n\nFile content (${file.name}):\n${textContent}` });
      } else {
        parts.push({ text: `\n\nFile attached: ${file.name} (${mimeType})` });
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
      });
      response = await result.response;
      console.log("✅ Gemini response with file received");

    } else {
      // Text-only
      console.log("💬 Sending text to Gemini:", message.substring(0, 50) + "...");
      const result = await model.generateContent(message);
      response = await result.response;
      console.log("✅ Gemini text response received");
    }

    const text = response.text();
    return NextResponse.json({ response: text, fileProcessed: !!file });

  } catch (error: any) {
    console.error("❌ Gemini API Error:", error);

    let errorMessage = "Failed to generate response";
    if (error.message?.includes("API key")) {
      errorMessage = "Invalid API key. Please check your Google Generative AI API key.";
    } else if (error.message?.includes("quota")) {
      errorMessage = "API quota exceeded. Please try again later.";
    } else if (error.message?.includes("model")) {
      errorMessage = "Model not available. Please try again.";
    }

    return NextResponse.json(
      { error: errorMessage, details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
