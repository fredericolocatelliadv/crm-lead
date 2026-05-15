"use client";

import { motion } from "motion/react";

const pillars = [
  {
    label: "Atuação principal",
    text: "Direito Previdenciário e Direito Bancário, com análise individualizada e condução responsável.",
  },
  {
    label: "Método",
    text: "Escuta, organização dos fatos, orientação clara e estratégia adequada para cada necessidade.",
  },
  {
    label: "Compromisso",
    text: "Ética profissional, transparência no atendimento e rigor técnico em cada etapa.",
  },
];

const values = [
  "Ética",
  "Técnica",
  "Transparência",
  "Responsabilidade",
  "Comprometimento",
  "Clareza",
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-black py-28 sm:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="mb-5 block text-sm uppercase tracking-[0.35em] text-gold">
            Sobre Nós
          </span>
          <h2 className="serif mx-auto max-w-5xl text-5xl font-light leading-tight text-white md:text-7xl">
            Advocacia com técnica, ética e{" "}
            <span className="italic text-gradient-gold font-bold">presença real.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-xl font-light leading-relaxed text-zinc-300">
            Um escritório voltado para atendimento jurídico cuidadoso, comunicação clara e atuação estratégica em defesa dos direitos dos clientes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="mt-16 border-y border-gold/20 py-10"
        >
          <div className="grid gap-8 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.label} className="md:border-l md:border-white/10 md:first:border-l-0 md:pl-8 md:first:pl-0">
                <span className="text-xs uppercase tracking-[0.28em] text-gold/80">
                  {pillar.label}
                </span>
                <p className="mt-4 text-lg font-light leading-relaxed text-zinc-300">
                  {pillar.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16"
        >
          <div className="space-y-7 text-xl font-light leading-relaxed text-zinc-400">
            <p>
              A Frederico & Locatelli Advogados Associados é um escritório jurídico comprometido com a prestação de serviços advocatícios pautados na ética, técnica e responsabilidade profissional.
            </p>
            <p>
              Com atuação direcionada principalmente ao Direito Previdenciário e Direito Bancário, oferecemos assessoria jurídica a pessoas físicas que buscam a efetivação de seus direitos junto à Previdência Social e a proteção contra práticas abusivas e fraudes no sistema financeiro.
            </p>
            <p>
              Nossa atuação é voltada tanto à esfera administrativa quanto judicial, sempre com foco na análise individualizada de cada caso e na adoção de estratégias jurídicas adequadas às necessidades de cada cliente.
            </p>
          </div>

          <div className="border border-white/10 bg-zinc-950/70 p-8 sm:p-10">
            <div>
              <h3 className="text-sm uppercase tracking-[0.3em] text-gold">Missão</h3>
              <p className="mt-5 text-lg font-light leading-relaxed text-zinc-300">
                Prestar serviços jurídicos com excelência técnica, ética e comprometimento, garantindo orientação clara e atuação responsável na defesa dos direitos dos clientes.
              </p>
            </div>

            <div className="my-9 h-px bg-white/10" />

            <div>
              <h3 className="text-sm uppercase tracking-[0.3em] text-gold">Visão</h3>
              <p className="mt-5 text-lg font-light leading-relaxed text-zinc-300">
                Ser reconhecido como um escritório de referência regional nas áreas de Direito Previdenciário e Direito Bancário, destacando-se pela confiança, transparência e eficiência.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.16 }}
          className="mt-16 border-t border-white/10 pt-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr] lg:items-start">
            <div>
              <span className="text-sm uppercase tracking-[0.3em] text-gold">Nossos Valores</span>
              <p className="mt-4 max-w-sm text-base font-light leading-relaxed text-zinc-400">
                Princípios que orientam a forma como o escritório atende, comunica e conduz cada demanda.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-5 lg:justify-end">
              {values.map((value, index) => (
                <span
                  key={value}
                  className={[
                    "serif relative text-3xl font-light leading-none md:text-5xl",
                    index % 2 === 0 ? "italic text-gradient-gold font-bold" : "text-white",
                  ].join(" ")}
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
