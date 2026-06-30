"use client";

import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Features from "@/components/Features";
import WhoIsIt from "@/components/WhoIsIt";
import Pricing from "@/components/Pricing";
import PaymentShowcase from "@/components/PaymentShowcase";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-ivory-100">
      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <WhoIsIt />
      <Pricing />
      <PaymentShowcase />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
