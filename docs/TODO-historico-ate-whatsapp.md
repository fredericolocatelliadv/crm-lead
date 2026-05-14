# TODO - Etapas de Desenvolvimento

Este arquivo e a base operacional do desenvolvimento. Ele controla o que sera feito, o que esta em andamento e o que ja foi concluido.

Produto: site publico + blog/noticias + CRM juridico comercial focado em conversao de leads.

Escopo do CRM: dashboard, leads, pipeline, conversas, clientes convertidos, blog/noticias, usuarios/permissoes, configuracoes essenciais, WhatsApp e IA.

Fora do escopo: ERP juridico, controle processual, tribunais, prazos juridicos, peticoes, financeiro completo e qualquer modulo que nao ajude diretamente na captacao, atendimento ou conversao de leads.

## Legenda

- [x] Feito
- [ ] Pendente
- [~] Em andamento

## Fase 0 - Base do Projeto e Site Publico

Status: feito.

- [x] Criar projeto com Next.js 16.
- [x] Configurar TypeScript.
- [x] Configurar Tailwind CSS.
- [x] Configurar estrutura Feature First.
- [x] Criar site publico.
- [x] Criar rota `/`.
- [x] Criar rota `/noticias`.
- [x] Criar rota `/noticias/[id]`.
- [x] Configurar logos e identidade visual do site.
- [x] Ajustar legibilidade geral do site publico.
- [x] Ajustar logo do header e rodape.
- [x] Corrigir overflow horizontal no mobile.
- [x] Configurar Supabase publico no projeto local.
- [x] Confirmar acesso ao projeto Supabase `crm_lead`.
- [x] Confirmar build do projeto.

## Fase 1 - Etapa 1 de 12 - Preparacao do CRM

Objetivo: preparar a base visual, estrutural e tecnica do CRM antes de criar regras de negocio.

- [x] Criar grupo de rotas do CRM em `src/app/(crm)`.
- [x] Criar feature `dashboard`.
- [x] Criar feature `auth`.
- [x] Criar feature `users`.
- [x] Criar feature `leads`.
- [x] Criar feature `pipeline`.
- [x] Criar feature `conversations`.
- [x] Criar feature `customers`.
- [x] Criar feature `settings`.
- [x] Criar feature `reports`.
- [x] Criar pasta server-side para Supabase em `src/server/supabase`.
- [x] Criar pasta server-side para autenticacao/autorizacao em `src/server/auth`.
- [x] Criar helpers compartilhados em `src/shared/lib` somente quando usados por mais de uma feature.
- [x] Instalar e configurar `shadcn/ui` para uso exclusivo no CRM.
- [x] Definir componentes base do CRM com shadcn/ui: button, input, textarea, select, dialog, dropdown-menu, tabs, badge, card, table, sheet, separator, skeleton, toast/sonner.
- [x] Configurar suporte profissional a tema dark/light no CRM.
- [x] Definir tokens visuais do CRM para tema claro e escuro.
- [x] Definir variantes semanticas de badges para prioridade, status, etapa, origem, conversa e permissao.
- [x] Definir regra de layout: formularios sempre separados de listas, detalhes, previews e dados salvos.
- [x] Definir padrao de criacao/edicao em pagina, modal, drawer ou estado dedicado, nunca lado a lado com dados salvos.
- [x] Definir layout visual do CRM sem alterar o site publico.
- [x] Registrar regra para nunca exibir informacoes de programador no CRM do cliente.
- [x] Ajustar dashboard para ocupar melhor monitores largos sem grandes vazios no centro.
- [x] Remover rÃ³tulos internos/de desenvolvimento da interface do CRM.

## Fase 2 - Etapa 2 de 12 - Autenticacao, Usuarios e Permissoes

Objetivo: criar acesso seguro ao CRM usando Supabase Auth e perfis internos.

- [x] Criar tela de login do CRM.
- [x] Criar fluxo de logout.
- [x] Proteger rotas do CRM.
- [x] Criar modelo de perfil de usuario.
- [x] Criar modelo de roles.
- [x] Definir perfis iniciais: administrador, gestor, atendente.
- [x] Criar proxy/validacao server-side para acesso ao CRM.
- [x] Criar helper para obter usuario autenticado no servidor.
- [x] Criar helper para verificar permissao por role.
- [x] Garantir que operacoes sensiveis nao dependam apenas do frontend.
- [x] Preparar tela de usuarios no CRM.
- [x] Definir `admin@voxlabs.com.br` como administrador inicial.
- [x] Permitir listar usuarios autorizados.
- [x] Permitir alterar role somente com permissao de administrador.

