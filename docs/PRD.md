# PRD - Plataforma Comercial Jurídica

Atualizado em: 15/05/2026

## 1. Resumo Executivo

O projeto é uma plataforma comercial para escritório de advocacia, composta por site público, blog/notícias, captação de leads, CRM, WhatsApp integrado pela Evolution API e primeiro atendimento automatizado com Gemini.

O produto não é um ERP jurídico. O foco é transformar visitantes, contatos de WhatsApp e campanhas pagas em leads organizados, atendimentos acompanháveis e clientes convertidos.

## 2. Objetivos do Produto

- Captar leads pelo site público, WhatsApp do site e WhatsApp conectado ao CRM.
- Organizar atendimento comercial em uma única caixa de conversas.
- Automatizar o primeiro contato com IA dentro de limites seguros.
- Classificar área jurídica, prioridade, potencial e necessidade de humano.
- Permitir que a equipe assuma, pause a IA, devolva a conversa para automação, responda e mova o lead no funil.
- Medir origem comercial, UTMs e eventos de conversão sem expor dados pessoais.
- Manter SEO, blog, documentos legais e rastreamento de marketing configuráveis pelo painel.

## 3. Fora do Escopo

O sistema não deve controlar:

- processos judiciais;
- andamentos processuais;
- prazos jurídicos internos;
- petições;
- financeiro completo;
- controle de tribunais;
- gestão jurídica profunda;
- ERP jurídico.

## 4. Público Usuário

- Administrador do escritório: configura operação, usuários, site, marketing, WhatsApp e IA.
- Gestor: acompanha leads, conversas, pipeline, relatórios e qualidade de atendimento.
- Atendente: responde contatos, assume conversas, registra notas e movimenta leads.
- Visitante do site: solicita atendimento, envia dados básicos e aceita ou recusa cookies opcionais.

## 5. Jornada Principal

1. Visitante chega pelo site, campanha, busca orgânica ou WhatsApp.
2. Sistema captura origem, página de entrada, UTMs e parâmetros de campanha quando existirem.
3. Visitante envia formulário de agendamento ou captura rápida de WhatsApp do site.
4. Sistema cria lead e registra consentimentos quando aplicável.
5. Contato também pode chegar direto pelo WhatsApp conectado.
6. Webhook salva a mensagem recebida antes de qualquer automação.
7. Quando a mensagem recebida for áudio, o sistema pode transcrever com Gemini no servidor e manter o anexo original no chat.
8. IA responde quando a conversa permite automação e as diretrizes autorizam.
9. IA registra resposta, resumo, classificação e alertas para a equipe.
10. Humano pode assumir ou pausar IA por conversa.
11. Lead avança no pipeline até conversão, perda ou reabertura.
12. Lead convertido vira cliente e preserva histórico comercial.

## 6. Site Público

O site público deve manter a identidade visual atual do escritório, com foco em autoridade, confiança e conversão.

Requisitos implementados ou previstos no produto:

- home institucional;
- áreas de atuação;
- equipe;
- notícias/blog;
- contato e agendamento;
- captura rápida antes de abrir WhatsApp;
- páginas de Política de Privacidade, Termos de Uso e Política de Cookies;
- banner de cookies com aceitar, recusar e personalizar;
- SEO técnico com metadata, canonical, Open Graph, sitemap e robots;
- rastreamento por Google Tag Manager, GA4 e Meta Pixel quando configurados;
- registro de UTMs e parâmetros como `gclid` e `fbclid`;
- ausência de scripts de marketing dentro do CRM.

## 7. CRM

O CRM é operacional e deve apoiar conversão comercial, sem virar sistema jurídico profundo.

Módulos principais:

- Dashboard;
- Leads;
- Pipeline;
- Conversas;
- WhatsApp;
- Clientes;
- Blog;
- Relatórios;
- Usuários;
- Configurações;
- Assistente IA;
- Perfil do usuário.

Regras de experiência:

- interface profissional, calma e objetiva;
- português brasileiro com acentuação correta;
- menu lateral recolhível;
- perfil do usuário acessível no topo, ao lado da troca de tema;
- ações críticas com confirmação clara para usuários leigos;
- formulários separados de listas e detalhes;
- estados vazios escritos para a operação do cliente, sem termos internos de desenvolvimento.
- conversa deve mostrar notas internas salvas em uma área própria, sem obrigar o operador a rolar o histórico inteiro;
- conversa deve indicar claramente se a IA está ativa, assistida, desativada no painel, pausada na conversa ou bloqueada por atendimento humano.

## 8. Leads, Pipeline e Clientes

Lead é o contato comercial ainda não convertido. Cliente é o lead convertido.

Regras principais:

- lead aberto aparece em leads, pipeline e conversas;
- lead perdido preserva histórico e pode ser reaberto;
- lead convertido preserva o registro comercial, mas a entidade principal passa a ser o cliente;
- pipeline deve representar oportunidade operacional, não histórico morto;
- conversa não cria status comercial paralelo;
- notas, mensagens e eventos preservam o histórico do atendimento.

Etapas comerciais iniciais:

- Novo lead;
- Atendimento iniciado;
- Aguardando retorno;
- Em análise;
- Proposta enviada;
- Convertido;
- Perdido.

## 9. WhatsApp

Integração utilizada: Evolution API, sempre pelo servidor.

Requisitos:

