"use client";

import About from "./About";
import ContactForm from "./ContactForm";
import FAQ from "./FAQ";
import FloatingWhatsApp from "./FloatingWhatsApp";
import Footer from "./Footer";
import Hero from "./Hero";
import Navbar from "./Navbar";
import Services from "./Services";
import Team from "./Team";
import Testimonials from "./Testimonials";
import WhatsAppLeadCapture from "./WhatsAppLeadCapture";
import WhyChooseUs from "./WhyChooseUs";
import NewsSection from "@/features/blog/components/NewsSection";
import type { LegalAreaOption } from "@/features/leads/types/legal-area";
import type { News } from "@/shared/types/content";

export default function SiteHome({
  legalAreas,
  news,
}: {
  legalAreas: LegalAreaOption[];
  news: News[];
}) {
  return (
    <div className="bg-black text-white selection:bg-gold selection:text-black overflow-x-clip">
      <Navbar />

      <main>
        <Hero />
        <About />
        <Services />
        <WhyChooseUs />
        <Team />
        <Testimonials />
        <FAQ />
        <NewsSection news={news} />

        <section id="contact" className="py-24 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center relative z-10">
            <h2 className="serif text-white text-4xl md:text-5xl font-light mb-8">
              Precisa de orientação jurídica <span className="text-gradient-gold font-bold">especializada?</span>
            </h2>
            <p className="text-zinc-400 mb-10 text-lg font-light">
              Nossa equipe está pronta para analisar seu caso com a atenção e o rigor técnico que ele merece.
            </p>
            <WhatsAppLeadCapture buttonClassName="inline-block max-w-full px-7 sm:px-12 py-5 bg-linear-to-r from-[#9A7135] via-[#E2B961] to-[#9A7135] text-black font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity duration-300 mb-16 shadow-[0_0_30px_rgba(226,185,97,0.3)]">
              Iniciar atendimento via WhatsApp
            </WhatsAppLeadCapture>

            <ContactForm legalAreas={legalAreas} />
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