## Fase 3 - Etapa 3 de 12 - Banco de Dados, RLS e Modelo Inicial

Objetivo: criar a estrutura de dados minima para o CRM funcionar com seguranca.

- [x] Criar tabela `profiles`.
- [x] Criar tabela `user_roles`.
- [x] Criar tabela `contacts`.
- [x] Criar tabela `leads`.
- [x] Criar tabela `lead_events`.
- [x] Criar tabela `pipeline_stages`.
- [x] Criar tabela `customers`.
- [x] Criar tabela `notes`.
- [x] Criar tabela `conversations`.
- [x] Criar tabela `messages`.
- [x] Criar tabela `attachments`.
- [x] Criar tabela `blog_categories`.
- [x] Criar tabela `blog_posts`.
- [x] Criar tabela `site_settings`.
- [x] Criar tabela `team_members`.
- [x] Criar tabela `testimonials`.
- [x] Criar tabela `faqs`.
- [x] Criar tabelas de preparacao para WhatsApp e IA sem ativar as integracoes externas.
- [x] Ativar RLS em todas as tabelas expostas.
- [x] Criar policies iniciais por perfil.
- [x] Criar indices para consultas frequentes de leads, conversas e mensagens.
- [x] Criar seeds basicos para etapas do pipeline.
- [x] Rodar advisors de seguranca do Supabase.
- [x] Rodar advisors de performance do Supabase.

## Fase 4 - Etapa 4 de 12 - Layout Principal do CRM

Objetivo: criar a experiencia base de navegacao interna.

- [x] Criar shell do CRM com sidebar.
- [x] Criar header interno.
- [x] Criar alternancia de tema dark/light no header interno.
- [x] Criar menu de navegacao.
- [x] Criar area de conteudo responsiva.
- [x] Criar estados de carregamento.
- [x] Criar estados vazios.
- [x] Criar tratamento visual de erro.
- [x] Criar breadcrumbs quando fizer sentido.
- [x] Criar links principais: Dashboard, Leads, Pipeline, Conversas, Clientes, Blog, Relatorios, Configuracoes, Usuarios.
- [x] Garantir que o CRM seja funcional em desktop.
- [x] Garantir que o CRM seja utilizavel em tablet/mobile sem quebrar layout.

## Fase 5 - Etapa 5 de 12 - Dashboard Comercial

Objetivo: criar a primeira tela operacional do CRM com indicadores simples de conversao.

- [x] Criar pagina `/crm`.
- [x] Criar cards de indicadores com shadcn/ui.
- [x] Mostrar leads do dia.
- [x] Mostrar conversas abertas.
- [x] Mostrar leads urgentes.
- [x] Mostrar leads convertidos.
- [x] Mostrar leads perdidos.
- [x] Mostrar taxa de conversao.
- [x] Mostrar tempo medio de primeira resposta quando houver dados.
- [x] Mostrar lista de leads recentes.
- [x] Mostrar lista de conversas que precisam de resposta.
- [x] Criar filtros basicos por periodo.
- [x] Conectar indicadores ao Supabase.
- [x] Criar fallback para ausencia de dados.

## Fase 6 - Etapa 6 de 12 - Leads

Objetivo: criar o modulo central de acompanhamento comercial.

- [x] Criar listagem de leads.
- [x] Criar busca por nome, telefone e email.
- [x] Criar filtros por status.
- [x] Criar filtros por prioridade.
- [x] Criar filtros por origem.
- [x] Criar filtros por area juridica.
- [x] Criar filtros por responsavel.
- [x] Criar cadastro manual de lead.
- [x] Criar tela de detalhe do lead.
- [x] Permitir editar dados do lead.
- [x] Permitir alterar prioridade.
- [x] Permitir alterar area juridica.
- [x] Permitir atribuir responsavel.
- [x] Permitir adicionar observacoes internas.
- [x] Registrar historico em `lead_events`.
- [x] Permitir marcar lead como perdido.
- [x] Permitir converter lead em cliente.
- [x] Garantir que nenhuma alteracao importante ocorra sem registro de evento.

## Fase 7 - Etapa 7 de 12 - Pipeline Kanban

Objetivo: visualizar e mover leads pelo fluxo comercial.

- [x] Criar pagina de pipeline.
- [x] Criar colunas do Kanban com as etapas:
  - Novo lead;
  - Atendimento iniciado;
  - Aguardando retorno;
  - Em analise;
  - Proposta enviada;
  - Convertido;
  - Perdido.
