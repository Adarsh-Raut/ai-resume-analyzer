import type { Metadata } from "next"
import { Inter, Cal_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const calSans = Cal_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ResumeAI — Smart Resume Analyzer",
  description: "Upload your resume and get AI-powered feedback to improve it",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${calSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
