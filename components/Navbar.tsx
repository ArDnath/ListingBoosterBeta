"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
export default function Navbar() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Track scroll for the blur/shadow transition
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-[9999] flex items-center justify-between px-6 py-3"
    >
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(8px)" : "none",
          boxShadow: visible
            ? "0 0 24px rgba(34,42,53,0.06), 0 1px 1px rgba(0,0,0,0.05), 0 0 0 1px rgba(34,42,53,0.04), 0 0 4px rgba(34,42,53,0.08), 0 16px 68px rgba(47,48,55,0.05), 0 1px 0 rgba(255,255,255,0.1) inset"
            : "none",
          backgroundColor: visible
            ? "rgba(255,255,255,0.8)"
            : "rgba(255,255,255,0)",
          borderRadius: visible ? "2rem" : "0rem",
          y: visible ? 10 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 40,
        }}
        className="flex w-full max-w-7xl mx-auto items-center justify-between rounded-full px-6 py-3 dark:bg-neutral-950/80"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="https://assets.aceternity.com/logo-dark.png"
            alt="logo"
            width={30}
            height={30}
            priority
          />
          <span className="font-medium text-black dark:text-white">
            ListingBooster
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="relative px-3 py-1 transition duration-300 hover:text-neutral-900 dark:hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex gap-3">
        <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-md bg-transparent text-neutral-700 dark:text-white border border-neutral-300 dark:border-neutral-700 text-sm font-bold cursor-pointer transition duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-md bg-gray-800 text-white text-sm font-bold shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                  }
                }}
              />
            </SignedIn>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center">
          {menuOpen ? (
            <IconX
              onClick={() => setMenuOpen(false)}
              className="text-black dark:text-white cursor-pointer"
            />
          ) : (
            <IconMenu2
              onClick={() => setMenuOpen(true)}
              className="text-black dark:text-white cursor-pointer"
            />
          )}
        </div>
      </motion.div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-16 left-0 w-full flex flex-col items-start justify-start gap-4 bg-white dark:bg-neutral-950 px-6 py-6 rounded-lg shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
        >
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block w-full text-neutral-600 dark:text-neutral-300 py-2"
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/sign-in"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 w-full rounded-md text-center bg-transparent dark:text-white text-black text-sm font-bold"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 w-full rounded-md bg-white text-black text-center text-sm font-bold shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
          >
            Get Started
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
