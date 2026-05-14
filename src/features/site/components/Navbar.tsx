"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';

type NavbarProps = {
  solid?: boolean;
};

export default function Navbar({ solid = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const compact = solid || isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '/#home' },
    { name: 'O Escritório', href: '/#about' },
    { name: 'Equipe', href: '/#team' },
    { name: 'Áreas de Atuação', href: '/#services' },
    { name: 'Notícias', href: '/#news' },
    { name: 'Contato', href: '/#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 overflow-x-clip transition-all duration-500 ${compact ? 'bg-black/95 backdrop-blur-md py-3 md:py-4 border-b border-gold/20' : 'bg-transparent py-5 md:py-8'}`}>
      <div className={`max-w-7xl mx-auto flex items-center ${solid ? "justify-between gap-2 px-2 sm:gap-3 sm:px-4" : "justify-center gap-2 px-2 sm:gap-3 sm:px-4 xl:justify-between xl:gap-4 xl:px-6"}`}>
        <Link
          href="/#home"
          className={solid || isScrolled ? "block min-w-0 flex-1 xl:flex-none" : "block xl:flex-none"}
        >
          {solid ? (
            <>
              <Logo
                variant="branca-full"
                className="w-[calc(100vw-44px)] max-w-none sm:w-[520px] sm:max-w-[calc(100vw-80px)] xl:hidden"
              />
              <Logo
                variant="branca-full"
                className="hidden w-[360px] 2xl:w-[460px] xl:block"
              />
            </>
          ) : (
            <>
              {isScrolled ? (
                <Logo
                  variant="branca-full"
                  className="w-[calc(100vw-44px)] max-w-none sm:w-[520px] sm:max-w-[calc(100vw-80px)] xl:hidden"
                />
              ) : (
                <Logo
                  variant="branca"
                  className="w-[300px] max-w-[84vw] sm:w-[360px] xl:hidden"
                />
              )}
              <Logo 
                variant={compact ? "branca-full" : "branca"} 
                width={isScrolled ? 290 : 230}
                className="hidden xl:block"
              />
            </>
          )}
        </Link>

        <div className="hidden xl:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-xs lg:text-[13px] uppercase tracking-widest whitespace-nowrap hover:text-gold transition-colors duration-300">
              {link.name}
            </Link>
          ))}
          <Link href="/#contact" className="px-6 py-3 border border-gold text-gold text-xs lg:text-[13px] uppercase tracking-widest whitespace-nowrap hover:bg-gold hover:text-black transition-all duration-300">
            Agendar Consulta
          </Link>
        </div>

        <button className={`${!solid && !isScrolled ? "hidden" : "flex"} xl:hidden text-gold shrink-0`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full max-w-full bg-black border-b border-gold/20 p-8 flex flex-col gap-6 xl:hidden"
          >
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-base uppercase tracking-widest text-center">
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
