import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MessageCircle,
  Scale,
  Tag,
  User,
} from "lucide-react";

import FloatingWhatsApp from "@/features/site/components/FloatingWhatsApp";
import Footer from "@/features/site/components/Footer";
import Navbar from "@/features/site/components/Navbar";
import WhatsAppLeadCapture from "@/features/site/components/WhatsAppLeadCapture";
import type { News } from "@/shared/types/content";

interface SingleNewsPageProps {
  news: News | null;
  relatedNews?: News[];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getReadingTime(content: string) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export default function SingleNewsPage({ news, relatedNews = [] }: SingleNewsPageProps) {
  if (!news) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col overflow-x-clip">
        <Navbar solid />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="serif text-3xl text-gold mb-4">Ops!</h2>
          <p className="text-zinc-400 mb-8">Notícia não encontrada.</p>
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 border border-gold px-5 py-3 text-xs uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para notícias
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const articleDate = formatDate(news.published_at || news.created_at);
  const category = news.category || "Artigo jurídico";
  const readingTime = getReadingTime(news.content);
  const related = relatedNews.filter((item) => item.id !== news.id).slice(0, 3);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col selection:bg-gold selection:text-black overflow-x-clip">
      <Navbar solid />

      <main className="flex-1 pt-32 md:pt-40">
        <section className="border-b border-white/10">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 md:py-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <header>
              <Link
                href="/noticias"
                className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500 transition-colors hover:text-gold"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para notícias
              </Link>

              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                  <Tag className="h-3.5 w-3.5" />
                  {category}
                </span>
                <span className="inline-flex items-center gap-2 border border-white/10 bg-zinc-950 px-4 py-2 text-xs uppercase tracking-[0.22em] text-zinc-400">
                  <Clock className="h-3.5 w-3.5" />
                  {readingTime} min de leitura
                </span>
              </div>

              <h1 className="serif max-w-5xl text-4xl font-light leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                {news.title}
              </h1>

              {news.excerpt ? (
                <p className="mt-7 max-w-3xl text-lg font-light leading-8 text-zinc-400 md:text-xl">
                  {news.excerpt}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-white/10 py-5 text-xs uppercase tracking-widest text-zinc-500">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gold" />
                  {articleDate}
                </span>
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gold" />
                  {news.author || "Escritório"}
                </span>
              </div>
            </header>

            <aside className="border border-white/10 bg-zinc-950/70 p-6">
              <div className="mb-6 flex h-12 w-12 items-center justify-center border border-gold/30 bg-gold/10 text-gold">
                <Scale className="h-5 w-5" />
              </div>
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-gold">
                Precisa de orientação?
              </p>
              <h2 className="serif mb-4 text-2xl font-light leading-snug text-white">
                Converse com a equipe sobre o seu caso.
              </h2>
              <p className="mb-6 text-sm font-light leading-6 text-zinc-400">
                O atendimento inicial ajuda a organizar as informações e direcionar a análise com responsabilidade.
              </p>
              <WhatsAppLeadCapture
                buttonClassName="inline-flex w-full items-center justify-center gap-2 bg-gold px-5 py-4 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-gold-light"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com especialista
              </WhatsAppLeadCapture>
            </aside>
          </div>
        </section>

        {news.image_url ? (
          <section className="border-b border-white/10 bg-zinc-950/50">
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
              <div className="aspect-[16/7] overflow-hidden border border-white/10">
                <img
                  src={news.image_url}
                  alt={news.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="border-b border-white/10">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[minmax(0,760px)_320px] lg:gap-20">
            <article>
              <div
                className="max-w-none font-light leading-relaxed text-zinc-300
                [&_h2]:serif [&_h2]:mb-6 [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:font-light [&_h2]:leading-tight [&_h2]:text-gold md:[&_h2]:text-4xl
                [&_h3]:serif [&_h3]:mb-4 [&_h3]:mt-10 [&_h3]:text-2xl [&_h3]:font-light [&_h3]:text-white
                [&_p]:mb-6 [&_p]:text-[17px] [&_p]:leading-8 [&_p]:text-zinc-300 [&_p]:break-words md:[&_p]:text-lg
                [&_ul]:mb-8 [&_ul]:ml-0 [&_ul]:space-y-3 [&_ul]:border-l [&_ul]:border-gold/40 [&_ul]:pl-6
                [&_ol]:mb-8 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-3
                [&_li]:text-[17px] [&_li]:leading-8 [&_li]:text-zinc-300 [&_li]:break-words md:[&_li]:text-lg
                [&_strong]:font-semibold [&_strong]:text-gold
                [&_a]:text-gold [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-gold-light hover:[&_a]:underline
                [&_img]:my-8 [&_img]:h-auto [&_img]:w-full [&_img]:border [&_img]:border-white/10
                [&_blockquote]:my-10 [&_blockquote]:border-l-2 [&_blockquote]:border-gold [&_blockquote]:bg-zinc-950 [&_blockquote]:px-6 [&_blockquote]:py-5 [&_blockquote]:text-xl [&_blockquote]:italic [&_blockquote]:text-white
                overflow-hidden break-words"
              >
                <div dangerouslySetInnerHTML={{ __html: news.content }} />
              </div>

              <div className="mt-14 border-t border-white/10 pt-8">
                <p className="mb-5 text-sm font-light leading-6 text-zinc-500">
                  Este conteúdo tem caráter informativo e não substitui a análise individual de um profissional.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/noticias"
                    className="inline-flex items-center justify-center gap-2 border border-white/10 px-5 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-300 transition-colors hover:border-gold/60 hover:text-gold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Ver outras notícias
                  </Link>
                  <WhatsAppLeadCapture
                    buttonClassName="inline-flex items-center justify-center gap-2 border border-gold bg-gold px-5 py-4 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-gold-light"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Iniciar atendimento
                  </WhatsAppLeadCapture>
                </div>
              </div>
            </article>

            <aside className="lg:sticky lg:top-32 lg:self-start">
              <div className="border-l border-gold/40 pl-6">
                <p className="mb-4 text-xs uppercase tracking-[0.24em] text-gold">
                  Neste artigo
                </p>
                <h2 className="serif mb-5 text-2xl font-light leading-snug text-white">
                  {news.title}
                </h2>
                <div className="space-y-3 text-sm text-zinc-400">
                  <p className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gold" />
                    {category}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold" />
                    Leitura estimada de {readingTime} minuto{readingTime > 1 ? "s" : ""}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gold" />
                    {articleDate}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="bg-zinc-950/70 py-20">
            <div className="mx-auto max-w-7xl px-5 sm:px-6">
              <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <span className="mb-3 block text-xs uppercase tracking-[0.3em] text-gold">
                    Continue lendo
                  </span>
                  <h2 className="serif text-3xl font-light md:text-4xl">
                    Notícias relacionadas
                  </h2>
                </div>
                <Link
                  href="/noticias"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold transition-all hover:gap-4"
                >
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/noticias/${item.slug || item.id}`}
                    className="group border border-white/10 bg-black p-6 transition-colors hover:border-gold/50"
                  >
                    <span className="mb-4 inline-flex text-xs uppercase tracking-widest text-gold/80">
                      {item.category || "Artigo jurídico"}
                    </span>
                    <h3 className="serif mb-4 text-2xl font-light leading-snug transition-colors group-hover:text-gold">
                      {item.title}
                    </h3>
                    <p className="line-clamp-3 text-sm font-light leading-6 text-zinc-500">
                      {item.excerpt || stripHtml(item.content)}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 transition-colors group-hover:text-gold">
                      Ler artigo
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
