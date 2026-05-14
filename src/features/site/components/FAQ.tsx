"use client";

import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase/browser';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const fetchFaqs = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('faqs')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true })
      .returns<FaqItem[]>();
    if (data) setFaqs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  if (loading) return null;
  if (faqs.length === 0) return null;

  return (
    <section className="py-24 bg-zinc-950 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">Dúvidas Frequentes</span>
          <h2 className="serif text-4xl md:text-5xl font-light">Perguntas e <span className="text-gradient-gold font-bold">Respostas</span></h2>
          <div className="w-20 h-[1px] bg-gold mx-auto mt-6"></div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-white/10 bg-black overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-medium text-lg pr-8">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-gold shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6 pt-0 text-zinc-400 text-base font-light leading-relaxed border-t border-white/5 mt-2">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
