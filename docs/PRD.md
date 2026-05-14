# PRD - CRM Juridico Comercial

## 1. Resumo

O projeto e uma plataforma comercial para escritorio de advocacia, formada por site publico, blog/noticias, captacao de leads, chatbot com IA, WhatsApp integrado e CRM operacional.

O foco e transformar visitantes e contatos de WhatsApp em leads organizados, atendimentos acompanhaveis e clientes convertidos.

## 2. Objetivo Principal

O sistema deve ajudar o escritorio a:

- captar mais clientes;
- automatizar o primeiro atendimento;
- organizar contatos;
- centralizar conversas do WhatsApp;
- acompanhar o andamento comercial do lead;
- aumentar conversao de contratos;
- manter blog/noticias como canal de autoridade e captacao.

## 3. Fora do Escopo

O sistema nao deve controlar:

- processos juridicos detalhados;
- andamento processual;
- tribunais;
- prazos juridicos internos;
- peticoes avancadas;
- gestao juridica profunda;
- financeiro completo;
- ERP juridico.

## 4. Produto

O produto possui duas areas principais:

- Area publica: site, blog/noticias, formulario, WhatsApp e entrada de leads.
- Area interna: CRM, leads, conversas, pipeline, clientes convertidos, indicadores e configuracoes essenciais.

## 5. Jornada Principal

1. Visitante entra no site.
2. Visitante entra em contato pelo formulario, WhatsApp ou chatbot.
3. IA coleta dados basicos quando aplicavel.
4. Sistema cria ou atualiza o lead.
5. Lead entra no pipeline.
6. Atendente humano assume quando necessario.
7. Conversa continua pelo WhatsApp dentro do CRM.
8. Lead e qualificado.
9. Lead vira cliente ou e marcado como perdido.
10. Cliente convertido e encaminhado ao sistema juridico interno do escritorio.

## 6. Site Publico

O site publico deve ser profissional, rapido, responsivo e focado em conversao.

Requisitos:

- home institucional;
- areas de atuacao;
- equipe;
- depoimentos;
- FAQ;
- blog/noticias;
- formulario de contato;
- WhatsApp flutuante;
- SEO tecnico basico;
- identidade visual consistente.

Alteracoes de copy, identidade visual, tema, cores ou layout dependem de pedido explicito.

## 7. Blog/Noticias

O blog/noticias deve apoiar autoridade, SEO e captacao.

Requisitos:

- listar posts publicados;
- pagina individual;
- categorias;
- imagem de capa quando existir;
- resumo;
- autor;
- data de publicacao;
- gerenciamento pelo CRM.

## 8. Chatbot com IA

A IA realiza o primeiro atendimento automatico e organiza informacoes.

A IA deve:

- cumprimentar;
- coletar dados basicos;
- identificar area juridica;
- identificar urgencia;
- resumir atendimento;
- classificar prioridade e potencial;
- encaminhar para humano.

A IA nao deve:

- prometer resultado;
- dar garantia juridica;
- fingir ser advogado;
- substituir analise humana.

## 9. Dados Coletados

- nome;
- telefone/WhatsApp;
- cidade;
- area juridica;
- descricao breve;
- urgencia;
- melhor horario de contato;
- origem do lead;
- resumo do atendimento;
- prioridade;
- potencial de conversao.

## 10. CRM

O CRM deve ser simples e focado em conversao de leads.

Modulos:

- dashboard;
- leads;
- pipeline;
- conversas;
- clientes convertidos;
- blog/noticias;
- usuarios e permissoes;
- configuracoes essenciais.

## 11. Pipeline

Etapas iniciais:

- Novo lead;
- Atendimento iniciado;
- Aguardando retorno;
- Em analise;
- Proposta enviada;
- Convertido;
- Perdido.

## 12. WhatsApp

Integracao prevista: Evolution API.

Requisitos:

- receber mensagens;
- enviar mensagens;
- persistir historico;
- vincular conversa ao lead;
- criar lead automaticamente quando necessario;
- permitir resposta humana pelo CRM;
- registrar status e responsavel quando disponivel.

## 13. Usuarios e Permissoes

Perfis iniciais:

- Administrador;
- Gestor;
- Atendente.

Regras:

- autenticacao via Supabase Auth;
- autorizacao por perfil;
- validacao server-side para operacoes sensiveis;
- RLS nas tabelas expostas.

## 14. Arquitetura

- Next.js 16 com App Router.
- TypeScript.
- Tailwind CSS.
- Feature First.
- Supabase como banco, auth, storage e realtime.
- Route handlers/server actions para integracoes sensiveis.
- Evolution API server-side.
- AI Studio/Gemini server-side.

## 15. Modelo de Dados Inicial

Tabelas candidatas:

- profiles;
- user_roles;
- departments;
- leads;
- lead_events;
- pipeline_stages;
- conversations;
- messages;
- contacts;
- customers;
- notes;
- attachments;
- quick_replies;
- ai_sessions;
- ai_messages;
- ai_classifications;
- whatsapp_instances;
- site_settings;
- blog_posts;
- blog_categories;
- team_members;
- testimonials;
- faqs.

## 16. Criterios de Sucesso

- Site publico funcionando.
- Blog/noticias funcionando.
- Todo lead criado fica salvo.
- Nenhuma mensagem de WhatsApp e perdida.
- Atendente identifica rapidamente quem precisa de resposta.
- Gestor acompanha volume, conversao e gargalos.
- Dados sensiveis nao vazam para o frontend.

## 17. Riscos

- WhatsApp ser chamado direto do browser.
- IA responder como advogado.
- Falta de RLS.
- Perda de mensagens por webhook mal tratado.
- Escopo virar ERP juridico.
- Painel crescer sem foco em conversao.
