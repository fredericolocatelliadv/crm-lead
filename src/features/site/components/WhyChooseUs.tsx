"use client";

import { motion } from 'motion/react';
import { CheckCircle, MessageSquare } from 'lucide-react';

const reasons = [
  {
    title: 'Atendimento claro e acessível',
    description: 'Comunicação transparente e linguagem compreensível em todas as etapas'
  },
  {
    title: 'Análise individual do seu caso',
    description: 'Cada situação é única e merece atenção personalizada'
  },
  {
    title: 'Atuação técnica e estratégica',
    description: 'Conhecimento jurídico aplicado com planejamento eficiente'
  },
  {
    title: 'Compromisso com ética profissional',
    description: 'Respeito aos princípios da advocacia e às normas legais'
  },
  {
    title: 'Acompanhamento completo do processo',
    description: 'Presença constante desde o início até a conclusão do seu caso'
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-linear-to-b from-zinc-950 via-black to-zinc-950 opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-gold/5 blur-[120px] rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-gold" />
            <span className="text-gold text-sm uppercase tracking-[0.3em]">Diferenciais</span>
          </div>
          <h2 className="serif text-4xl md:text-5xl font-light mb-6">
            Por que escolher o <br />
            <span className="italic text-gradient-gold font-bold">nosso escritório?</span>
          </h2>
          <div className="w-20 h-px bg-gold mx-auto"></div>
        </motion.div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-zinc-950 border border-white/5 p-8 h-full hover:border-gold/30 transition-all duration-500 hover:bg-zinc-900/50">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <CheckCircle className="w-6 h-6 text-gold" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-white text-lg font-medium mb-3 leading-tight">
                  {reason.title}
                </h3>
                <p className="text-zinc-400 text-base font-light leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-zinc-400 text-base mb-6 max-w-2xl mx-auto">
            Nossa missão é garantir que você tenha acesso à justiça com segurança, clareza e resultados concretos.
          </p>
          <a 
            href="#contact" 
            className="inline-block max-w-full px-8 sm:px-10 py-4 bg-linear-to-r from-[#9A7135] via-[#E2B961] to-[#9A7135] text-black font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity duration-300 shadow-[0_0_30px_rgba(226,185,97,0.2)]"
          >
            Fale Conosco
          </a>
        </motion.div>
      </div>
    </section>
  );
}
