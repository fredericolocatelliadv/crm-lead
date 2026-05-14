"use client";

import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase/browser';
import { motion } from 'motion/react';
import { Mail, MessageCircle } from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from '@/shared/components/brand-icons';
import WhatsAppLeadCapture from '@/features/site/components/WhatsAppLeadCapture';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  oab?: string;
  image?: string;
  bio: string;
  linkedin?: string;
  email?: string;
  instagram?: string;
  whatsapp?: string;
}

export default function Team() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('team_members')
        .select('*')
        .eq('active', true)
        .order('position', { ascending: true })
        .returns<TeamMember[]>();
      if (data) setTeam(data);
      setLoading(false);
    };

    fetchTeam();
  }, []);

  if (loading) return null;
  if (team.length === 0) return null;

  return (
    <section id="team" className="py-24 bg-zinc-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-20">
          <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">Nossa Equipe</span>
          <h2 className="serif text-4xl md:text-5xl font-light">Sócios <span className="text-gradient-gold font-bold">Fundadores</span></h2>
          <div className="w-20 h-[1px] bg-gold mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {team.map((member, index) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group"
            >
              <div className="relative aspect-[3/4] overflow-hidden mb-6 border border-white/10">
                <img 
                  src={member.image || `https://picsum.photos/seed/${member.id}/800/1000`} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <div className="flex gap-3">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-gold/50 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all">
                        <LinkedinIcon className="w-4 h-4" />
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-gold/50 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all">
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {member.instagram && (
                      <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-gold/50 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all">
                        <InstagramIcon className="w-4 h-4" />
                      </a>
                    )}
                    {member.whatsapp && (
                      <WhatsAppLeadCapture
                        buttonClassName="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-gold/50 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all"
                        whatsappNumber={member.whatsapp}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </WhatsAppLeadCapture>
                    )}
                  </div>
                </div>
              </div>
              
              <h3 className="serif text-3xl mb-1 text-white">{member.name}</h3>
              <p className="text-gold text-xs uppercase tracking-widest mb-4">{member.role} {member.oab && `| ${member.oab}`}</p>
              <p className="text-zinc-400 font-light leading-relaxed text-base">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
