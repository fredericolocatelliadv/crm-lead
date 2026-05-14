"use client";


interface LogoProps {
  variant?: 'branca' | 'branca-full' | 'preta' | 'compacta-branca' | 'compacta-preta' | 'icon';
  className?: string;
  width?: number;
}

export default function Logo({ variant = 'branca', className = '', width }: LogoProps) {
  const logoMap = {
    'branca': '/logos/logo_branca.png',
    'branca-full': '/logos/logo_branca_full.png',
    'preta': '/logos/logo_preta.png',
    'compacta-branca': '/logos/logo_compacta_branca.png',
    'compacta-preta': '/logos/logo_compacta_preta.png',
    'icon': '/logos/logo_icon.png',
  };

  return (
    <img
      src={logoMap[variant]}
      alt="Frederico & Locatelli - Sociedade de Advogados"
      className={className}
      style={width ? { width: `${width}px`, height: 'auto' } : undefined}
    />
  );
}