- [x] Carregar etapas a partir do banco.
- [x] Carregar leads por etapa.
- [x] Criar card de lead com dados essenciais.
- [x] Permitir movimentar lead entre etapas.
- [x] Persistir alteracao de etapa.
- [x] Registrar evento de movimentacao.
- [x] Validar regras de conversao para etapa Convertido.
- [x] Validar regras de encerramento para etapa Perdido.
- [x] Criar filtros do pipeline por responsavel, area e prioridade.

## Fase 8 - Etapa 8 de 12 - Conversas e Atendimento Interno

Objetivo: preparar a central de atendimento antes da integracao real com WhatsApp.

Status: feito.

- [x] Criar modelo visual de inbox.
- [x] Criar lista de conversas.
- [x] Criar detalhe da conversa.
- [x] Vincular conversa ao lead.
- [x] Exibir histÃ³rico de mensagens.
- [x] Diferenciar mensagem recebida, enviada e nota interna.
- [x] Criar campo de resposta sem envio externo ainda.
- [x] Criar observaÃ§Ãµes internas da conversa.
- [x] Criar estados: nÃ£o respondido, aguardando cliente, em atendimento, finalizado.
- [x] Criar filtros: nÃ£o respondidos, urgentes, meus atendimentos, aguardando cliente.
- [x] Permitir atribuir responsÃ¡vel pela conversa.
- [x] Permitir transferir atendimento entre usuÃ¡rios.
- [x] Habilitar atualizaÃ§Ã£o em tempo real da caixa de atendimento com Supabase Realtime.
- [x] Atualizar conversas e mensagens recebidas sem exigir F5 na pÃ¡gina.
- [x] Fixar o campo de resposta e manter a rolagem somente dentro do histÃ³rico da conversa.

## Fase 9 - Etapa 9 de 12 - Clientes Convertidos

Objetivo: registrar somente leads convertidos, sem virar gestao juridica profunda.

Status: feito.

- [x] Criar listagem de clientes convertidos.
- [x] Criar tela de detalhe do cliente.
- [x] Manter vÃ­nculo com lead original.
- [x] Manter histÃ³rico comercial.
- [x] Registrar data de conversÃ£o.
- [x] Registrar responsÃ¡vel pela conversÃ£o.
- [x] Permitir observaÃ§Ãµes bÃ¡sicas.
- [x] Permitir anexos bÃ¡sicos quando necessÃ¡rio.
- [x] Bloquear qualquer tentativa de criar controle processual dentro deste mÃ³dulo.

## Fase 10 - Etapa 10 de 12 - Blog, Site e Configuracoes pelo CRM

Objetivo: permitir que o CRM gerencie conteudos essenciais do site sem alterar identidade visual.

Status: feito.

- [x] Criar CRUD de categorias do blog.
- [x] Criar CRUD de posts.
- [x] Permitir rascunho/publicado.
- [x] Permitir imagem de capa.
- [x] Permitir autor.
- [x] Permitir categoria.
- [x] Permitir data de publicaÃ§Ã£o.
- [x] Validar listagem pÃºblica de notÃ­cias com dados reais.
- [x] Validar pÃ¡gina individual de notÃ­cia com dados reais.
- [x] Criar gerenciamento de equipe.
- [x] Criar gerenciamento de depoimentos.
- [x] Criar gerenciamento de FAQ.
- [x] Criar configuraÃ§Ãµes essenciais do site: WhatsApp pÃºblico, e-mail, endereÃ§o e redes sociais.
- [x] Garantir que alteraÃ§Ãµes de copy/layout/identidade visual nÃ£o sejam feitas sem pedido explÃ­cito.

## Fase 11 - Etapa 11 de 12 - RelatÃ³rios e ConfiguraÃ§Ãµes Operacionais

Status: em andamento.

Objetivo: entregar visÃ£o gerencial simples e organizar configuraÃ§Ãµes operacionais do atendimento sem transformar o CRM em sistema complexo.

### RelatÃ³rios em `/crm/relatorios`

- [x] Criar pÃ¡gina de relatÃ³rios.
- [x] Criar filtro por perÃ­odo.
- [x] Criar relatÃ³rio de leads por perÃ­odo.
- [x] Criar relatÃ³rio de leads por origem.
- [x] Criar relatÃ³rio de leads por Ã¡rea jurÃ­dica.
- [x] Criar relatÃ³rio de conversÃ£o.
- [x] Criar relatÃ³rio de atendimentos por responsÃ¡vel.
- [x] Criar relatÃ³rio de tempo de resposta quando houver mensagens.
- [x] Criar exportaÃ§Ã£o simples quando fizer sentido.

