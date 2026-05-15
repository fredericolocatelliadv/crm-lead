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
- [x] Remover rótulos internos/de desenvolvimento da interface do CRM.

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
- [x] Exibir histórico de mensagens.
- [x] Diferenciar mensagem recebida, enviada e nota interna.
- [x] Criar campo de resposta sem envio externo ainda.
- [x] Criar observações internas da conversa.
- [x] Criar estados: não respondido, aguardando cliente, em atendimento, finalizado.
- [x] Criar filtros: não respondidos, urgentes, meus atendimentos, aguardando cliente.
- [x] Permitir atribuir responsável pela conversa.
- [x] Permitir transferir atendimento entre usuários.
- [x] Habilitar atualização em tempo real da caixa de atendimento com Supabase Realtime.
- [x] Atualizar conversas e mensagens recebidas sem exigir F5 na página.
- [x] Fixar o campo de resposta e manter a rolagem somente dentro do histórico da conversa.

## Fase 9 - Etapa 9 de 12 - Clientes Convertidos

Objetivo: registrar somente leads convertidos, sem virar gestao juridica profunda.

Status: feito.

- [x] Criar listagem de clientes convertidos.
- [x] Criar tela de detalhe do cliente.
- [x] Manter vínculo com lead original.
- [x] Manter histórico comercial.
- [x] Registrar data de conversão.
- [x] Registrar responsável pela conversão.
- [x] Permitir observações básicas.
- [x] Permitir anexos básicos quando necessário.
- [x] Bloquear qualquer tentativa de criar controle processual dentro deste módulo.

## Fase 10 - Etapa 10 de 12 - Blog, Site e Configuracoes pelo CRM

Objetivo: permitir que o CRM gerencie conteudos essenciais do site sem alterar identidade visual.

Status: feito.

- [x] Criar CRUD de categorias do blog.
- [x] Criar CRUD de posts.
- [x] Permitir rascunho/publicado.
- [x] Permitir imagem de capa.
- [x] Permitir autor.
- [x] Permitir categoria.
- [x] Permitir data de publicação.
- [x] Validar listagem pública de notícias com dados reais.
- [x] Validar página individual de notícia com dados reais.
- [x] Criar gerenciamento de equipe.
- [x] Criar gerenciamento de depoimentos.
- [x] Criar gerenciamento de FAQ.
- [x] Criar configurações essenciais do site: WhatsApp público, e-mail, endereço e redes sociais.
- [x] Garantir que alterações de copy/layout/identidade visual não sejam feitas sem pedido explícito.

## Fase 11 - Etapa 11 de 12 - Relatórios e Configurações Operacionais

Status: em andamento.

Objetivo: entregar visão gerencial simples e organizar configurações operacionais do atendimento sem transformar o CRM em sistema complexo.

### Relatórios em `/crm/relatorios`

- [x] Criar página de relatórios.
- [x] Criar filtro por período.
- [x] Criar relatório de leads por período.
- [x] Criar relatório de leads por origem.
- [x] Criar relatório de leads por área jurídica.
- [x] Criar relatório de conversão.
- [x] Criar relatório de atendimentos por responsável.
- [x] Criar relatório de tempo de resposta quando houver mensagens.
- [x] Criar exportação simples quando fizer sentido.

### Configurações operacionais em `/crm/configuracoes`

- [x] Criar aba de respostas rápidas internas.
- [x] Criar aba de horários de atendimento.
- [x] Criar aba de áreas jurídicas gerenciáveis pelo CRM.
- [x] Criar tabela `legal_areas` com RLS no Supabase.
- [x] Carregar áreas jurídicas configuradas no formulário público.
- [x] Carregar áreas jurídicas configuradas no cadastro e edição de leads.
- [x] Carregar áreas jurídicas configuradas na edição de clientes.
- [x] Revisar permissões de administrador, gestor e atendente.

### Revisões gerais do CRM

- [ ] Revisar estados vazios das telas operacionais.
- [ ] Revisar mensagens de erro das telas operacionais.

## Site público - Captura de agendamento e WhatsApp do site

Status: feito.

