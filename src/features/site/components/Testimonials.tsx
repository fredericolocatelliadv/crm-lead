"use client";

import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase/browser';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  image?: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true })
      .returns<Testimonial[]>();
    if (data) setTestimonials(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  if (loading) return null;
  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">Confiança</span>
          <h2 className="serif text-4xl md:text-5xl font-light">O Que Dizem Nossos <span className="text-gradient-gold font-bold">Clientes</span></h2>
          <div className="w-20 h-[1px] bg-gold mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-950 p-10 border border-white/5 hover:border-gold/30 transition-colors duration-500 relative"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-white/5" />
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-zinc-400 font-light leading-relaxed mb-8 italic">
                &quot;{item.text}&quot;
              </p>
              <div className="flex items-center gap-4 mt-6">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover border border-gold/30" />
                )}
                <div>
                  <h4 className="text-white font-medium">{item.name}</h4>
                  <p className="text-gold text-xs uppercase tracking-widest mt-1">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
