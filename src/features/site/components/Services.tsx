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
    <section id="services" className="py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-20">
          <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">Especialidades</span>
          <h2 className="serif text-4xl md:text-5xl font-light">Áreas de Atuação</h2>
          <div className="w-20 h-px bg-gold mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-black border border-white/10 p-7 sm:p-10 group hover:border-gold/30 transition-all duration-500"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                <div className={`text-gold p-4 border ${service.color === 'blue' ? 'border-blue-500/20 bg-blue-500/5' : 'border-green-500/20 bg-green-500/5'} group-hover:scale-110 transition-transform duration-500`}>
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="serif text-2xl md:text-3xl mb-3 text-gradient-gold font-bold">
                    {service.title}
                  </h3>
                  <p className="text-zinc-400 text-base leading-relaxed font-light">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 mb-6 pl-2">
                {service.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-zinc-300 text-base font-light">{item}</span>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="border-t border-white/5 pt-6 mt-6">
                <p className="text-gold text-sm uppercase tracking-wider flex items-center gap-2 leading-relaxed">
                  <span className="w-2 h-2 bg-gold rounded-full"></span>
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