### ConfiguraÃ§Ãµes operacionais em `/crm/configuracoes`

- [x] Criar aba de respostas rÃ¡pidas internas.
- [x] Criar aba de horÃ¡rios de atendimento.
- [x] Criar aba de Ã¡reas jurÃ­dicas gerenciÃ¡veis pelo CRM.
- [x] Criar tabela `legal_areas` com RLS no Supabase.
- [x] Carregar Ã¡reas jurÃ­dicas configuradas no formulÃ¡rio pÃºblico.
- [x] Carregar Ã¡reas jurÃ­dicas configuradas no cadastro e ediÃ§Ã£o de leads.
- [x] Carregar Ã¡reas jurÃ­dicas configuradas na ediÃ§Ã£o de clientes.
- [x] Revisar permissÃµes de administrador, gestor e atendente.

### RevisÃµes gerais do CRM

- [ ] Revisar estados vazios das telas operacionais.
- [ ] Revisar mensagens de erro das telas operacionais.

## Site pÃºblico - Captura de agendamento e WhatsApp do site

Status: feito.

Objetivo: manter o formulÃ¡rio principal como solicitaÃ§Ã£o de agendamento e transformar os botÃµes de WhatsApp do site em captura rÃ¡pida, criando lead antes de abrir o WhatsApp e separando a origem `site` da origem `site_whatsapp`.

- [x] Criar endpoint server-side para captura pÃºblica de agendamento.
- [x] Validar dados do formulÃ¡rio no servidor antes de gravar no Supabase.
- [x] Criar ou reaproveitar `contacts` por telefone.
- [x] Criar ou atualizar lead aberto vinculado ao contato.
- [x] Salvar origem `site` para formulÃ¡rio principal.
- [x] Salvar origem `site_whatsapp` para cliques nos CTAs de WhatsApp do site.
- [x] Registrar preferÃªncia de retorno: WhatsApp, e-mail ou ligaÃ§Ã£o.
- [x] Registrar melhor horÃ¡rio para contato em `best_contact_time`.
- [x] Registrar Ã¡rea/setor jurÃ­dico no lead.
- [x] Usar captura rÃ¡pida no WhatsApp do site com nome, telefone e mensagem.
- [x] Abrir WhatsApp somente apÃ³s o lead do site ser salvo.
- [x] Atualizar textos pÃºblicos de contato para linguagem de agendamento.
- [x] Manter identidade visual, cores e layout geral do site pÃºblico.
- [x] Adicionar Google Cloud reCAPTCHA score-based no formulÃ¡rio de agendamento.
- [x] Adicionar Google Cloud reCAPTCHA score-based na captura rÃ¡pida do WhatsApp do site.
- [x] Validar token e score do reCAPTCHA no endpoint server-side antes de criar lead.
- [x] Rodar `npm run typecheck`.
- [x] Rodar `npm run lint`.
- [x] Rodar `npm run build`.

## Fase 12 - Etapa 12 de 12 - WhatsApp e InteligÃªncia Artificial

Objetivo: integrar canais externos somente depois que CRM, banco, permissÃµes e atendimento interno estiverem prontos.

### WhatsApp - Evolution API

Objetivo: conectar o WhatsApp ao CRM por QR Code, permitir gerenciamento simples da conexÃ£o e usar a Evolution API somente pelo servidor.

ReferÃªncias da documentaÃ§Ã£o lidas:

- Create Instance: https://doc.evolution-api.com/v2/api-reference/instance-controller/create-instance-basic
- Instance Connect: https://doc.evolution-api.com/v2/api-reference/instance-controller/instance-connect
- Connection State: https://doc.evolution-api.com/v2/api-reference/instance-controller/connection-state
- Fetch Instances: https://doc.evolution-api.com/v2/api-reference/instance-controller/fetch-instances
- Set Webhook: https://docs.evoapicloud.com/api-reference/webhook/set
- Webhooks e eventos: https://doc.evolution-api.com/v2/en/configuration/webhooks
- Send Plain Text: https://doc.evolution-api.com/v2/api-reference/message-controller/send-text
- Send Media Message: https://doc.evolution-api.com/v2/api-reference/message-controller/send-media
- Send WhatsApp Audio: https://docs.evoapicloud.com/api-reference/message-controller/send-audio
- Logout Instance: https://doc.evolution-api.com/v2/api-reference/instance-controller/logout-instance
- Delete Instance: https://doc.evolution-api.com/v2/api-reference/instance-controller/delete-instance

