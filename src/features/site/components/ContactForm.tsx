"use client";

import { useState, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';
import { motion } from 'motion/react';
import type { LegalAreaOption } from '@/features/leads/types/legal-area';
import { readMarketingAttribution } from '@/features/site/lib/marketing-attribution';
import { trackLeadConversion } from '@/features/site/lib/marketing-events';
import { formatBrazilianPhone, getBrazilianPhoneError } from '@/features/site/lib/phone';

type ContactChannel = 'email' | 'phone' | 'whatsapp';

export type ContactFormValues = {
  bestContactTime: string;
  email: string;
  legalArea: string;
  message: string;
  marketingConsent: boolean;
  name: string;
  phone: string;
  preferredContactChannel: ContactChannel;
  website: string;
};

type ContactFormProps = {
  compact?: boolean;
  legalAreas: LegalAreaOption[];
  onSuccess?: (values: ContactFormValues) => void;
};

const contactChannelOptions: Array<{ label: string; value: ContactChannel }> = [
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'E-mail', value: 'email' },
  { label: 'Ligação telefônica', value: 'phone' },
];

const initialFormData: ContactFormValues = {
  bestContactTime: '',
  email: '',
  legalArea: '',
  message: '',
  marketingConsent: false,
  name: '',
  phone: '',
  preferredContactChannel: 'whatsapp',
  website: '',
};

