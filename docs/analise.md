# Análise do sistema real

Data da análise: 14/05/2026  
Projeto Supabase auditado: `crm_lead` (`ykkvwhsjqimcwraryaxw`)  
Pasta do projeto: `C:\app\frederico-locatelli-site`

## Sumário

1. [Resumo executivo](#resumo-executivo)
2. [Escopo lido](#escopo-lido)
3. [Estado real do banco](#estado-real-do-banco)
4. [Modelo lógico atual](#modelo-lógico-atual)
5. [Jornada simulada do cliente](#jornada-simulada-do-cliente)
6. [O que já está feito](#o-que-já-está-feito)
7. [Pontos pendentes](#pontos-pendentes)
8. [Segurança](#segurança)
9. [Riscos e correções recomendadas](#riscos-e-correções-recomendadas)
10. [Notas para a próxima IA ou próximo desenvolvedor](#notas-para-a-próxima-ia-ou-próximo-desenvolvedor)
11. [Validação executada nesta análise](#validação-executada-nesta-análise)

## Resumo executivo

O sistema já tem uma base comercial funcional: site público, blog preparado, CRM protegido, usuários/perfis, leads, pipeline, conversas, clientes convertidos, relatórios, configurações, WhatsApp via Evolution API e armazenamento de mídia. O banco real confirma que o módulo central está em pé: todas as tabelas públicas estão com RLS ativo, há um cliente convertido, uma conversa vinculada, mensagens preservadas, anexos privados e histórico comercial.

A regra mais importante que vinha gerando confusão foi corrigida no estado atual: lead convertido continua no banco como histórico, mas não deve aparecer como lead operacional nem ocupar pipeline. O cliente é a entidade principal depois da conversão. A checagem real do banco também está limpa para os erros recentes: não há lead aberto duplicado por contato, não há conversa duplicada por contato/canal, não há lead convertido sem cliente, e notas internas de chat de cliente convertido já estão vinculadas ao cliente.

Os pontos que ainda precisam de atenção são objetivos: captura pública de lead ainda escreve direto do browser no Supabase, a permissão `anon` recebeu grants amplos demais e depende de RLS para conter acesso, a proteção de senha vazada do Supabase Auth está desligada, a IA/Gemini já responde pelo WhatsApp e registra classificação no CRM, mas ainda precisa de testes de endurecimento, e o dashboard ainda precisa separar melhor oportunidade operacional de cliente convertido.

Atualização de 14/05/2026: a etapa de IA já possui integração real com Gemini 2.5 Flash, resposta automática pelo WhatsApp, persistência em `ai_sessions`, `ai_messages` e `ai_classifications`, selo de mensagem automática no chat, resumo/classificação acessível por botão no atendimento e controle humano por conversa. O botão `Assumir` foi validado no banco: depois de assumido, novas mensagens do WhatsApp continuaram sendo salvas e a IA não enviou nova resposta automática.

## Escopo lido

Documentos lidos:

- `AGENTS.md`
- `TODO.md`
- `docs/PRD.md`
- `package.json`
- `.env.example`

Código lido por domínio:

- Autenticação e autorização: `src/proxy.ts`, `src/server/supabase/*`, `src/server/auth/*`, `src/features/users/*`
- Site público e captura: `src/features/site/components/ContactForm.tsx`
- Leads: `src/features/leads/actions.ts`, `src/features/leads/data/lead-directory.ts`
- Pipeline: `src/features/pipeline/actions.ts`, `src/features/pipeline/data/pipeline-board.ts`
- Conversas: `src/features/conversations/actions.ts`, `src/features/conversations/data/conversation-directory.ts`, componentes principais
- Clientes: `src/features/customers/actions.ts`, `src/features/customers/data/customer-directory.ts`, páginas de detalhe/edição
- WhatsApp: `src/server/integrations/evolution/client.ts`, `src/features/whatsapp/server/evolution-webhook.ts`, `src/features/whatsapp/data/connection.ts`
- Dashboard, relatórios e configurações: `src/features/dashboard/*`, `src/features/reports/*`, `src/features/settings/*`

Banco lido pelo MCP do Supabase:

- Lista de tabelas, colunas, chaves e RLS
- Policies de `public` e `storage`
- Buckets de Storage
- Funções em `public` e `app_private`
- Advisors de segurança e performance
- Consultas agregadas de integridade, sem expor telefone, nome ou corpo de mensagem

Limitação observada: a pasta local não está como repositório Git neste workspace (`git status` retornou que não há `.git`). Então esta análise não consegue separar por diff/versionamento local.

## Estado real do banco

### Tabelas principais

Todas as tabelas públicas listadas pelo Supabase estão com RLS ativo.

| Área | Tabela | Registros |
|---|---:|---:|
| Usuários | `profiles` | 1 |
| Usuários | `user_roles` | 1 |
| Operação | `departments` | 4 |
| Comercial | `contacts` | 1 |
| Comercial | `pipeline_stages` | 7 |
| Comercial | `leads` | 1 |
| Comercial | `lead_events` | 37 |
| Clientes | `customers` | 1 |
| Atendimento | `conversations` | 1 |
| Atendimento | `messages` | 31 |
| Atendimento | `notes` | 3 |
| Atendimento | `attachments` | 4 |
| Site/blog | `blog_categories` | 3 |
| Site/blog | `blog_posts` | 0 |
| Site/blog | `site_settings` | 1 |
| Site/blog | `team_members` | 0 |
| Site/blog | `testimonials` | 0 |
| Site/blog | `faqs` | 0 |
| Configurações | `quick_replies` | 1 |
| Configurações | `business_hours` | 7 |
| WhatsApp | `whatsapp_instances` | 1 |
| WhatsApp | `whatsapp_connection_events` | 21 |
| IA | `ai_sessions` | 0 |
| IA | `ai_messages` | 0 |
| IA | `ai_classifications` | 0 |

### Estado comercial atual

| Métrica | Valor |
|---|---:|
| Leads totais | 1 |
| Leads abertos | 0 |
| Leads convertidos | 1 |
| Leads perdidos | 0 |
| Clientes | 1 |
| Conversas | 1 |
| Status da conversa atual | `waiting_client` |
| Mensagens recebidas | 15 |
| Mensagens enviadas | 13 |
| Notas internas no chat | 3 |
| Mensagens de texto | 27 |
| Áudios | 2 |
| Imagens | 2 |
| Mensagens com status `sent` | 31 |

### Etapas do pipeline no banco

| Posição | Slug | Nome | Tipo |
|---:|---|---|---|
| 10 | `novo-lead` | Novo lead | operacional |
| 20 | `atendimento-iniciado` | Atendimento iniciado | operacional |
| 30 | `aguardando-retorno` | Aguardando retorno | operacional |
| 40 | `em-analise` | Em análise | operacional |
| 50 | `proposta-enviada` | Proposta enviada | operacional |
| 60 | `convertido` | Convertido | ganho |
| 70 | `perdido` | Perdido | perdido |

No banco, o único lead está na etapa `convertido`. No código operacional, pipeline e listagem de leads filtram convertidos para não confundir o advogado.

### Integridade checada

| Checagem | Resultado |
|---|---:|
| Lead convertido sem cliente | 0 |
| Cliente sem lead original | 0 |
| Lead aberto que também tem cliente | 0 |
| Grupo de leads abertos duplicados por contato | 0 |
| Grupo de conversas duplicadas por contato/canal | 0 |
| Nota de chat em lead convertido sem `customer_id` | 0 |
| Mensagem sem vínculo de lead | 0 |
| Conversa sem vínculo de lead | 0 |

Conclusão: o banco de teste está coerente com a lógica atual depois das correções de duplicidade e notas.

## Modelo lógico atual

### Lead

Lead é contato comercial ainda não ganho. Ele pode nascer por cadastro manual, formulário do site ou mensagem recebida pelo WhatsApp. Enquanto estiver aberto, aparece em `/crm/leads`, no pipeline operacional e pode ser editado pela tela de lead.

O lead perdido continua sendo lead, porque pode reabrir atendimento se o contato voltar. Por isso a liberação de etapa para perdido faz sentido.

### Cliente

Cliente é lead convertido. A conversão cria registro em `customers`, preserva `lead_id`, `contact_id`, histórico, conversa, eventos, notas e anexos. Depois da conversão, a tela principal deve ser `/crm/clientes/[id]`.

O lead convertido não deve disputar atenção em lista de leads nem no pipeline operacional. Ele permanece no banco como origem comercial e auditoria.

### Conversa

Conversa é o atendimento vinculado ao contato e, quando existir, ao lead. A conversa não inventa um status comercial paralelo: ela deriva a identificação de `customers`, `converted_at`, `lost_at` e `pipeline_stage_id`.

No estado atual:

- conversa de cliente mostra identificação de cliente;
- botão vira `Abrir cliente`;
- alteração de etapa fica bloqueada para cliente convertido;
- alteração de etapa fica liberada para lead perdido;
- nota interna em conversa de cliente convertido grava `customer_id`.

### Pipeline

Pipeline é operacional, não histórico. O quadro carrega só leads sem `converted_at` e sem `lost_at`, e remove qualquer lead que já tenha cliente vinculado. As etapas `Convertido` e `Perdido` existem no banco para regra de negócio, relatórios e histórico, mas não devem poluir o quadro operacional.

### WhatsApp

Webhook é server-side, valida segredo e usa service role no servidor. A mensagem é persistida antes de qualquer automação. A lógica atual procura primeiro cliente convertido, depois lead aberto, depois lead perdido. Mensagem enviada pela própria empresa (`fromMe`) não cria lead novo. Isso corrige a duplicidade que apareceu quando a empresa mandou mensagem para um cliente já convertido.

## Jornada simulada do cliente

### 1. Visitante chega pelo site

O formulário público (`ContactForm`) insere diretamente em `leads` pelo cliente Supabase de browser, com `source = site` e `priority = medium`.

Resultado esperado:

- lead entra no banco;
- trigger/função de banco pode preencher etapa padrão;
- equipe enxerga o lead no CRM se ele não estiver convertido.

Ponto de atenção: esse caminho não cria `contact` junto com o lead e não passa por server action própria. O webhook do WhatsApp consegue corrigir depois pelo telefone, porque busca lead por `contact_id` ou por telefone, mas a captura pública deveria ser mais forte e atômica.

### 2. Contato chega pelo WhatsApp

Webhook recebe evento da Evolution API, normaliza telefone, ignora grupo, cria ou reaproveita contato, resolve lead e cria/reaproveita conversa.

Ordem de resolução atual:

1. cliente convertido do contato;
2. lead aberto do contato;
3. lead perdido do contato;
4. criar novo lead só se a mensagem for recebida do contato e não enviada pela empresa.

Resultado esperado:

- mensagem recebida entra em `messages`;
- conversa fica como `unanswered`;
- evento `whatsapp_message_received` entra no histórico do lead;
- mídia vai para Storage privado e ganha registro em `attachments`.

### 3. Atendimento humano no CRM

Atendente abre `/crm/conversas`, identifica se o contato é cliente, lead aberto, lead perdido ou sem lead, responde pelo WhatsApp quando conectado e salva histórico.

Resultado esperado:

- resposta enviada vira mensagem `outbound`;
- conversa passa para `waiting_client`;
- nota interna vira mensagem `internal` e registro em `notes`;
- se a conversa pertence a cliente convertido, a nota aparece como `Cliente` na página do cliente.

### 4. Movimentação comercial

Lead aberto pode mudar de etapa pela pipeline ou pelo chat. Ao mover para perdido, exige motivo. Ao mover para convertido, cria cliente e registra evento.

Resultado esperado:

- lead aberto aparece em leads e pipeline;
- lead perdido pode ser reaberto;
- lead convertido some da operação de leads/pipeline e vira cliente;
- acesso direto ao lead convertido redireciona para cliente.

### 5. Gestão do cliente convertido

Cliente aparece em `/crm/clientes`, com origem comercial, histórico, conversa, notas e anexos. A edição principal passa a ser `/crm/clientes/[id]/editar`.

Resultado esperado:

- editar cliente atualiza nome, telefone, e-mail e observações;
- editar área jurídica atualiza o lead original vinculado;
- contato vinculado também é atualizado;
- evento `customer_updated` fica registrado.

## O que já está feito

Base técnica:

- Next.js 16 com App Router e TypeScript.
- Estrutura Feature First.
- Tailwind CSS e shadcn/ui no CRM.
- `src/proxy.ts` protegendo rotas `/crm`.
- Supabase Auth, perfis e roles.
- Server actions para operações sensíveis do CRM.
- Service role isolada em `src/server/supabase/admin.ts` com `server-only`.

Produto:

- Site público e blog/notícias preparados.
- CRM com dashboard, leads, pipeline, conversas, clientes, relatórios, usuários e configurações.
- Tema claro/escuro no CRM.
- CRUD básico de conteúdo do site pelo CRM.
- Relatórios comerciais simples.
- Clientes convertidos minimalistas, sem virar ERP jurídico.

Regras comerciais já implementadas:

- Lead convertido fica fora da listagem operacional de leads.
- Lead convertido fica fora do pipeline operacional.
- Página de lead convertido redireciona para página do cliente.
- Edição de lead convertido redireciona para edição do cliente.
- Cliente pode ser editado, inclusive área jurídica vinculada ao lead original.
- Conversa de cliente mostra `Abrir cliente`.
- Conversa bloqueia alteração de etapa quando já existe cliente.
- Lead perdido pode reabrir fluxo.
- Caixa de atendimento identifica cliente, lead aberto, lead perdido ou sem lead.
- Notas internas do chat em cliente convertido são notas do cliente.
- Webhook não cria lead duplicado para mensagem `fromMe`.
- Webhook reaproveita conversa existente do contato.

WhatsApp:

- Cliente server-side da Evolution API.
- Página `/crm/whatsapp`.
- QR Code, conexão, refresh, desconectar, desativar, reativar e excluir.
- Webhook com segredo privado.
- Recebimento de texto, imagem e áudio.
- Envio humano de texto, imagem e áudio pelo CRM.
- Storage privado para anexos do CRM.
- Histórico operacional de conexão.

IA/Gemini:

- Página `/crm/ia` com configuração de operação, modelo, comportamento, contexto e teste da assistente.
- Gemini 2.5 Flash configurado como modelo inicial.
- Chamada ao Gemini server-side, com validação estruturada da resposta.
- Webhook do WhatsApp chama a IA somente depois de salvar a mensagem recebida.
- Respostas automáticas ficam registradas no CRM com selo de IA.
- Classificação e resumo ficam salvos e podem ser consultados pela equipe.
- Botão `Resumo da IA` abre modal no atendimento para evitar poluição do chat.
- Botão `Assumir` pausa a IA naquela conversa e mantém o atendimento humano funcionando.

## Pontos pendentes

Pendências vindas do `TODO.md` e confirmadas na leitura:

- Revisar estados vazios das telas operacionais.
- Revisar mensagens de erro das telas operacionais.
- Testar conexão do WhatsApp por QR Code em fluxo real.
- Validar visualmente chat em desktop e mobile.
- Testar recebimento de mensagem em cenários adicionais.
- Testar envio de mensagem em cenários adicionais.
- Testar desconexão, desativação, reativação e exclusão.
- Testar falha da Evolution API sem perder mensagem ou histórico.
- Validar conversão de lead criando cliente e preservando eventos em fluxo completo.
- Testar listagem de leads com lead aberto, perdido e convertido.
- Testar acesso direto a lead convertido.
- Testar abertura da conversa a partir de lead ainda não convertido.
- Revisar dashboard para separar entradas, oportunidades abertas, perdidos e clientes convertidos.
- Garantir que o pipeline do dashboard conte somente oportunidades operacionais quando fizer sentido.
- Revisar textos de estados vazios apontando clientes convertidos para `/crm/clientes`.
- Endurecer a camada IA/Gemini: testar casos jurídicos complexos, tentativa de promessa de resultado, falha da Evolution, falha do Gemini, cliente convertido falando novamente e lead perdido voltando.

Ponto adicional encontrado na análise:

- A pasta local `supabase/migrations` já existe e passou a receber migrations limpas para alterações recentes. Manter esse padrão em toda mudança de schema.

## Segurança

### Pontos bons

- Rotas `/crm` protegidas por `src/proxy.ts`.
- Sessão validada com Supabase no servidor.
- Permissões não dependem de `user_metadata`; usam `profiles`, `user_roles` e função privada de role.
- Todas as tabelas públicas listadas estão com RLS ativo.
- Policies internas usam `app_private.current_user_role()`.
- A função `app_private.current_user_role` está fora do schema público e usa `security definer`.
- Views legadas `news`, `settings` e `team` estão com `security_invoker=true`.
- Evolution API não é chamada pelo frontend.
- Webhook valida segredo com `timingSafeEqual`.
- Service role fica em arquivo server-only.
- Bucket `crm-attachments` é privado.
- Anexos do CRM têm limite de 10 MB e MIME types restritos.
- Storage tem policies separando buckets públicos de imagens do site/blog e bucket privado do CRM.
- Advisors de segurança do Supabase não apontaram RLS ausente em tabelas públicas.

### Alertas reais

1. Supabase Auth com proteção de senha vazada desligada.

Advisor de segurança retornou:

- `auth_leaked_password_protection`
- Nível: `WARN`
- Correção: ativar proteção contra senhas vazadas no painel do Supabase Auth.

2. Grants do role `anon` estão amplos demais.

O banco concede vários privilégios ao role `anon` em muitas tabelas, inclusive tabelas sensíveis. A RLS está segurando o acesso, mas a postura correta é menor privilégio: revogar grants desnecessários e conceder explicitamente só o que o site público precisa.

O caso mais sensível é `leads`: existe policy `leads_public_insert` para `anon`, com `with_check` limitando `source` a `site`, `form`, `website` ou `whatsapp`. Isso permite o formulário público funcionar, mas ainda deixa a escrita pública dependente de RLS e validação mínima de banco.

3. Formulário público escreve direto do browser.

`ContactForm.tsx` usa `createBrowserClient` e faz `.from("leads").insert(...)`. Funciona, mas é frágil para abuso, spam, duplicidade e validação. Para dados jurídicos sensíveis, o melhor desenho é uma route handler/server action com Zod, rate limit/captcha, normalização de telefone, deduplicação e criação atômica de `contacts` + `leads`.

4. Migrations locais ainda precisam ser mantidas com disciplina.

O schema real está no Supabase e a pasta local de migrations foi criada nas etapas recentes. O risco agora é disciplina operacional: toda alteração definitiva de schema precisa continuar registrada em migration limpa para permitir auditoria, rollback, review de policies e reprodução em outro ambiente.

5. Dashboard ainda mistura histórico com operação.

O dashboard ainda conta etapas usando todos os leads em `leadStagesQuery`, incluindo convertido/perdido. A pipeline operacional já foi corrigida, mas o dashboard precisa seguir a mesma linguagem para não confundir cliente convertido com oportunidade aberta.

6. Performance advisors têm avisos.

Os advisors de performance apontaram índices ainda não usados e policies permissivas duplicadas em `customers` e `pipeline_stages`. Em ambiente de teste com pouco volume isso é esperado, mas antes de produção convém consolidar policies duplicadas e revisar índices depois de tráfego real.

7. Observabilidade do webhook é mínima.

O webhook retorna erro genérico sem log detalhado. Isso evita vazar payload sensível, mas dificulta diagnóstico. O ideal é registrar erro sanitizado, sem token, sem corpo completo da mensagem e sem dados sensíveis.

## Riscos e correções recomendadas

Prioridade 1:

- Migrar captura pública de lead para endpoint/server action.
- Revogar grants amplos do `anon` e conceder só o necessário.
- Manter todo schema Supabase versionado em migrations.
- Ativar proteção de senha vazada no Supabase Auth.

Prioridade 2:

- Ajustar dashboard para refletir operação: abertos, perdidos, convertidos e clientes sem confundir pipeline.
- Completar testes reais de WhatsApp: QR, envio, recebimento, queda da Evolution API, desconexão e reativação.
- Criar testes automatizados para conversão, deduplicação de WhatsApp, nota interna de cliente e redirecionamento de lead convertido.

Prioridade 3:

- Endurecer IA/Gemini server-side com testes de guardrails jurídicos e cenários de falha.
- Revisar estados vazios e mensagens de erro em todas as telas operacionais.
- Revisar textos com acentuação no repositório, porque há sinais de mojibake em arquivos lidos no terminal. O browser pode renderizar corretamente dependendo da codificação, mas isso deve ser checado visualmente.

## Notas para a próxima IA ou próximo desenvolvedor

Não trate `lead` e `customer` como duplicatas que devem ser apagadas. A regra correta é:

- lead aberto: operação comercial;
- lead perdido: histórico reabrível;
- lead convertido: origem comercial preservada;
- cliente: entidade principal depois da conversão.

Ao mexer em conversa, pipeline ou WhatsApp, preserve esta ordem:

1. nunca criar lead novo para `fromMe`;
2. resolver cliente convertido antes de lead aberto;
3. reaproveitar conversa existente por contato/canal;
4. registrar mensagem antes de automação;
5. se a conversa é de cliente convertido, notas internas devem ter `customer_id`;
6. não permitir alteração de etapa em cliente convertido;
7. permitir reabertura de lead perdido.

Arquivos mais importantes para manter essa lógica:

- `src/features/whatsapp/server/evolution-webhook.ts`
- `src/features/conversations/data/conversation-directory.ts`
- `src/features/conversations/actions.ts`
- `src/features/pipeline/actions.ts`
- `src/features/pipeline/data/pipeline-board.ts`
- `src/features/leads/data/lead-directory.ts`
- `src/features/customers/data/customer-directory.ts`
- `src/features/customers/actions.ts`

Antes de qualquer próxima entrega que toque regra comercial, rode:

```bash
npm run typecheck
npm run lint
npm run build
```

E, se tocar banco, rode novamente:

- Supabase security advisors;
- Supabase performance advisors;
- checagem de integridade para duplicidade de lead/conversa;
- teste real do fluxo alterado no CRM.

## Validação executada nesta análise

Comandos locais:

```bash
npm run typecheck
npm run lint
npm run build
```

Resultado: os três comandos passaram.

Consultas e validações no Supabase:

- `_list_projects`: projeto `crm_lead` localizado e saudável.
- `_list_tables`: tabelas públicas listadas, todas com RLS ativo.
- `_get_advisors security`: um alerta de proteção de senha vazada desligada.
- `_get_advisors performance`: alertas de índices ainda não usados e policies permissivas duplicadas.
- `_execute_sql`: checagens agregadas de integridade comercial e de relacionamento sem expor dados sensíveis.

Não foi executado teste visual do CRM nesta análise, porque a entrega solicitada foi documental e a área interna depende de sessão autenticada. A próxima validação visual deve focar em `/crm/conversas`, `/crm/clientes`, `/crm/leads` e `/crm/pipeline`.
