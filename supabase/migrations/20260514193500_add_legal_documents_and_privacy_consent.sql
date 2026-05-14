alter table public.site_settings
  add column if not exists privacy_contact_email text,
  add column if not exists legal_documents_version text not null default '1.0',
  add column if not exists legal_documents_updated_at timestamptz not null default now(),
  add column if not exists privacy_policy_content text not null default $$
## Política de Privacidade

Esta política explica como o escritório trata dados pessoais recebidos pelo site, WhatsApp e demais canais de contato.

### Dados coletados

Podemos coletar nome, telefone, e-mail, cidade, área de interesse, mensagem enviada, preferência de contato e informações técnicas de navegação quando houver consentimento para cookies opcionais.

### Finalidades

Os dados são usados para responder solicitações, organizar o atendimento, avaliar o assunto informado, registrar histórico comercial, melhorar a experiência no site e medir campanhas quando autorizado.

### Compartilhamento

Os dados podem ser tratados por fornecedores essenciais ao funcionamento do site, CRM, hospedagem, atendimento, mensuração e segurança, sempre de acordo com a finalidade necessária.

### Direitos do titular

O titular pode solicitar confirmação de tratamento, acesso, correção, atualização, eliminação quando aplicável, informações sobre compartilhamento e revisão de consentimentos.

### Segurança

O escritório adota medidas técnicas e administrativas para proteger os dados contra acesso não autorizado, perda, alteração indevida ou uso incompatível com as finalidades informadas.

### Contato

Solicitações relacionadas a dados pessoais podem ser enviadas pelos canais de contato informados no site.
$$,
  add column if not exists terms_of_use_content text not null default $$
## Termos de Uso

Estes termos orientam o uso do site do escritório.

### Natureza das informações

O conteúdo publicado no site tem finalidade informativa e institucional. O envio de formulário ou mensagem não cria, por si só, vínculo advogado-cliente nem substitui análise jurídica individualizada.

### Atendimento

As solicitações enviadas pelo site ou WhatsApp serão avaliadas pela equipe do escritório, que poderá solicitar informações complementares antes de qualquer orientação específica.

### Responsabilidades do usuário

O usuário deve fornecer informações verdadeiras, atualizadas e suficientes para que o atendimento inicial seja realizado com segurança.

### Propriedade intelectual

Textos, marcas, imagens e demais elementos do site pertencem ao escritório ou são utilizados de forma autorizada, sendo proibida a reprodução não autorizada.

### Alterações

O escritório poderá atualizar estes termos para refletir mudanças no site, nos canais de atendimento ou em exigências legais.
$$,
  add column if not exists cookie_policy_content text not null default $$
## Política de Cookies

Esta política explica como cookies e tecnologias semelhantes podem ser usados no site.

### Cookies necessários

São usados para funcionamento básico, segurança, formulários, prevenção de abuso e recursos essenciais do site. Esses cookies não dependem de consentimento opcional.

### Cookies de medição

Quando autorizados, ajudam a entender visitas, páginas acessadas, origem de tráfego e desempenho de campanhas, sem envio intencional de dados sensíveis do atendimento jurídico.

### Cookies de marketing

Quando autorizados, podem ser usados por ferramentas como Google e Meta para mensurar conversões e melhorar campanhas de mídia.

### Gerenciamento

O usuário pode aceitar, recusar ou ajustar preferências de cookies opcionais pelo aviso exibido no site e pelos controles do navegador.

### Atualizações

Esta política poderá ser atualizada sempre que houver mudança relevante nas ferramentas utilizadas pelo site.
$$;

alter table public.leads
  add column if not exists privacy_policy_version text,
  add column if not exists privacy_notice_accepted_at timestamptz,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz;

create index if not exists leads_marketing_consent_idx
  on public.leads (marketing_consent)
  where marketing_consent is true;

create index if not exists leads_privacy_notice_accepted_at_idx
  on public.leads (privacy_notice_accepted_at)
  where privacy_notice_accepted_at is not null;
