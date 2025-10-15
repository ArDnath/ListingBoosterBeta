import Image from "next/image";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
      <footer className="bg-black">
        This is place for the footer
      </footer>
    </div>
  );
}
