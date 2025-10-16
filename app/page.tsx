import HeroSection from "@/components/HeroSection/Hero";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Pricing />
      <footer className="py-8 text-center text-muted-foreground">
        <p>© 2025 ListingBooster. All rights reserved.</p>
      </footer>
    </main>
  );
}