Objetivo: manter o formulário principal como solicitação de agendamento e transformar os botões de WhatsApp do site em captura rápida, criando lead antes de abrir o WhatsApp e separando a origem `site` da origem `site_whatsapp`.

- [x] Criar endpoint server-side para captura pública de agendamento.
- [x] Validar dados do formulário no servidor antes de gravar no Supabase.
- [x] Criar ou reaproveitar `contacts` por telefone.
- [x] Criar ou atualizar lead aberto vinculado ao contato.
- [x] Salvar origem `site` para formulário principal.
- [x] Salvar origem `site_whatsapp` para cliques nos CTAs de WhatsApp do site.
- [x] Registrar preferência de retorno: WhatsApp, e-mail ou ligação.
- [x] Registrar melhor horário para contato em `best_contact_time`.
- [x] Registrar área/setor jurídico no lead.
- [x] Usar captura rápida no WhatsApp do site com nome, telefone e mensagem.
- [x] Abrir WhatsApp somente após o lead do site ser salvo.
- [x] Atualizar textos públicos de contato para linguagem de agendamento.
- [x] Manter identidade visual, cores e layout geral do site público.
- [x] Adicionar Google Cloud reCAPTCHA score-based no formulário de agendamento.
- [x] Adicionar Google Cloud reCAPTCHA score-based na captura rápida do WhatsApp do site.
- [x] Validar token e score do reCAPTCHA no endpoint server-side antes de criar lead.
- [x] Rodar `npm.cmd run typecheck`.
- [x] Rodar `npm.cmd run lint`.
- [x] Rodar `npm.cmd run build`.

## Fase 12 - Etapa 12 de 12 - WhatsApp e Inteligência Artificial

Objetivo: integrar canais externos somente depois que CRM, banco, permissões e atendimento interno estiverem prontos.

### WhatsApp - Evolution API

Objetivo: conectar o WhatsApp ao CRM por QR Code, permitir gerenciamento simples da conexão e usar a Evolution API somente pelo servidor.

Referências da documentação lidas:

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

### WhatsApp - Etapa 1 de 8 - Preparação segura da integração

- [x] Ler documentação oficial da Evolution API v2.
- [x] Confirmar Evolution API local rodando no Docker em `localhost:8080`.
- [x] Confirmar que a Evolution API responde localmente sem depender de conexão antiga.
- [x] Configurar variáveis privadas server-only da Evolution API em `.env.local`.
- [x] Garantir que nenhuma chave da Evolution API use prefixo `NEXT_PUBLIC_`.
- [x] Criar cliente server-side da Evolution API em `src/server/integrations/evolution`.
- [x] Padronizar respostas internas da integração sem expor termos técnicos ao usuário do CRM.
- [x] Criar validação de erro para API offline, chave inválida e instância inexistente.

### WhatsApp - Etapa 2 de 8 - Banco e estado da conexão

- [x] Criar tabela de configuração da conexão do WhatsApp no Supabase.
- [x] Salvar nome da instância, status, número conectado, nome do perfil, foto do perfil e datas de atualização.
- [x] Salvar se a conexão está ativa ou desativada dentro do CRM.
- [x] Criar tabela de eventos de conexão para histórico operacional.
- [x] Ativar RLS nas tabelas novas.
- [x] Permitir leitura para administrador, gestor e atendente.
- [x] Permitir gerenciamento da conexão somente para administrador e gestor.
- [x] Rodar advisors de segurança e performance do Supabase após a alteração.

### WhatsApp - Etapa 3 de 8 - Nova aba no menu do CRM

- [x] Criar item `WhatsApp` no menu lateral do CRM.
- [x] Criar página `/crm/whatsapp`.
- [x] Exibir estado atual da conexão com linguagem simples: conectado, aguardando leitura, desconectado, desativado ou indisponível.
- [x] Exibir número e nome do WhatsApp conectado quando houver conexão.
- [x] Exibir ações principais em botões claros: conectar, atualizar, desativar, reativar, desconectar e excluir.
- [x] Não exibir termos técnicos como instância, webhook, payload, token, API key, erro 401 ou QR raw para o usuário final.
- [x] Criar estados vazios e mensagens de erro em português do Brasil com acentuação correta.
- [x] Garantir layout responsivo em desktop, tablet e mobile.

