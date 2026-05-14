import ReactMarkdown from "react-markdown";

import Footer from "@/features/site/components/Footer";
import Navbar from "@/features/site/components/Navbar";

type LegalDocumentPageProps = {
  contactEmail?: string | null;
  content: string;
  description: string;
  title: string;
  updatedAt?: string | null;
  version: string;
};

export function LegalDocumentPage({
  contactEmail,
  content,
  description,
  title,
  updatedAt,
  version,
}: LegalDocumentPageProps) {
  return (
    <div className="min-h-screen overflow-x-clip bg-black text-white selection:bg-gold selection:text-black">
      <Navbar solid />
      <main className="border-b border-white/5 pt-44 md:pt-48">
        <section className="mx-auto max-w-4xl px-5 pb-20 sm:px-6 md:pb-28">
          <div className="mb-10 border-b border-white/10 pb-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Documentos legais
            </p>
            <h1 className="serif text-4xl font-light text-white md:text-6xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-400">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-widest text-zinc-500">
              <span>Versão {version}</span>
              {updatedAt ? <span>Atualizado em {formatDate(updatedAt)}</span> : null}
            </div>
          </div>

          <article className="legal-document space-y-6 text-zinc-300">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="serif pt-4 text-3xl font-light text-gold">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="pt-4 text-base font-semibold uppercase tracking-widest text-white">
                    {children}
                  </h3>
                ),
                li: ({ children }) => (
                  <li className="ml-5 list-disc text-base leading-8 text-zinc-300">{children}</li>
                ),
                p: ({ children }) => (
                  <p className="text-base leading-8 text-zinc-300">{children}</p>
                ),
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                ul: ({ children }) => <ul className="space-y-2">{children}</ul>,
              }}
            >
              {content}
            </ReactMarkdown>
          </article>

          {contactEmail ? (
            <div className="mt-12 border-t border-white/10 pt-8">
              <p className="text-sm leading-6 text-zinc-400">
                Solicitações relacionadas a dados pessoais podem ser enviadas para{" "}
                <a className="text-gold underline-offset-4 hover:underline" href={`mailto:${contactEmail}`}>
                  {contactEmail}
                </a>
                .
              </p>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
