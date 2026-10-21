import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "./providers";
import NavBar from "@/components/nav/NavBar";
import HamburgerMenu from "@/components/modal/HamburgerMenu";
import {Toaster} from 'sonner'
import NotificationListener from "@/components/notification/NotificationListener";
import ProgressBar from "@/components/utils/ProgressBar";
import JobPreview from "@/components/workspace/modals/JobPreview";
import DemoBootstrap from "@/components/utils/DemoBootstrap";

export const metadata: Metadata = {
  title: "EVALIA",
  description: "AI-powered hiring platform: resume analysis, job matching and AI interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <DemoBootstrap/>
          <main className="w-screen h-screen bg-neutral-950 text-neutral-100 ">
              <NavBar/>
              <ProgressBar/>
              <HamburgerMenu/>
              <JobPreview/>
              <Toaster richColors expand={false} visibleToasts={3} position='bottom-center'/>
              <NotificationListener />
              {children}
          </main>
        </ReduxProvider>
      </body>
    </html>
  );
}
