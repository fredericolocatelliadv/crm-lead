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
    <section className="relative overflow-hidden bg-black py-28 sm:py-32">
      <div className="absolute inset-0 bg-linear-to-b from-zinc-950 via-black to-zinc-950 opacity-60" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/25 to-transparent" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <div className="mb-5 flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-gold" />
              <span className="text-sm uppercase tracking-[0.35em] text-gold">Diferenciais</span>
            </div>
            <h2 className="serif text-5xl font-light leading-tight text-white md:text-7xl">
              Por que escolher o{" "}
              <span className="italic text-gradient-gold font-bold">nosso escritório?</span>
            </h2>
            <p className="mt-8 max-w-xl text-xl font-light leading-relaxed text-zinc-400">
              Porque um bom atendimento jurídico precisa unir técnica, escuta e responsabilidade desde o primeiro contato.
            </p>

            <motion.a
              href="#contact"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-10 inline-block max-w-full bg-linear-to-r from-[#9A7135] via-[#E2B961] to-[#9A7135] px-8 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(226,185,97,0.2)] transition-opacity duration-300 hover:opacity-90"
            >
              Fale Conosco
            </motion.a>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-gold/25 bg-zinc-950/80 p-8 sm:p-10"
            >
              <div className="mb-8 flex h-14 w-14 items-center justify-center border border-gold/30 bg-gold/10">
                <CheckCircle className="h-7 w-7 text-gold" />
              </div>
              <span className="text-sm uppercase tracking-[0.3em] text-gold">Diferencial central</span>
              <h3 className="serif mt-5 text-4xl font-bold leading-tight text-gradient-gold md:text-5xl">
                Atendimento claro e acessível
              </h3>
              <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-zinc-300">
                Comunicação transparente e linguagem compreensível em todas as etapas, para que o cliente entenda o caminho jurídico sem perder segurança.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {reasons.slice(1).map((reason, index) => (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="group border border-white/10 bg-black/70 p-6 transition-all duration-500 hover:border-gold/30 hover:bg-zinc-950"
                >
                  <span className="serif text-4xl font-light text-gold/30">
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 text-xl font-medium leading-tight text-white transition-colors duration-300 group-hover:text-gold">
                    {reason.title}
                  </h3>
                  <p className="mt-4 text-base font-light leading-relaxed text-zinc-400">
                    {reason.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <p className="pt-6 text-center text-base font-light leading-relaxed text-zinc-400">
              Nossa missão é garantir que você tenha acesso à justiça com segurança, clareza e atuação responsável.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
