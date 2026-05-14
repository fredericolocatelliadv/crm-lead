"use client";

import { Fragment } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useSettings, formatWhatsApp } from '@/features/settings/hooks/use-settings';
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from '@/shared/components/brand-icons';
import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  const { settings } = useSettings();
  const canManageCookies = Boolean(settings?.cookieConsentEnabled);
  const openCookiePreferences = () => {
    window.dispatchEvent(new Event("fl:open-cookie-preferences"));
  };

  return (
    <footer id="contact" className="bg-zinc-950 pt-20 md:pt-24 pb-12 border-t border-white/5 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1.35fr] gap-12 lg:gap-14 mb-20">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-8">
              <Logo variant="branca-full" width={380} />
            </div>
            <p className="text-zinc-400 text-base leading-relaxed font-light mb-8">
              Escritório especializado em Direito Previdenciário e Direito Bancário. Atuação ética, técnica e comprometida com a defesa dos seus direitos.
            </p>
            <div className="flex gap-4">
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-gold transition-all duration-300">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {settings?.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-gold transition-all duration-300">
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-gold transition-all duration-300">
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {settings?.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-gold transition-all duration-300">
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="serif text-2xl mb-8 text-gold">Links Rápidos</h4>
            <ul className="space-y-4">
              {[
                { label: 'Início', href: '/#home' },
                { label: 'O Escritório', href: '/#about' },
                { label: 'Áreas de Atuação', href: '/#services' },
                { label: 'Notícias', href: '/noticias' },
                { label: 'Contato', href: '/#contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-zinc-400 hover:text-white transition-colors text-base font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="serif text-2xl mb-8 text-gold">Áreas de Atuação</h4>
            <ul className="space-y-4">
              <li>
                <a href="#services" className="text-zinc-400 hover:text-white transition-colors text-base font-light block mb-3">
                  <strong className="text-white">Direito Previdenciário</strong>
                </a>
                <ul className="ml-4 space-y-2 text-sm">
                  <li className="text-zinc-500">• Aposentadorias</li>
                  <li className="text-zinc-500">• Auxílio-doença</li>
                  <li className="text-zinc-500">• Pensão por morte</li>
                  <li className="text-zinc-500">• LOAS (BPC)</li>
                  <li className="text-zinc-500">• Revisões de benefícios</li>
                </ul>
              </li>
              <li className="pt-4">
                <a href="#services" className="text-zinc-400 hover:text-white transition-colors text-base font-light block mb-3">
                  <strong className="text-white">Direito Bancário</strong>
                </a>
                <ul className="ml-4 space-y-2 text-sm">
                  <li className="text-zinc-500">• Fraudes bancárias</li>
                  <li className="text-zinc-500">• Empréstimos indevidos</li>
                  <li className="text-zinc-500">• Cobranças abusivas</li>
                  <li className="text-zinc-500">• Revisão de contratos</li>
                </ul>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="serif text-2xl mb-8 text-gold">Contato</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-gold shrink-0" />
                <span className="text-zinc-400 text-base font-light leading-relaxed">
                  {settings?.address ? (
                    settings.address.split('\n').map((line, i) => <Fragment key={i}>{line}<br/></Fragment>)
                  ) : (
                    <>Atendimento Digital em Todo o Brasil<br />Sede: São Paulo, SP</>
                  )}
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-gold shrink-0" />
                <span className="text-zinc-400 text-base font-light">{formatWhatsApp(settings?.whatsapp) || '+55 (11) 99999-9999'}</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-gold shrink-0" />
                <span className="text-zinc-400 text-base font-light break-all">{settings?.email || 'contato@fredericolocatelli.adv.br'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col gap-6 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-start">
            <Link href="/politica-de-privacidade" className="text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-gold">
              Política de Privacidade
            </Link>
            <Link href="/termos-de-uso" className="text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-gold">
              Termos de Uso
            </Link>
            <Link href="/politica-de-cookies" className="text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-gold">
              Política de Cookies
            </Link>
            {canManageCookies ? (
              <button
                type="button"
                onClick={openCookiePreferences}
                className="text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-gold"
              >
                Gerenciar cookies
              </button>
            ) : null}
          </div>
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-zinc-500 text-xs uppercase tracking-widest leading-relaxed">
              © 2026 Frederico & Locatelli Advogados Associados. Todos os direitos reservados.
            </p>
            <p className="text-zinc-500 text-xs uppercase tracking-widest leading-relaxed">
              OAB/SP • Direito Previdenciário e Bancário
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
