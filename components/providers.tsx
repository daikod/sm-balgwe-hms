// components/Providers.tsx
"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <ClerkProvider>
      {children}
      <Toaster richColors position="top-center" />
    </ClerkProvider>
  </ThemeProvider>
);
