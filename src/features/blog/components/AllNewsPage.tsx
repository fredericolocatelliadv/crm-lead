"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, User } from "lucide-react";

import FloatingWhatsApp from "@/features/site/components/FloatingWhatsApp";
import Footer from "@/features/site/components/Footer";
import Navbar from "@/features/site/components/Navbar";
import type { News } from "@/shared/types/content";

const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function AllNewsPage({
  categories,
  news,
}: {
  categories: string[];
  news: News[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const categoryOptions = ["Todas", ...categories];

  const filteredNews =
    selectedCategory === "Todas"
      ? news
      : news.filter((item) => item.category === selectedCategory);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col selection:bg-gold selection:text-black overflow-x-clip">
      <Navbar solid />

      <main className="flex-1 pt-48 pb-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="mb-16">
            <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">
              Blog Jurídico
            </span>
            <h1 className="serif text-4xl md:text-6xl font-light mb-6">
              Todas as{" "}
              <span className="text-gradient-gold font-bold">Notícias</span>
            </h1>
            <div className="w-20 h-[1px] bg-gold"></div>
          </div>

          {categoryOptions.length > 1 ? (
            <div className="mb-12 flex flex-wrap gap-3">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 text-sm uppercase tracking-widest transition-all ${
                    selectedCategory === category
                      ? "bg-gold text-black font-bold"
                      : "bg-zinc-950 text-zinc-400 hover:text-white border border-white/10 hover:border-gold/30"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          ) : null}

          {filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredNews.map((item, index) => (
                <motion.a
                  href={`/noticias/${item.slug || item.id}`}
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group cursor-pointer block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden mb-6">
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
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-white/5 bg-zinc-950">
              <p className="text-zinc-600 italic">
                Nenhuma notícia encontrada nesta categoria.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
