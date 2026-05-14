"use client";

import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000" 
          alt="Law Office" 
          className="w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black via-black/80 to-black"></div>
      </div>

      <div className="relative z-10 text-center px-5 sm:px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-gradient-gold font-bold text-sm md:text-base uppercase tracking-[0.28em] md:tracking-[0.45em] mb-6 block">⚖️ Defesa Jurídica com Técnica, Ética e Confiança</span>
          <h1 className="serif text-5xl md:text-7xl lg:text-8xl font-light leading-tight mb-8">
            Seus Direitos <br />
            <span className="italic text-gradient-gold font-bold">Nossa Prioridade</span>
          </h1>
          <p className="text-zinc-300 text-lg md:text-xl max-w-3xl mx-auto mb-4 font-light leading-relaxed">
            Atuação especializada em <strong className="text-white">Direito Previdenciário</strong> e <strong className="text-white">Direito Bancário</strong>, com foco na proteção dos seus direitos frente ao INSS e instituições financeiras.
          </p>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Atendimento digital em todo o Brasil. Resolva seu caso com praticidade, segurança jurídica e acompanhamento completo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="max-w-full px-8 sm:px-10 py-4 bg-linear-to-r from-[#9A7135] via-[#E2B961] to-[#9A7135] text-black font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity duration-300 shadow-[0_0_30px_rgba(226,185,97,0.2)]">
              Falar com Especialista
            </a>
            <a href="#services" className="max-w-full px-8 sm:px-10 py-4 border border-white/20 hover:border-gold transition-all duration-300 uppercase tracking-widest text-sm">
              Nossas Especialidades
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-linear-to-t from-gold to-transparent"></div>
    </section>
  );
}
