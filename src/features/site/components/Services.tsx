"use client";

import { motion } from 'motion/react';
import { ShieldCheck, CreditCard, CheckCircle } from 'lucide-react';

const services = [
  {
    title: 'Direito Previdenciário (INSS)',
    description: 'Atuação voltada à concessão, restabelecimento e revisão de benefícios previdenciários.',
    icon: <ShieldCheck className="w-10 h-10" />,
    color: 'blue',
    items: [
      'Aposentadorias',
      'Auxílio-doença / incapacidade',
      'Pensão por morte',
      'LOAS (BPC)',
      'Revisões de benefícios'
    ],
    note: 'Atendimento completo, do pedido administrativo à ação judicial.'
  },
  {
    title: 'Direito Bancário',
    description: 'Defesa de consumidores em conflitos com instituições financeiras.',
    icon: <CreditCard className="w-10 h-10" />,
    color: 'green',
    items: [
      'Fraudes bancárias (golpes, transações indevidas)',
      'Empréstimos não reconhecidos',
      'Cobranças abusivas',
      'Revisão de contratos'
    ],
    note: 'Atuação firme na proteção do seu patrimônio e na responsabilização de irregularidades.'
  },
];

export default function Services() {
  return (
    <section id="services" className="relative overflow-hidden bg-zinc-950 py-28 sm:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mb-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="mb-5 block text-sm uppercase tracking-[0.35em] text-gold">
              Especialidades
            </span>
            <h2 className="serif text-5xl font-light leading-tight text-white md:text-7xl">
              Áreas de{" "}
              <span className="italic text-gradient-gold font-bold">Atuação</span>
            </h2>
          </div>
          <p className="max-w-2xl text-xl font-light leading-relaxed text-zinc-400 lg:ml-auto">
            Atendimento jurídico direcionado para demandas previdenciárias e bancárias, com análise técnica, estratégia e linguagem clara para cada cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {services.map((service, index) => (
            <motion.div 
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative overflow-hidden border border-white/10 bg-black p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 sm:p-10"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 border border-gold/10 opacity-70 transition-transform duration-700 group-hover:rotate-6" />
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-gold/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative mb-10 flex items-start justify-between gap-6">
                <div className={`text-gold p-4 border ${service.color === 'blue' ? 'border-blue-500/20 bg-blue-500/5' : 'border-green-500/20 bg-green-500/5'} transition-transform duration-500 group-hover:scale-105`}>
                  {service.icon}
                </div>
                <span className="serif text-6xl font-light leading-none text-gold/20">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="serif mb-4 text-3xl font-bold text-gradient-gold md:text-4xl">
                {service.title}
              </h3>
              <p className="mb-8 text-lg font-light leading-relaxed text-zinc-400">
                {service.description}
              </p>

              <div className="mb-8 grid gap-3">
                {service.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <span className="text-base font-light text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gold/15 pt-6">
                <p className="flex items-center gap-3 text-sm uppercase leading-relaxed tracking-[0.18em] text-gold">
                  <span className="h-px w-8 bg-gold/70" />
                  {service.note}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
