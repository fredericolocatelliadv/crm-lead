# Análise do Sistema Real

Data da análise: 14/05/2026

Projeto Supabase auditado: `crm_lead` (`ykkvwhsjqimcwraryaxw`)

Pasta do projeto: `C:\app\frederico-locatelli-site`

Repositório remoto: `https://github.com/fredericolocatelliadv/crm-lead.git`

## Resumo Executivo

O sistema está em fase de desenvolvimento, mas já possui uma base comercial funcional: site público, blog, captação de leads, CRM, WhatsApp via Evolution API, IA com Gemini, SEO/marketing, documentos legais, consentimento de cookies e perfil do usuário.

A etapa mais recente entregue foi a área de perfil no CRM, com upload de foto para Supabase Storage, menu de perfil no topo e menu lateral recolhível. O código foi validado com typecheck, lint e build antes do envio ao GitHub.

O fluxo WhatsApp + IA também foi testado em cenário real de desenvolvimento: QR Code conectou, mensagens foram recebidas no CRM, respostas foram enviadas, a IA respondeu automaticamente e o controle humano por `Assumir`/`Pausar IA` interrompeu a automação sem bloquear novas mensagens.

## Escopo do Produto Atual

O produto é uma plataforma comercial jurídica. Ele existe para captar, atender, qualificar e converter leads.

Áreas existentes:

- site público institucional;
- blog/notícias;
- formulários públicos;
- captura rápida antes de abrir WhatsApp do site;
- CRM com dashboard, leads, pipeline, conversas, WhatsApp, clientes, blog, relatórios, usuários e configurações;
- assistente IA configurável;
- perfil do usuário;
- SEO, marketing e privacidade configuráveis pelo painel.

Fora do escopo:

- ERP jurídico;
- processos judiciais;
- andamentos processuais;
- petições;
- prazos jurídicos internos;
- financeiro completo.

## Estado Atual do Banco

Consulta agregada executada pelo MCP Supabase em 14/05/2026, sem expor dados pessoais nem corpo de mensagens.

| Tabela | Registros |
|---|---:|
| `ai_classifications` | 4 |
| `ai_messages` | 9 |
| `ai_sessions` | 2 |
| `attachments` | 0 |
| `blog_categories` | 3 |
| `blog_posts` | 0 |
| `business_hours` | 7 |
| `contacts` | 1 |
| `conversations` | 1 |
| `customers` | 0 |
| `departments` | 4 |
| `lead_events` | 18 |
| `leads` | 1 |
| `legal_areas` | 2 |
| `messages` | 12 |
| `notes` | 0 |
| `pipeline_stages` | 7 |
| `profiles` | 1 |
| `quick_replies` | 0 |
| `site_settings` | 1 |
| `user_roles` | 1 |
| `whatsapp_connection_events` | 71 |
| `whatsapp_instances` | 1 |

Observação: os dados acima são de desenvolvimento/teste. Eles servem para validar fluxo e estrutura, não para medir operação real de campanha.

## Storage

Buckets verificados:

| Bucket | Público | Limite | Uso |
|---|---:|---:|---|
| `blog-covers` | Sim | 5 MB | Capas de notícias/blog |
| `crm-attachments` | Não | 10 MB | Anexos de conversas e atendimento |
| `profile-avatars` | Sim | 3 MB | Fotos de perfil dos usuários |
| `site-images` | Sim | 5 MB | Imagens do site público |

O bucket `profile-avatars` possui policies para usuários autenticados selecionarem, enviarem, atualizarem e removerem objetos. O upload de avatar é feito por Server Action, com validação de tamanho e tipo de arquivo.

## Jornada Técnica Principal

### Site público

1. Visitante acessa o site.
2. Site captura origem, página de entrada e parâmetros de campanha quando existirem.
3. Visitante envia formulário de agendamento ou captura rápida do WhatsApp.
4. Lead é criado com origem adequada.
5. Eventos de marketing são disparados somente se permitidos e sem dados pessoais.
6. Consentimentos são registrados quando aplicável.

### WhatsApp

1. Evolution API recebe ou envia mensagem pelo número conectado.
2. Webhook server-side processa o evento.
3. Mensagem recebida é salva antes da IA.
4. Sistema resolve contato, lead e conversa.
5. Se não existir lead, cria lead com origem `whatsapp`.
6. Se a IA estiver ativa para a conversa, Gemini gera resposta segura.
7. Resposta automática é enviada e registrada no CRM.
8. Humano pode assumir ou pausar a IA a qualquer momento.