### WhatsApp - Etapa 4 de 8 - Conexão por QR Code

- [x] Criar ação server-side para criar ou reaproveitar a conexão da Evolution API.
- [x] Criar ação server-side para solicitar QR Code em `/instance/connect/{instance}`.
- [x] Renderizar o QR Code no CRM de forma visual e legível.
- [x] Exibir instrução simples para leitura pelo WhatsApp do celular.
- [x] Atualizar o QR Code quando a Evolution API enviar novo código.
- [x] Consultar periodicamente `/instance/connectionState/{instance}` enquanto a leitura estiver pendente.
- [x] Atualizar a página automaticamente quando o estado mudar para conectado.
- [x] Salvar o estado conectado no Supabase assim que a conexão for confirmada.

### WhatsApp - Etapa 5 de 8 - Desativar, desconectar e excluir

- [x] Criar ação para desativar o uso do WhatsApp no CRM sem apagar histórico.
- [x] Criar ação para reativar uma conexão desativada.
- [x] Criar ação para desconectar o WhatsApp usando `/instance/logout/{instance}`.
- [x] Criar ação para excluir a conexão usando `/instance/delete/{instance}`.
- [x] Pedir confirmação antes de desconectar ou excluir.
- [x] Explicar no CRM a diferença entre desativar, desconectar e excluir com texto simples.
- [x] Ao excluir, manter mensagens e histórico comercial já salvos no CRM.
- [x] Registrar cada alteração no histórico operacional.

### WhatsApp - Etapa 6 de 8 - Webhook de recebimento

- [x] Criar rota server-side para receber eventos da Evolution API.
- [x] Validar segredo privado do webhook antes de processar qualquer evento.
- [x] Configurar webhook da instância com eventos `QRCODE_UPDATED`, `CONNECTION_UPDATE`, `MESSAGES_UPSERT`, `MESSAGES_UPDATE` e `SEND_MESSAGE`.
- [x] Salvar evento de QR Code quando houver atualização.
- [x] Salvar evento de conexão quando o WhatsApp conectar, desconectar ou falhar.
- [x] Persistir toda mensagem recebida antes de qualquer automação.
- [x] Ignorar grupos nesta fase, salvo se o usuário pedir o contrário.
- [x] Não registrar chaves, segredos ou payloads sensíveis em logs.

### WhatsApp - Etapa 7 de 8 - Conversas, contatos e leads

- [x] Vincular mensagem recebida a contato pelo telefone.
- [x] Criar contato automaticamente quando o telefone ainda não existir.
- [x] Vincular contato ao lead quando houver lead existente.
- [x] Criar lead automaticamente com origem `whatsapp` quando não houver lead.
- [x] Criar ou atualizar conversa vinculada ao contato e ao lead.
- [x] Salvar mensagem recebida em `messages` como entrada.
- [x] Salvar áudio recebido em Storage privado para reprodução no CRM.
- [x] Exibir player de áudio na conversa quando a mensagem recebida for áudio.
- [x] Salvar imagem recebida em Storage privado para visualização no CRM.
- [x] Exibir preview de imagem na conversa quando a mensagem recebida for imagem.
- [x] Atualizar último horário da conversa.
- [x] Registrar evento relevante no histórico do lead.

### WhatsApp - Etapa 8 de 8 - Envio humano pelo CRM

- [x] Alterar resposta da tela de conversas para enviar mensagem real quando WhatsApp estiver conectado.
- [x] Usar `/message/sendText/{instance}` somente pelo servidor.
- [x] Manter fallback para salvar resposta no histórico quando WhatsApp estiver desativado ou indisponível.
- [x] Salvar mensagem enviada no banco após confirmação de envio.
- [x] Exibir erro simples quando a mensagem não puder ser enviada.
- [ ] Testar conexão por QR Code.
- [x] Permitir envio de imagem pelo CRM com visualização no histórico.
- [x] Permitir gravação e envio de áudio pelo CRM com player no histórico.
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
- [x] Rodar `npm.cmd run typecheck`.
- [x] Rodar `npm.cmd run lint`.
- [x] Rodar `npm.cmd run build`.

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
- [x] Rodar `npm.cmd run typecheck`.
- [x] Rodar `npm.cmd run lint`.
- [x] Rodar `npm.cmd run build`.

