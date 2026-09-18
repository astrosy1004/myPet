import type { Metadata } from "next";
import { Geist, Geist_Mono, Jua } from "next/font/google";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jua = Jua({
  variable: "--font-jua",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "행복한 집사생활",
  description: "고양이·강아지 통합 관리 웹앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${jua.variable} h-full antialiased`}
    >
      <head>
        <script
          // 하이드레이션 전에 저장된 테마를 적용해 화면 깜빡임(FOUC)을 방지한다.
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('myPet-theme')==='cute'){document.documentElement.setAttribute('data-theme','cute');}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-orange-50">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
