import { Calendar, User } from "lucide-react";

import FloatingWhatsApp from "@/features/site/components/FloatingWhatsApp";
import Footer from "@/features/site/components/Footer";
import Navbar from "@/features/site/components/Navbar";
import type { News } from "@/shared/types/content";

interface SingleNewsPageProps {
  news: News | null;
}

export default function SingleNewsPage({ news }: SingleNewsPageProps) {
  if (!news) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col overflow-x-clip">
        <Navbar solid />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="serif text-3xl text-gold mb-4">Ops!</h2>
          <p className="text-zinc-400 mb-8">Notícia não encontrada.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col selection:bg-gold selection:text-black overflow-x-clip">
      <Navbar solid />

      <main className="flex-1 pt-48 pb-24">
        <article className="max-w-3xl mx-auto px-5 sm:px-6">
          <header className="mb-12">
            <h1 className="serif text-3xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight break-words">
              {news.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs text-zinc-500 uppercase tracking-widest border-y border-white/10 py-4">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />{" "}
                {new Date(news.published_at || news.created_at).toLocaleDateString("pt-BR")}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" /> {news.author || "Escritório"}
              </span>
            </div>
          </header>

          {news.image_url ? (
            <div className="mb-12 aspect-[16/9] overflow-hidden border border-white/10">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : null}

          <div
            className="prose prose-invert prose-gold max-w-none font-light leading-relaxed text-zinc-300 
            [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-light [&_h2]:serif [&_h2]:mb-6 [&_h2]:mt-8 [&_h2]:text-gold
            [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:font-light [&_h3]:serif [&_h3]:mb-4 [&_h3]:mt-6 [&_h3]:text-white
            [&_p]:mb-4 [&_p]:text-base [&_p]:md:text-lg [&_p]:leading-relaxed [&_p]:break-words
            [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2
            [&_ol]:mb-6 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2
            [&_li]:text-base [&_li]:md:text-lg [&_li]:leading-relaxed [&_li]:break-words
            [&_strong]:text-gold [&_strong]:font-semibold
            [&_a]:text-gold [&_a]:underline [&_a]:hover:text-gold-light
            [&_img]:w-full [&_img]:h-auto [&_img]:my-6
            [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6
            overflow-hidden break-words"
          >
            <div dangerouslySetInnerHTML={{ __html: news.content }} />
          </div>
        </article>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