### WhatsApp - Etapa 1 de 8 - PreparaÃ§Ã£o segura da integraÃ§Ã£o

- [x] Ler documentaÃ§Ã£o oficial da Evolution API v2.
- [x] Confirmar Evolution API local rodando no Docker em `localhost:8080`.
- [x] Confirmar que a Evolution API responde localmente sem depender de conexÃ£o antiga.
- [x] Configurar variÃ¡veis privadas server-only da Evolution API em `.env.local`.
- [x] Garantir que nenhuma chave da Evolution API use prefixo `NEXT_PUBLIC_`.
- [x] Criar cliente server-side da Evolution API em `src/server/integrations/evolution`.
- [x] Padronizar respostas internas da integraÃ§Ã£o sem expor termos tÃ©cnicos ao usuÃ¡rio do CRM.
- [x] Criar validaÃ§Ã£o de erro para API offline, chave invÃ¡lida e instÃ¢ncia inexistente.

### WhatsApp - Etapa 2 de 8 - Banco e estado da conexÃ£o

- [x] Criar tabela de configuraÃ§Ã£o da conexÃ£o do WhatsApp no Supabase.
- [x] Salvar nome da instÃ¢ncia, status, nÃºmero conectado, nome do perfil, foto do perfil e datas de atualizaÃ§Ã£o.
- [x] Salvar se a conexÃ£o estÃ¡ ativa ou desativada dentro do CRM.
- [x] Criar tabela de eventos de conexÃ£o para histÃ³rico operacional.
- [x] Ativar RLS nas tabelas novas.
- [x] Permitir leitura para administrador, gestor e atendente.
- [x] Permitir gerenciamento da conexÃ£o somente para administrador e gestor.
- [x] Rodar advisors de seguranÃ§a e performance do Supabase apÃ³s a alteraÃ§Ã£o.

### WhatsApp - Etapa 3 de 8 - Nova aba no menu do CRM

- [x] Criar item `WhatsApp` no menu lateral do CRM.
- [x] Criar pÃ¡gina `/crm/whatsapp`.
- [x] Exibir estado atual da conexÃ£o com linguagem simples: conectado, aguardando leitura, desconectado, desativado ou indisponÃ­vel.
- [x] Exibir nÃºmero e nome do WhatsApp conectado quando houver conexÃ£o.
- [x] Exibir aÃ§Ãµes principais em botÃµes claros: conectar, atualizar, desativar, reativar, desconectar e excluir.
- [x] NÃ£o exibir termos tÃ©cnicos como instÃ¢ncia, webhook, payload, token, API key, erro 401 ou QR raw para o usuÃ¡rio final.
- [x] Criar estados vazios e mensagens de erro em portuguÃªs do Brasil com acentuaÃ§Ã£o correta.
- [x] Garantir layout responsivo em desktop, tablet e mobile.

### WhatsApp - Etapa 4 de 8 - ConexÃ£o por QR Code

- [x] Criar aÃ§Ã£o server-side para criar ou reaproveitar a conexÃ£o da Evolution API.
- [x] Criar aÃ§Ã£o server-side para solicitar QR Code em `/instance/connect/{instance}`.
- [x] Renderizar o QR Code no CRM de forma visual e legÃ­vel.
- [x] Exibir instruÃ§Ã£o simples para leitura pelo WhatsApp do celular.
- [x] Atualizar o QR Code quando a Evolution API enviar novo cÃ³digo.
- [x] Consultar periodicamente `/instance/connectionState/{instance}` enquanto a leitura estiver pendente.
- [x] Atualizar a pÃ¡gina automaticamente quando o estado mudar para conectado.
- [x] Salvar o estado conectado no Supabase assim que a conexÃ£o for confirmada.

### WhatsApp - Etapa 5 de 8 - Desativar, desconectar e excluir

- [x] Criar aÃ§Ã£o para desativar o uso do WhatsApp no CRM sem apagar histÃ³rico.
- [x] Criar aÃ§Ã£o para reativar uma conexÃ£o desativada.
- [x] Criar aÃ§Ã£o para desconectar o WhatsApp usando `/instance/logout/{instance}`.
- [x] Criar aÃ§Ã£o para excluir a conexÃ£o usando `/instance/delete/{instance}`.
- [x] Pedir confirmaÃ§Ã£o antes de desconectar ou excluir.
- [x] Explicar no CRM a diferenÃ§a entre desativar, desconectar e excluir com texto simples.
- [x] Ao excluir, manter mensagens e histÃ³rico comercial jÃ¡ salvos no CRM.
- [x] Registrar cada alteraÃ§Ã£o no histÃ³rico operacional.

