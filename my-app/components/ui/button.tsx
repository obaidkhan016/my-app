import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles: softer rounding (full) and smoother transitions
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
  {
    variants: {
      variant: {
        // The "Gemini Blue" Gradient
        default:
          "bg-gradient-to-tr from-[#1a73e8] via-[#4285f4] to-[#7baaf7] text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-95",
        
        // The "AI Sparkle" Outline (Glassmorphism)
        outline:
          "border border-white/20 bg-white/5 backdrop-blur-md text-foreground hover:bg-white/10 hover:border-white/30 shadow-sm",
        
        // Subtle Ghost with a hint of purple/blue tint
        ghost:
          "hover:bg-blue-500/10 hover:text-blue-600 dark:hover:bg-blue-400/10 dark:hover:text-blue-300",

        // Animated AI Variant (The Premium Look)
        ai: "relative bg-slate-900 text-white overflow-hidden before:absolute before:inset-0 before:bg-[conic-gradient(from_0deg,transparent_rgba(66,133,244,0.5),transparent)] before:animate-[spin_4s_linear_infinite] hover:before:bg-[conic-gradient(from_0deg,transparent_#4285f4,transparent)]",
        
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        secondary:
          "bg-secondary/50 backdrop-blur-sm text-secondary-foreground hover:bg-secondary/80",
        link: "text-blue-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };