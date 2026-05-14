"use client";

import { motion } from "motion/react";
import { ArrowRight, Calendar, User } from "lucide-react";
import Link from "next/link";

import type { News } from "@/shared/types/content";

const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function NewsSection({ news }: { news: News[] }) {
  return (
    <section id="news" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">
              Blog Jurídico
            </span>
            <h2 className="serif text-4xl md:text-5xl font-light">
              Últimas Notícias e{" "}
              <span className="text-gradient-gold font-bold">Artigos</span>
            </h2>
            <div className="w-20 h-[1px] bg-gold mt-6"></div>
          </div>
          <Link
            href="/noticias"
            className="text-gold text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all duration-300"
          >
            Ver Todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {news.length > 0 ? (
            news.map((item, index) => (
              <motion.a
                href={`/noticias/${item.slug || item.id}`}
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer block"
              >
                <div className="relative aspect-[4/3] overflow-hidden mb-8">
                  <img
                    src={
                      item.image_url ||
                      `https://picsum.photos/seed/${item.id}/800/600`
                    }
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{" "}
                    {new Date(item.published_at || item.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {item.author || "Escritório"}
                  </span>
                </div>

                <h3 className="serif text-2xl mb-4 group-hover:text-gold transition-colors leading-tight">
                  {item.title}
                </h3>

                {item.category ? (
                  <span className="inline-block text-xs uppercase tracking-widest text-gold/80 mb-3 px-3 py-1 border border-gold/20 bg-gold/5">
                    {item.category}
                  </span>
                ) : null}

                <p className="text-zinc-500 text-base font-light line-clamp-3 mb-6 leading-relaxed">
                  {item.excerpt || stripHtml(item.content)}
                </p>

                <div className="w-10 h-[1px] bg-gold group-hover:w-full transition-all duration-500"></div>
              </motion.a>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-zinc-600 border border-white/5 italic">
              Nenhuma notícia publicada ainda.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