### WhatsApp - Etapa 6 de 8 - Webhook de recebimento

- [x] Criar rota server-side para receber eventos da Evolution API.
- [x] Validar segredo privado do webhook antes de processar qualquer evento.
- [x] Configurar webhook da instÃ¢ncia com eventos `QRCODE_UPDATED`, `CONNECTION_UPDATE`, `MESSAGES_UPSERT`, `MESSAGES_UPDATE` e `SEND_MESSAGE`.
- [x] Salvar evento de QR Code quando houver atualizaÃ§Ã£o.
- [x] Salvar evento de conexÃ£o quando o WhatsApp conectar, desconectar ou falhar.
- [x] Persistir toda mensagem recebida antes de qualquer automaÃ§Ã£o.
- [x] Ignorar grupos nesta fase, salvo se o usuÃ¡rio pedir o contrÃ¡rio.
- [x] NÃ£o registrar chaves, segredos ou payloads sensÃ­veis em logs.

### WhatsApp - Etapa 7 de 8 - Conversas, contatos e leads

- [x] Vincular mensagem recebida a contato pelo telefone.
- [x] Criar contato automaticamente quando o telefone ainda nÃ£o existir.
- [x] Vincular contato ao lead quando houver lead existente.
- [x] Criar lead automaticamente com origem `whatsapp` quando nÃ£o houver lead.
- [x] Criar ou atualizar conversa vinculada ao contato e ao lead.
- [x] Salvar mensagem recebida em `messages` como entrada.
- [x] Salvar Ã¡udio recebido em Storage privado para reproduÃ§Ã£o no CRM.
- [x] Exibir player de Ã¡udio na conversa quando a mensagem recebida for Ã¡udio.
- [x] Salvar imagem recebida em Storage privado para visualizaÃ§Ã£o no CRM.
- [x] Exibir preview de imagem na conversa quando a mensagem recebida for imagem.
- [x] Atualizar Ãºltimo horÃ¡rio da conversa.
- [x] Registrar evento relevante no histÃ³rico do lead.

### WhatsApp - Etapa 8 de 8 - Envio humano pelo CRM

- [x] Alterar resposta da tela de conversas para enviar mensagem real quando WhatsApp estiver conectado.
- [x] Usar `/message/sendText/{instance}` somente pelo servidor.
- [x] Manter fallback para salvar resposta no histÃ³rico quando WhatsApp estiver desativado ou indisponÃ­vel.
- [x] Salvar mensagem enviada no banco apÃ³s confirmaÃ§Ã£o de envio.
- [x] Exibir erro simples quando a mensagem nÃ£o puder ser enviada.
- [ ] Testar conexÃ£o por QR Code.
- [x] Permitir envio de imagem pelo CRM com visualizaÃƒÂ§ÃƒÂ£o no histÃƒÂ³rico.
- [x] Permitir gravaÃƒÂ§ÃƒÂ£o e envio de ÃƒÂ¡udio pelo CRM com player no histÃƒÂ³rico.
- [x] Permitir inserir emojis Unicode compatíveis com WhatsApp no campo de resposta.
- [x] Exibir status visual no balão da mensagem: enviando, enviada, falhou e tentar novamente.

### WhatsApp - Etapa 9 de 9 - Contexto comercial do lead dentro do chat

Objetivo: quando o operador abrir uma conversa, ele deve entender imediatamente a situação comercial do contato sem sair do atendimento.

Lógica definida:

- A conversa deve mostrar o lead vinculado quando existir `lead_id`.
- A informação principal deve vir do próprio lead e do pipeline, não de um status novo inventado para o chat.
- O status comercial deve ser derivado de `converted_at`, `lost_at` e da etapa atual em `pipeline_stage_id`.
- A etapa exibida deve usar as mesmas etapas do pipeline:
  - Novo lead;
  - Atendimento iniciado;
  - Aguardando retorno;
  - Em análise;
  - Proposta enviada;
  - Convertido;
  - Perdido.
