module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        // Check if it's multipart form data or JSON
        const contentType = req.headers.get("content-type") || "";
        let message = "";
        let file = null;
        if (contentType.includes("multipart/form-data")) {
            // Handle file upload
            const formData = await req.formData();
            message = formData.get("message") || "";
            file = formData.get("file") || null;
            console.log("📎 Multipart request received");
        } else {
            // Handle text-only JSON
            const body = await req.json();
            message = body.messages?.[body.messages.length - 1]?.content || "";
            console.log("💬 JSON request received");
        }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Gemini API key is not configured"
            }, {
                status: 500
            });
        }
        const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });
        let response;
        // Handle file upload
        if (file) {
            console.log("📎 Processing file:", file.name, file.type, file.size);
            // Convert file to base64
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Data = buffer.toString('base64');
            // Determine MIME type
            let mimeType = file.type;
            if (!mimeType || mimeType === 'application/octet-stream') {
                if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
                else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) mimeType = 'image/jpeg';
                else if (file.name.endsWith('.png')) mimeType = 'image/png';
                else if (file.name.endsWith('.txt')) mimeType = 'text/plain';
                else if (file.name.endsWith('.doc')) mimeType = 'application/msword';
                else if (file.name.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            }
            // Create parts array
            const parts = [];
            // Add text prompt
            if (message) {
                parts.push({
                    text: message
                });
            } else {
                parts.push({
                    text: "Please analyze this file and tell me what it contains."
                });
            }
            // Add file data
            if (mimeType.startsWith('image/')) {
                parts.push({
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                });
            } else if (mimeType === 'application/pdf') {
                parts.push({
                    inlineData: {
                        mimeType: 'application/pdf',
                        data: base64Data
                    }
                });
            } else if (mimeType === 'text/plain') {
                const textContent = buffer.toString('utf-8');
                parts.push({
                    text: `\n\nFile content (${file.name}):\n${textContent}`
                });
            } else {
                parts.push({
                    text: `\n\nFile attached: ${file.name} (${mimeType})`
                });
            }
            const result = await model.generateContent({
                contents: [
                    {
                        role: "user",
                        parts
                    }
                ]
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
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            response: text,
            fileProcessed: !!file
        });
    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        // Check for specific Gemini errors
        let errorMessage = "Failed to generate response";
        if (error.message?.includes("API key")) {
            errorMessage = "Invalid API key. Please check your Gemini API key.";
        } else if (error.message?.includes("quota")) {
            errorMessage = "API quota exceeded. Please try again later.";
        } else if (error.message?.includes("model")) {
            errorMessage = "Model not available. Please try again.";
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: errorMessage,
            details: error?.message || "Unknown error"
        }, {
            status: 500
        });
    }
}
async function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Method not allowed"
    }, {
        status: 405
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__680175ef._.js.map