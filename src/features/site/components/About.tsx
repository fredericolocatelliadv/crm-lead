"use client";

import { motion } from 'motion/react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-black overflow-x-clip">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="aspect-3/4 overflow-hidden border border-gold/20">
            <img 
              src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1000" 
              alt="Escritório" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-10 right-0 lg:-right-10 w-64 h-64 bg-gold/5 border border-gold/10 -z-10"></div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">Sobre Nós</span>
          <h2 className="serif text-4xl md:text-5xl font-light mb-8 leading-tight">
            Compromisso com a <br />
            <span className="italic text-gradient-gold font-bold">Ética e Excelência</span>
          </h2>
          <p className="text-zinc-400 text-lg font-light leading-relaxed mb-6">
            A Frederico & Locatelli Advogados Associados é um escritório jurídico comprometido com a prestação de serviços advocatícios pautados na ética, técnica e responsabilidade profissional.
          </p>
          <p className="text-zinc-400 text-lg font-light leading-relaxed mb-6">
            Com atuação direcionada principalmente ao Direito Previdenciário e Direito Bancário, oferecemos assessoria jurídica a pessoas físicas que buscam a efetivação de seus direitos junto à Previdência Social e a proteção contra práticas abusivas e fraudes no sistema financeiro.
          </p>
          <p className="text-zinc-400 text-lg font-light leading-relaxed mb-10">
            Nossa atuação é voltada tanto à esfera administrativa quanto judicial, sempre com foco na análise individualizada de cada caso e na adoção de estratégias jurídicas adequadas às necessidades de cada cliente.
          </p>
          
          {/* Mission & Vision */}
          <div className="border-t border-white/5 pt-8 mb-8 space-y-6">
            <div>
              <h3 className="text-gold text-sm uppercase tracking-[0.3em] mb-3">Missão</h3>
              <p className="text-zinc-400 font-light text-base leading-relaxed">
                Prestar serviços jurídicos com excelência técnica, ética e comprometimento, garantindo orientação clara e atuação responsável na defesa dos direitos dos clientes.
              </p>
            </div>
            <div>
              <h3 className="text-gold text-sm uppercase tracking-[0.3em] mb-3">Visão</h3>
              <p className="text-zinc-400 font-light text-base leading-relaxed">
                Ser reconhecido como um escritório de referência regional nas áreas de Direito Previdenciário e Direito Bancário, destacando-se pela confiança, transparência e eficiência.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="border-t border-white/5 pt-8">
            <h3 className="text-gold text-sm uppercase tracking-[0.3em] mb-6">Nossos Valores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-gold text-lg">✓</span>
                <div>
                  <h4 className="text-white text-base font-medium mb-1">Ética Profissional</h4>
                  <p className="text-zinc-500 text-sm">Respeito às normas legais e princípios da advocacia</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gold text-lg">✓</span>
                <div>
                  <h4 className="text-white text-base font-medium mb-1">Comprometimento</h4>
                  <p className="text-zinc-500 text-sm">Dedicação individualizada a cada caso</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gold text-lg">✓</span>
                <div>
                  <h4 className="text-white text-base font-medium mb-1">Transparência</h4>
                  <p className="text-zinc-500 text-sm">Comunicação clara em todas as etapas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gold text-lg">✓</span>
                <div>
                  <h4 className="text-white text-base font-medium mb-1">Excelência Técnica</h4>
                  <p className="text-zinc-500 text-sm">Atualização e aprimoramento constante</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gold text-lg">✓</span>
                <div>
                  <h4 className="text-white text-base font-medium mb-1">Responsabilidade</h4>
                  <p className="text-zinc-500 text-sm">Condução estratégica e organizada</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gold text-lg">✓</span>
                <div>
                  <h4 className="text-white text-base font-medium mb-1">Acessibilidade</h4>
                  <p className="text-zinc-500 text-sm">Direito compreensível ao cliente</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