- Se `converted_at` estiver preenchido, o chat deve indicar que o contato já virou cliente.
- Se `lost_at` estiver preenchido, o chat deve indicar que o lead foi perdido/desistente.
- Se não houver `lead_id`, o chat deve mostrar apenas que não há lead vinculado, sem inventar dados.
- O operador deve poder alterar a etapa comercial do lead pelo chat.
- A alteração de etapa deve reaproveitar a mesma regra do pipeline, porque mover para Convertido cria cliente e mover para Perdido exige motivo.
- Não duplicar regra de negócio entre `conversations`, `leads` e `pipeline`; se necessário, extrair uma função compartilhada de movimentação comercial.
- Alterações comerciais feitas pelo chat devem registrar histórico em `lead_events`.
- A alteração deve atualizar as telas de Conversas, Leads, Pipeline, Clientes e Dashboard quando aplicável.
- O formulário de alteração de etapa deve abrir em modal/dialog separado, nunca lado a lado com os dados do chat.
- A interface deve ser compacta e operacional, sem poluir a área de mensagens.

Tasks:

- [x] Ampliar os dados carregados em `getConversationInbox` para incluir status comercial do lead, etapa atual do pipeline e motivo de perda quando existir.
- [x] Carregar as etapas ativas de `pipeline_stages` para permitir alteração pelo chat.
- [x] Criar bloco visual no topo do detalhe da conversa com: tipo do contato, etapa do pipeline, status comercial, prioridade, origem e link para o lead.
- [x] Criar badges semânticas para diferenciar lead em aberto, cliente convertido e lead perdido.
- [x] Criar ação de alteração de etapa a partir do chat reaproveitando a regra existente do pipeline.
- [x] Exigir motivo quando o operador mover o lead para Perdido.
- [x] Garantir criação de cliente quando o operador mover o lead para Convertido.
- [x] Revalidar rotas afetadas após alteração: conversas, leads, pipeline, clientes e dashboard.
- [x] Garantir que alterar a etapa não feche o chat aberto.
- [ ] Validar visualmente o chat em desktop e mobile.
- [x] Rodar `npm run typecheck`.
- [x] Rodar `npm run lint`.
- [x] Rodar `npm run build`.

- [ ] Testar recebimento de mensagem.
- [ ] Testar envio de mensagem.
- [ ] Testar desconexão, desativação, reativação e exclusão.
- [ ] Testar falha da Evolution API sem perder mensagem ou histórico.

### CRM - Regra operacional: lead convertido vira cliente

Status: em andamento.

Objetivo: evitar confusão operacional para o advogado. Lead é oportunidade comercial em andamento; cliente é lead ganho. Quando um lead for convertido, ele deve sair da operação de leads e pipeline, sem apagar o histórico que comprova a origem comercial do cliente.

Lógica definida:

- Lead é contato comercial ainda não convertido.
- Cliente é lead convertido.
- O lead convertido não deve disputar atenção com clientes na listagem de leads.
- O lead convertido não deve ocupar o pipeline operacional depois de ganhar status de cliente.
- O registro do lead deve continuar no banco como histórico, origem e auditoria da conversão.
- O cliente deve ser a tela principal após a conversão.
- Conversas, eventos, mensagens, notas e anexos devem continuar preservando o vínculo histórico com o lead original.
- Se alguém acessar diretamente um lead convertido, o CRM deve levar para o cliente correspondente.
- No atendimento por conversa, quando o contato já for cliente, o operador deve ser direcionado para o cliente, não para uma tela duplicada de lead.
- Relatórios e dashboard podem continuar contabilizando conversões, mas telas operacionais devem priorizar o que ainda precisa de ação comercial.

Etapa 1 - Separar operação de leads e clientes

- [x] Ocultar leads convertidos da listagem principal de `/crm/leads`.
- [x] Remover opção operacional de filtro `Convertido` na listagem de leads.
- [x] Ocultar leads convertidos do pipeline operacional em `/crm/pipeline`.
- [x] Ocultar colunas `Convertido` e `Perdido` do quadro operacional do pipeline.
- [x] Mostrar somente estado vazio quando não houver lead em andamento no pipeline.
- [x] Redirecionar acesso direto de `/crm/leads/[id]` para `/crm/clientes/[id]` quando o lead já tiver cliente criado.
- [x] Redirecionar edição direta de lead convertido para edição do cliente.
- [x] Garantir que leads perdidos continuem disponíveis como encerramento comercial, sem virar cliente.
- [ ] Validar que converter lead continua criando cliente e preservando eventos.

Etapa 1.1 - Cliente convertido como registro editável principal

