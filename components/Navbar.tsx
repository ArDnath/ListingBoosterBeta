"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { useState } from "react";
import HeroSection from "./HeroSection/Hero";
import Pricing from "./Pricing";
export function NavbarDemo() {
  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Pricing",  link: "#pricing"  },
    { name: "Contact",  link: "#contact"  },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative pt-2 mt-4 w-full ">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">                                {/* ② place toggle */}
            <SignedOut>
              <SignInButton mode="modal">
                <NavbarButton variant="secondary">Sign In</NavbarButton>
              </SignInButton>
              <SignUpButton mode="modal">
                <NavbarButton variant="primary">Get Started</NavbarButton>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <div className="flex items-center gap-2">                                {/* ③ place toggle */}
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-neutral-600 dark:text-neutral-300"
              >
                {item.name}
              </a>
            ))}

            <SignedOut>
              <div className="flex flex-col gap-4 pt-4">
                <SignInButton mode="modal">
                  <NavbarButton variant="secondary" className="w-full">
                    Sign In
                  </NavbarButton>
                </SignInButton>
                <SignUpButton mode="modal">
                  <NavbarButton variant="primary" className="w-full">
                    Get Started
                  </NavbarButton>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="pt-4 flex justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      <HeroSection />
      <Pricing/>
    </div>
  );
};