### IA

1. Configuração da assistente é lida do banco.
2. Modelo atual: Gemini 2.5 Flash.
3. Prompt combina operação, comportamento, contexto e limites do escritório.
4. Resposta é validada em estrutura controlada.
5. Sistema salva mensagem, sessão e classificação.
6. Chat exibe selo de IA e botão de resumo.
7. Quando humano assume, a automação para naquela conversa.

### Perfil

1. Usuário abre `/crm/perfil`.
2. Edita dados básicos.
3. Opcionalmente envia foto.
4. Server Action valida arquivo e usuário autenticado.
5. Foto é salva em `profile-avatars`.
6. Caminho do objeto fica em `profiles.avatar_storage_path`.
7. Avatar anterior é removido quando substituído.

## O Que Já Está Feito

### Produto

- Site público preservando identidade visual do escritório.
- Blog/notícias preparado.
- CRM operacional.
- Dashboard comercial.
- Leads e pipeline.
- Conversas com contexto comercial.
- Clientes convertidos com histórico preservado.
- Relatórios simples.
- Usuários, permissões e configurações.
- Área de perfil do usuário.

### WhatsApp

- Integração server-side com Evolution API.
- Página de conexão no CRM.
- QR Code funcional em teste.
- Recebimento e envio de mensagens.
- Controle de desativar, reativar, desconectar e excluir.
- Persistência de mensagens antes de automação.
- Criação automática de lead por WhatsApp.
- Prevenção de lead duplicado por mensagem enviada pela própria empresa.

### IA

- Página `/crm/ia`.
- Configurações por abas funcionais.
- Gemini 2.5 Flash configurado.
- Teste da assistente pelo painel.
- Resposta automática no WhatsApp.
- Persistência em `ai_sessions`, `ai_messages` e `ai_classifications`.
- Botão `Resumo da IA` em modal.
- Botões `Assumir` e `Pausar IA` por conversa.

### Marketing, SEO e Privacidade

- Campos de configuração para GTM, GA4, Meta Pixel e verificações de domínio.
- Rastreamento fora do CRM.
- Eventos de conversão sem dados pessoais.
- UTMs e parâmetros de campanha preservados no lead.
- Sitemap e robots.
- Metadata e Open Graph.
- Documentos legais públicos.
- Banner de cookies com personalização em modal.

## Pontos Pendentes

Prioridade alta antes de produção:

- ativar proteção contra senhas vazadas no Supabase Auth;
- revisar grants do role `anon`;
- revisar documentos legais com o escritório;
- testar GTM/GA4/Meta Pixel com IDs reais de homologação;
- confirmar payloads de marketing no navegador;
- testar falhas do Gemini e da Evolution;
- validar visualmente fluxo de upload de avatar autenticado;
- revisar rate limit/captcha nos endpoints públicos.

Prioridade média:

- criar testes automatizados para deduplicação de lead/conversa;
- testar cliente convertido falando novamente;
- testar lead perdido voltando;
- testar pergunta jurídica complexa;
- testar tentativa de promessa de resultado pela IA;
- avaliar fila/job assíncrono para IA em produção.

## Riscos Técnicos

- Webhook chamar IA durante processamento síncrono pode ficar frágil se o Gemini demorar.
- Estado local do WhatsApp pode ficar defasado se a Evolution mudar sem webhook.
- Grants amplos para `anon` dependem demais de RLS.
- Textos legais precisam revisão humana final.
- Campanhas reais exigem validação de eventos com ferramentas do Google e Meta.

## Regras Para Próxima Implementação

- Ler `AGENTS.md` antes de alterar o projeto.
- Usar `TODO.md` como checklist atual.
- Não transformar o CRM em ERP jurídico.
- Não chamar Evolution API nem Gemini pelo browser.
- Salvar mensagem recebida antes de IA.
- Não criar lead novo para mensagem `fromMe`.
- Preservar histórico ao converter lead em cliente.
- Não enviar dados pessoais para Google ou Meta.
- Criar migration limpa para qualquer mudança de schema.
- Validar com `npm.cmd run typecheck`, `npm.cmd run lint` e `npm.cmd run build` quando houver alteração de código.

## Validação Recente Registrada

Antes da última publicação no GitHub:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Resultado registrado: os três comandos passaram.

Validações Supabase registradas nesta atualização documental:

- contagem agregada das principais tabelas;
- buckets de Storage;
- policies do bucket `profile-avatars`.