- [x] Criar página dedicada `/crm/clientes/[id]/editar`.
- [x] Permitir editar nome, telefone, e-mail e observações básicas do cliente.
- [x] Permitir editar a área jurídica do cliente mantendo a origem comercial vinculada.
- [x] Atualizar o contato vinculado quando nome, telefone ou e-mail do cliente forem alterados.
- [x] Registrar evento comercial quando dados do cliente forem atualizados.
- [x] Adicionar botão `Editar cliente` na página de detalhe do cliente.
- [x] Remover botão `Abrir lead` da página de cliente convertido.
- [x] Renomear bloco `Lead original` para `Origem comercial`, deixando claro que é histórico.
- [x] Garantir que a página de lead e edição de lead continuem disponíveis para leads ainda não convertidos.

Etapa 2 - Ajustar conversa para cliente convertido

- [x] Carregar cliente vinculado ao lead convertido dentro da conversa.
- [x] Trocar ação `Abrir lead` por `Abrir cliente` quando o contato já for cliente.
- [x] Manter etapa/status comercial visível sem incentivar edição duplicada do lead convertido.
- [x] Exibir identificação de cliente, lead em aberto, lead perdido ou conversa sem lead nos cards da caixa de atendimento.
- [x] Bloquear alteração de etapa para lead já convertido em cliente.
- [x] Manter alteração de etapa liberada para lead perdido, permitindo reabertura comercial.
- [x] Garantir que o chat continue preservando mensagens, eventos e vínculo com o histórico original.
- [x] Corrigir webhook do WhatsApp para não criar novo lead quando mensagem enviada pela empresa pertence a cliente já convertido.
- [x] Corrigir webhook do WhatsApp para reaproveitar conversa existente do contato em vez de criar atendimento duplicado.
- [x] Consolidar lead e conversa duplicados criados em teste, preservando mensagens no cliente correto.
- [x] Registrar notas internas do chat como observações do cliente quando a conversa pertence a cliente convertido.

Etapa 3 - Ajustar indicadores sem confundir operação

- [x] Revisar dashboard para separar entradas, oportunidades abertas, perdidos e clientes convertidos.
- [x] Garantir que pipeline do dashboard conte somente oportunidades operacionais quando fizer sentido.
- [x] Revisar textos de estados vazios para reforçar que clientes convertidos ficam em `/crm/clientes`.

Etapa 4 - Validação final

- [x] Testar listagem de leads com lead convertido, garantindo que cliente não volte como lead operacional.
- [x] Testar pipeline após conversão, garantindo que cliente convertido não apareça no quadro operacional.
- [x] Testar página de cliente criada pela conversão com histórico, conversa, notas e observações preservadas.
- [x] Testar abertura da conversa a partir do cliente convertido.
- [ ] Testar listagem de leads com lead aberto, perdido e convertido.
- [ ] Testar acesso direto a lead convertido.
- [ ] Testar abertura da conversa a partir de lead ainda não convertido.
- [x] Rodar `npm run typecheck`.
- [x] Rodar `npm run lint`.
- [x] Rodar `npm run build`.

### IA - AI Studio/Gemini

- [ ] Criar prompt base da assistente inicial.
- [ ] Criar rota server-side para chamada da IA.
- [ ] Impedir chamada da IA diretamente pelo browser.
- [ ] Coletar nome.
- [ ] Coletar telefone/WhatsApp.
- [ ] Coletar cidade.
- [ ] Coletar area juridica.
- [ ] Coletar descricao breve.
- [ ] Coletar urgencia.
- [ ] Coletar melhor horario de contato.
- [ ] Gerar resumo do atendimento.
- [ ] Classificar area juridica.
- [ ] Classificar prioridade.
- [ ] Classificar potencial de conversao.
- [ ] Encaminhar para humano.
- [ ] Salvar sessao de IA.
- [ ] Salvar mensagens da IA.
- [ ] Salvar classificacao no lead.
- [ ] Garantir que a IA nao prometa resultado juridico.
- [ ] Garantir que a IA nao finja ser advogado.

## Validacao Obrigatoria por Entrega

- [x] Rodar `npm run typecheck`.
- [x] Rodar `npm run lint`.
- [x] Rodar `npm run build`.
- [x] Validar visualmente telas alteradas.
- [x] Validar rotas protegidas quando houver auth.
- [x] Validar policies/RLS quando houver alteracao de banco.
- [x] Validar que chaves privadas nao foram expostas no frontend.
- [x] Atualizar este TODO marcando tarefas concluidas.