- conexão por QR Code;
- controle de conexão no CRM;
- ações de conectar, atualizar, desativar, reativar, desconectar e excluir;
- mensagens recebidas persistidas antes de IA ou automação;
- criação automática de contato e lead quando o telefone ainda não existir;
- reaproveitamento de conversa por contato e canal;
- envio humano de mensagens pelo CRM;
- recebimento e envio de texto, imagem e áudio;
- transcrição server-side de áudio recebido para permitir triagem pela IA;
- anexos em bucket privado;
- linguagem simples na tela, sem termos técnicos para o cliente final.

## 10. Assistente IA

Fornecedor atual: Google AI Studio/Gemini. Modelo operacional atual: Gemini 2.5 Flash.

A IA é uma assistente inicial do atendimento. Ela pode:

- cumprimentar;
- coletar nome, telefone, cidade, área jurídica, resumo do caso, urgência e melhor horário;
- responder de forma curta e segura;
- usar transcrição de áudio recebido pelo WhatsApp como mensagem de entrada;
- classificar área provável, prioridade e potencial;
- resumir o contato para a equipe;
- indicar quando precisa de humano;
- registrar mensagens automáticas com identificação no chat.

A IA não pode:

- prometer resultado;
- garantir êxito;
- fingir ser advogada;
- substituir análise jurídica humana;
- dar decisão jurídica complexa como orientação final.

Controles necessários:

- configuração de operação, modelo, comportamento, contexto, diretrizes e teste pelo CRM;
- botão para humano assumir atendimento;
- botão para pausar IA por conversa;
- botão para devolver conversa assumida por humano para a IA;
- sinalização no chat quando a IA estiver desativada no painel administrativo;
- ocultar ou bloquear ações locais de pausa quando a IA estiver desligada globalmente;
- modal de resumo/classificação da IA no chat;
- selo no chat para indicar quando uma mensagem de áudio possui transcrição;
- persistência em `ai_sessions`, `ai_messages` e `ai_classifications`;
- fallback seguro quando Gemini ou Evolution falhar.

## 11. SEO, Marketing e Privacidade

O produto deve permitir que a equipe configure marketing sem editar código.

Requisitos:

- campos controlados para Google Tag Manager, GA4, Meta Pixel, Google Search Console e verificação da Meta;
- opção para ativar ou pausar rastreamento;
- eventos de conversão sem dados pessoais;
- registro de origem e campanha no lead;
- banner de cookies com preferências;
- documentos legais editáveis;
- consentimento de privacidade e comunicação registrado no lead quando aplicável.

Regra de segurança: não permitir JavaScript livre inserido pelo usuário.

## 12. Perfil do Usuário

O CRM possui área de perfil em `/crm/perfil`.

Requisitos:

- atualizar nome, telefone, cargo e departamento;
- exibir dados básicos do usuário autenticado;
- permitir upload de foto de perfil;
- salvar avatar no Supabase Storage no bucket `profile-avatars`;
- preservar autorização server-side;
- não expor service role no browser.

## 13. Arquitetura Real

- Next.js 16 com App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui no CRM quando útil.
- lucide-react para ícones.
- Feature First por domínio.
- Supabase para Postgres, Auth, Storage e Realtime.
- Evolution API server-side.
- Gemini server-side.
- `src/proxy.ts` para proteção de rotas CRM.
- Route handlers e server actions para operações sensíveis.

## 14. Dados Principais

Entidades centrais:

- `profiles`;
- `user_roles`;
- `departments`;
- `leads`;
- `contacts`;
- `lead_events`;
- `pipeline_stages`;
- `conversations`;
- `messages`;
- `notes`;
- `attachments`;
- `customers`;
- `whatsapp_instances`;
- `whatsapp_connection_events`;
- `ai_sessions`;
- `ai_messages`;
- `ai_classifications`;
- `site_settings`;
- `blog_posts`;
- `blog_categories`;
- `legal_areas`;
- `business_hours`;
- `quick_replies`.

Buckets principais:

- `site-images`: imagens públicas do site;
- `blog-covers`: capas públicas do blog;
- `crm-attachments`: anexos privados de conversas;
- `profile-avatars`: fotos públicas de perfil.

## 15. Segurança e Privacidade

Requisitos:

- RLS ativo em tabelas expostas;
- permissões por perfil/role em tabela própria;
- service role somente no servidor;
- validação de entradas de formulários, webhooks e ações;
- webhook da Evolution com segredo;
- mensagens e dados jurídicos tratados como sensíveis;
- dados pessoais fora dos eventos de marketing;
- Storage com buckets e policies explícitas;
- revisão de grants do role `anon` antes de produção.

## 16. Critérios de Sucesso

- Todo lead de site ou WhatsApp fica salvo.
- Toda mensagem recebida pelo WhatsApp fica persistida antes de automação.
- IA responde somente quando a conversa permite e passa para humano quando necessário.
- Equipe consegue pausar IA ou assumir atendimento.
- Conversas mostram claramente o contexto comercial do lead.
- Pipeline mostra oportunidades operacionais.
- Cliente convertido preserva histórico comercial.
- Marketing mede conversões sem vazar dados pessoais.
- Configurações de SEO, rastreamento, IA, WhatsApp e perfil são feitas pelo CRM.

## 17. Riscos e Pendências

- Ativar proteção de senha vazada no Supabase Auth antes de produção.
- Testar GTM, GA4 e Meta Pixel com IDs reais de homologação.
- Revisar textos legais com o escritório antes de publicar em produção.
- Endurecer testes da IA para falha do Gemini, falha da Evolution, pergunta jurídica complexa e promessa de resultado.
- Revisar grants públicos do Supabase para aplicar menor privilégio.
- Considerar fila/job assíncrono para IA em produção se o webhook ficar lento.