### IA - AI Studio/Gemini

Atualização posterior: a etapa de IA deixou de ser pendência deste histórico e passou a ser acompanhada no `TODO.md` da raiz e em `docs/TODO-ia-e-whatsapp-concluido-2026-05-14.md`.

- [x] Criar prompt base da assistente inicial.
- [x] Criar rota server-side para chamada da IA.
- [x] Impedir chamada da IA diretamente pelo browser.
- [x] Coletar nome, telefone/WhatsApp, cidade, área jurídica, descrição breve, urgência e melhor horário de contato quando disponíveis.
- [x] Gerar resumo do atendimento.
- [x] Classificar área jurídica, prioridade e potencial de conversão.
- [x] Encaminhar para humano quando necessário.
- [x] Salvar sessão de IA.
- [x] Salvar mensagens da IA.
- [x] Salvar classificação no lead/conversa.
- [x] Garantir que a IA não prometa resultado jurídico.
- [x] Garantir que a IA não finja ser advogada.
- [x] Permitir que humano assuma ou pause a IA por conversa.
- [x] Exibir resumo/classificação da IA por botão no atendimento.
- [ ] Testar pergunta jurídica complexa.
- [ ] Testar tentativa de promessa de resultado.
- [ ] Testar falha do Gemini.
- [ ] Testar falha da Evolution.

## Validacao Obrigatoria por Entrega

- [x] Rodar `npm.cmd run typecheck`.
- [x] Rodar `npm.cmd run lint`.
- [x] Rodar `npm.cmd run build`.
- [x] Validar visualmente telas alteradas.
- [x] Validar rotas protegidas quando houver auth.
- [x] Validar policies/RLS quando houver alteracao de banco.
- [x] Validar que chaves privadas não foram expostas no frontend.
- [x] Atualizar este TODO marcando tarefas concluídas.

## Atualização posterior - Perfil do Usuário e Navegação do CRM

Registrado em 14/05/2026:

- [x] Criar menu lateral recolhível no CRM.
- [x] Colocar botão de recolher/expandir dentro do menu, acima do Dashboard.
- [x] Criar menu de perfil do usuário no topo, ao lado da troca de tema.
- [x] Criar página `/crm/perfil`.
- [x] Permitir edição de dados básicos do perfil.
- [x] Permitir upload de foto do perfil.
- [x] Criar bucket `profile-avatars` no Supabase Storage.
- [x] Criar coluna `profiles.avatar_storage_path`.
- [x] Validar tamanho e tipo de imagem do avatar.
- [x] Corrigir aviso do React sobre `encType` manual em formulário com Server Action.
- [x] Rodar `npm.cmd run typecheck`.
- [x] Rodar `npm.cmd run lint`.
- [x] Rodar `npm.cmd run build`.
- [x] Enviar commit `9935316 Add CRM user profile management` ao GitHub.

## Atualização posterior - Usuários, Notas Internas e Estado da IA no Chat

Registrado em 15/05/2026:

- [x] Entregar gestão real de usuários internos em `/crm/usuarios`.
- [x] Criar perfis profissionais `Administrador`, `Advogado` e `Especialista de Marketing`.
- [x] Proteger menu, rotas, Server Actions e policies conforme permissões.
- [x] Permitir vínculo opcional de usuário advogado com a equipe exibida no site.
- [x] Enviar commit `a9f9945 Add professional user permissions` ao GitHub.
- [x] Permitir consultar notas internas salvas dentro do chat sem rolar todo o histórico.
- [x] Manter criação de nova nota interna no mesmo fluxo de atendimento.
- [x] Criar ação `Devolver para IA` para remover responsável humano da conversa.
- [x] Exibir no chat o estado real da IA: automática ativa, assistida, desativada no painel, pausada ou humano assumiu.
- [x] Não oferecer `Pausar IA` quando a IA está desativada globalmente no painel.
- [x] Rodar `npm.cmd run typecheck`.
- [x] Rodar `npm.cmd run lint`.
- [x] Rodar `npm.cmd run build`.