export default function ContactForm({ compact = false, legalAreas, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextPhoneError = getBrazilianPhoneError(formData.phone);

    if (nextPhoneError) {
      setPhoneError(nextPhoneError);
      return;
    }

    setStatus('submitting');
    
    try {
      const response = await fetch('/api/leads/site', {
        body: JSON.stringify({
          ...formData,
          marketingAttribution: readMarketingAttribution(),
          privacyNoticeAccepted: true,
          source: 'site',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) throw new Error('Não foi possível enviar o agendamento.');
      
      const submitted = formData;
      setStatus('success');
      setFormData(initialFormData);
      setPhoneError(null);
      trackLeadConversion({
        formType: 'appointment',
        legalArea: submitted.legalArea || null,
        source: 'site',
      });
      onSuccess?.(submitted);
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      setFormData({ ...formData, [name]: e.target.checked });
      return;
    }

    if (name === 'phone') {
      const formattedPhone = formatBrazilianPhone(value);
      setFormData({ ...formData, phone: formattedPhone });
      setPhoneError(getBrazilianPhoneError(formattedPhone));
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const title = 'Solicite seu agendamento';
  const description = 'Preencha os dados abaixo e nossa equipe retornará pelo canal escolhido.';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-black text-left shadow-2xl max-w-3xl mx-auto border border-gold/20 relative overflow-hidden ${compact ? 'p-5 sm:p-6' : 'p-8 md:p-12'}`}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light"></div>
      
      <h3 className={`serif text-gold mb-2 font-light ${compact ? 'text-2xl' : 'text-3xl'}`}>
        {title}
      </h3>
      <p className={`text-zinc-400 font-light ${compact ? 'mb-5 text-sm' : 'mb-8 text-base'}`}>
        {description}
      </p>
      
      {status === 'success' ? (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 text-center">
          <p className="font-medium mb-2">Agendamento solicitado com sucesso!</p>
          <p className="text-base opacity-80">Nossa equipe recebeu seus dados e dará sequência ao atendimento.</p>
        </div>
      ) : status === 'error' ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 text-center">
          <p className="font-medium mb-2">Ocorreu um erro ao solicitar o agendamento.</p>
          <p className="text-base opacity-80">Por favor, tente novamente ou nos chame no WhatsApp.</p>
          <button onClick={() => setStatus('idle')} className="mt-4 text-sm underline">Tentar novamente</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? 'gap-4 mb-4' : 'gap-6 mb-6'}`}>
            <div>
              <label htmlFor="name" className="block text-zinc-500 text-xs uppercase tracking-widest mb-2">Nome Completo</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required disabled={status === 'submitting'} className="w-full bg-zinc-950 border border-white/10 p-4 text-white focus:border-gold outline-none transition-colors disabled:opacity-50" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-zinc-500 text-xs uppercase tracking-widest mb-2">WhatsApp / Telefone</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" aria-invalid={Boolean(phoneError)} aria-describedby={phoneError ? 'phone-error' : undefined} disabled={status === 'submitting'} className="w-full bg-zinc-950 border border-white/10 p-4 text-white placeholder:text-zinc-700 focus:border-gold outline-none transition-colors disabled:opacity-50" />
              {phoneError ? (
                <p id="phone-error" className="mt-2 text-sm text-red-400">{phoneError}</p>
              ) : null}
            </div>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? 'gap-4 mb-4' : 'gap-6 mb-6'}`}>
            <div>
              <label htmlFor="email" className="block text-zinc-500 text-xs uppercase tracking-widest mb-2">E-mail</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} disabled={status === 'submitting'} className="w-full bg-zinc-950 border border-white/10 p-4 text-white focus:border-gold outline-none transition-colors disabled:opacity-50" />
            </div>
            <div>
              <label htmlFor="legalArea" className="block text-zinc-500 text-xs uppercase tracking-widest mb-2">Área jurídica</label>
              <select id="legalArea" name="legalArea" value={formData.legalArea} onChange={handleChange} required disabled={status === 'submitting'} className="w-full bg-zinc-950 border border-white/10 p-4 text-white focus:border-gold outline-none transition-colors disabled:opacity-50">
                <option value="">Selecione uma área</option>
                {legalAreas.map((area) => (
                  <option key={area.id} value={area.name}>{area.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? 'gap-4 mb-4' : 'gap-6 mb-6'}`}>
            <div>
              <label htmlFor="preferredContactChannel" className="block text-zinc-500 text-xs uppercase tracking-widest mb-2">Preferência de retorno</label>
              <select id="preferredContactChannel" name="preferredContactChannel" value={formData.preferredContactChannel} onChange={handleChange} required disabled={status === 'submitting'} className="w-full bg-zinc-950 border border-white/10 p-4 text-white focus:border-gold outline-none transition-colors disabled:opacity-50">
                {contactChannelOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="bestContactTime" className="block text-zinc-500 text-xs uppercase tracking-widest mb-2">Melhor horário</label>
              <input type="text" id="bestContactTime" name="bestContactTime" value={formData.bestContactTime} onChange={handleChange} placeholder="Ex.: manhã, tarde ou após 18h" disabled={status === 'submitting'} className="w-full bg-zinc-950 border border-white/10 p-4 text-white placeholder:text-zinc-700 focus:border-gold outline-none transition-colors disabled:opacity-50" />
            </div>
          </div>
          <div className={compact ? 'mb-5' : 'mb-8'}>
            <label htmlFor="message" className="block text-zinc-500 text-xs uppercase tracking-widest mb-2">Assunto / mensagem</label>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={compact ? 3 : 4} disabled={status === 'submitting'} className="w-full bg-zinc-950 border border-white/10 p-4 text-white focus:border-gold outline-none transition-colors resize-none disabled:opacity-50"></textarea>
          </div>
          <div className={compact ? 'mb-5 space-y-3' : 'mb-8 space-y-3'}>
            <p className="text-xs leading-5 text-zinc-500">
              Ao enviar, você declara ciência de que seus dados serão usados para retorno do atendimento,
              conforme a{' '}
              <Link href="/politica-de-privacidade" className="text-gold underline-offset-4 hover:underline">
                Política de Privacidade
              </Link>
              .
            </p>
            <label className="flex items-start gap-3 text-sm leading-6 text-zinc-400">
              <input
                type="checkbox"
                name="marketingConsent"
                checked={formData.marketingConsent}
                onChange={handleChange}
                disabled={status === 'submitting'}
                className="mt-1 h-4 w-4 accent-gold"
              />
              <span>
                Aceito receber comunicações informativas do escritório. Posso solicitar a retirada
                desse consentimento posteriormente.
              </span>
            </label>
          </div>
          <button type="submit" disabled={status === 'submitting'} className="w-full py-4 bg-gradient-to-r from-[#9A7135] via-[#E2B961] to-[#9A7135] text-black font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity duration-300 shadow-[0_0_30px_rgba(226,185,97,0.2)] disabled:opacity-70">
            {status === 'submitting' ? 'Enviando...' : <><Send className="w-4 h-4" /> Solicitar agendamento</>}
          </button>
        </form>
      )}
    </motion.div>
  );
}
