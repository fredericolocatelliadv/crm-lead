# TODO - Guia de Implementacao da Inteligencia Artificial

Este arquivo e o guia operacional da proxima etapa do projeto: integrar IA ao atendimento comercial juridico com seguranca, rastreabilidade e controle humano.

Historico completo das fases anteriores foi arquivado em:

- `docs/TODO-historico-ate-whatsapp.md`

Este arquivo deve ser lido antes de qualquer alteracao envolvendo IA, WhatsApp, webhook, conversas, leads, clientes ou classificacao automatica.

## Objetivo da etapa

Implementar uma assistente inicial de atendimento para WhatsApp e CRM.

A IA deve:

- acolher o contato;
- coletar dados basicos;
- organizar a conversa;
- classificar area juridica, prioridade e potencial comercial;
- gerar resumo;
- encaminhar para atendimento humano;
- preservar historico no CRM.

A IA nao deve:

- agir como advogada;
- prometer resultado juridico;
- dar parecer juridico conclusivo;
- substituir analise humana;
- enviar resposta sem registro previo no CRM;
- operar fora do servidor;
- criar lead, cliente ou conversa duplicada.

## Decisao arquitetural

### Decisao principal

Evolution API deve ser usada como canal de WhatsApp.

O CRM deve ser o cerebro da automacao.

Gemini via AI Studio deve ser o motor inicial da IA.

### Diferenca obrigatoria

Nao confundir:

- Evolution API de WhatsApp: usada pelo projeto para QR Code, webhook, recebimento e envio de mensagens.
- Bots/IA nativos da Evolution: nao usar nesta etapa.

### Regra explicita sobre IA

Nao implementar IA usando OpenAI Bot, Typebot, Dify, n8n, Flowise, EvoAI ou Evolution Bot da Evolution.

Motivos:

- esses recursos podem responder fora do fluxo auditavel do CRM;
- podem confundir a regra de contato, lead, cliente convertido e conversa;
- podem dificultar persistencia previa da mensagem recebida;
- podem dificultar guardrails juridicos e revisao humana;
- podem gerar classificacao fora do Supabase;
- podem confundir futuras LLMs sobre quem controla a automacao.

Se alguma pessoa quiser reavaliar bots nativos da Evolution no futuro, deve abrir uma decisao tecnica separada e aprovada antes. Este TODO nao autoriza esse caminho.

## Documentacao pesquisada e obrigatoria

Antes de implementar ou alterar esta etapa, revisar documentacao atual. Nao confiar em memoria antiga.

### Gemini / Google AI Studio

- Gemini API: https://ai.google.dev/api
- Google Gen AI SDK: https://ai.google.dev/gemini-api/docs
- Structured output: https://ai.google.dev/gemini-api/docs/structured-output
- Function calling: https://ai.google.dev/gemini-api/docs/function-calling
- Safety settings: https://ai.google.dev/gemini-api/docs/safety-settings

### Evolution API

- Indice LLM da Evolution: https://doc.evolution-api.com/llms.txt
- Webhooks: https://doc.evolution-api.com/v2/en/configuration/webhooks
- Send Text: https://doc.evolution-api.com/v2/api-reference/message-controller/send-text

### Supabase

- RLS e seguranca: https://supabase.com/docs/guides/database/postgres/row-level-security
- Server-side auth: https://supabase.com/docs/guides/auth/server-side
- Storage security: https://supabase.com/docs/guides/storage/security/access-control

### Estado local ja observado

- Dependencia `@google/genai` ja existe em `package.json`.
- Variavel `GEMINI_API_KEY` ja existe em `.env.example`.
- Tabelas ja existem no Supabase: `ai_sessions`, `ai_messages`, `ai_classifications`.
- A integracao WhatsApp ja possui webhook server-side em `src/app/api/webhooks/evolution/route.ts`.
- O processamento central do WhatsApp esta em `src/features/whatsapp/server/evolution-webhook.ts`.
- O envio humano pelo CRM ja confere conexao real antes de chamar a Evolution.

## Regra de ouro do fluxo

Nenhuma resposta automatica pode ser enviada antes desta ordem:

1. Receber evento do WhatsApp no webhook.
2. Validar segredo do webhook.
3. Ignorar grupos, salvo decisao explicita futura.
4. Normalizar telefone.
5. Resolver contato.
6. Resolver cliente convertido antes de lead aberto.
7. Resolver lead aberto antes de criar novo lead.
8. Reaproveitar conversa existente por contato e canal.
9. Salvar mensagem recebida em `messages`.
10. Criar ou atualizar `ai_sessions`.
11. Salvar entrada da IA em `ai_messages`.
12. Chamar Gemini server-side.
13. Validar resposta da IA com schema/Zod.
14. Salvar resposta e classificacao.
15. Atualizar lead/conversa quando aplicavel.
16. Enviar mensagem pelo WhatsApp somente se permitido.
17. Registrar evento comercial em `lead_events` quando houver mudanca relevante.

Se qualquer passo falhar, nao perder a mensagem recebida. A conversa deve ficar para atendimento humano.

## Linguagem e limites juridicos

A assistente deve falar em portugues do Brasil, de forma cordial, objetiva e profissional.

Ela pode dizer:

- "Vou coletar algumas informacoes para encaminhar seu atendimento."
- "Um profissional da equipe ira avaliar o caso."
- "Para entendermos melhor, poderia informar sua cidade?"
- "Voce pode resumir o que aconteceu?"

Ela nao pode dizer:

- "Voce tem direito garantido."
- "Seu processo esta ganho."
- "Sou advogado."
- "Minha orientacao juridica e..."
- "A indenizacao sera..."
- "O escritorio garante..."

Quando houver pergunta juridica complexa, a resposta deve encaminhar:

"Para evitar uma orientacao incompleta, vou registrar suas informacoes e encaminhar para a equipe avaliar com seguranca."

## Dados que a IA deve coletar

Campos desejados:

- nome completo;
- telefone/WhatsApp;
- cidade;
- area juridica provavel;
- descricao breve;
- urgencia;
- melhor horario para contato;
- preferencia de retorno, quando fizer sentido;
- resumo do atendimento;
- prioridade;
- potencial de conversao;
- necessidade de atendimento humano imediato.

Nunca insistir em dados sensiveis desnecessarios. Nao pedir documentos, senhas, dados bancarios ou detalhes excessivos pelo WhatsApp nesta fase.

## Saida estruturada obrigatoria

A chamada ao Gemini deve retornar JSON validado por schema.

Formato minimo esperado:

```json
{
  "reply": "Mensagem curta para enviar ao contato",
  "shouldSendReply": true,
  "handoffRequired": false,
  "collectedFields": {
    "name": null,
    "phone": null,
    "city": null,
    "legalArea": null,
    "shortDescription": null,
    "urgency": null,
    "bestContactTime": null
  },
  "classification": {
    "legalArea": null,
    "priority": "medium",
    "conversionPotential": 50,
    "immediateAttention": false,
    "summary": null
  },
  "safety": {
    "gaveLegalAdvice": false,
    "promisedOutcome": false,
    "impersonatedLawyer": false,
    "requiresHumanReview": true
  }
}
```

Toda resposta deve passar por validacao Zod antes de salvar ou enviar.

Se o JSON vier invalido:

- salvar falha tecnica sanitizada;
- nao enviar resposta automatica;
- marcar conversa como pendente para humano.

## Estrutura de arquivos desejada

Usar arquitetura Feature First.

Criar ou completar:

```txt
src/
  features/
    ai-assistant/
      actions.ts
      schemas/
        ai-response-schema.ts
      server/
        gemini-client.ts
        prompt.ts
        conversation-context.ts
        ai-orchestrator.ts
      data/
        ai-session-repository.ts
      types/
        ai-assistant.ts
```

Regras:

- chamadas ao Gemini ficam em `server/`;
- nenhum componente client pode importar cliente Gemini;
- nenhuma chave deve usar `NEXT_PUBLIC_`;
- prompts e schemas devem ficar versionados;
- regras juridicas devem ficar no prompt base e tambem em validacoes defensivas;
- atualizar `src/features/whatsapp/server/evolution-webhook.ts` apenas para chamar o orquestrador depois de salvar mensagem.

## Modelo de dados esperado

Tabelas existentes:

- `ai_sessions`
- `ai_messages`
- `ai_classifications`

Antes de alterar schema:

- consultar colunas reais no Supabase via MCP;
- verificar RLS;
- criar migration limpa em `supabase/migrations`;
- nao aplicar mudanca direta sem registrar migration quando a alteracao for definitiva.

Campos atuais observados:

- `ai_sessions`: `id`, `lead_id`, `conversation_id`, `contact_id`, `status`, `started_at`, `ended_at`, `metadata`;
- `ai_messages`: `id`, `ai_session_id`, `role`, `content`, `created_at`;
- `ai_classifications`: `id`, `lead_id`, `ai_session_id`, `legal_area`, `priority`, `conversion_potential`, `immediate_attention`, `summary`, `metadata`, `created_at`.

## Fases de implementacao

### Fase 1 - Pesquisa e desenho final

- [x] Revisar documentacao atual do Gemini.
- [x] Revisar documentacao atual da Evolution somente para webhook e envio de mensagem.
- [x] Confirmar se `@google/genai` instalado esta atualizado e compativel com a documentacao.
- [x] Confirmar variaveis necessarias em `.env.local` e `.env.example`.
- [x] Confirmar schema real das tabelas de IA no Supabase.
- [x] Definir modelo Gemini inicial.
- [x] Documentar decisao final antes de codar.

Saida esperada:

- modelo inicial definido como `gemini-2.5-flash`;
- `.env.example` possui `GEMINI_API_KEY`;
- `.env.local` existe, mas ainda nao possui `GEMINI_API_KEY`;
- sem a chave local, a IA falha de forma controlada e encaminha para humano;
- Evolution continua somente como canal WhatsApp, sem bots nativos de IA.

### Fase 2 - Cliente Gemini server-side

- [x] Criar `src/features/ai-assistant/server/gemini-client.ts`.
- [x] Usar `server-only`.
- [x] Ler `GEMINI_API_KEY` somente no servidor.
- [x] Criar erro claro para chave ausente.
- [x] Criar chamada com timeout e tratamento de erro.
- [x] Nao logar prompt completo, telefone, nome ou mensagem sensivel.

Validacao:

- [ ] Teste local controlado com prompt simples, sem WhatsApp.
- [x] `npm.cmd run typecheck`.
- [x] `npm.cmd run lint`.

### Fase 3 - Prompt base e schema

- [x] Criar prompt base juridico-comercial.
- [x] Incluir limites: nao advogado, nao promessa, nao parecer final.
- [x] Incluir objetivo: coletar dados e encaminhar humano.
- [x] Criar schema Zod da resposta.
- [x] Criar parser defensivo para JSON invalido.
- [x] Criar fallback para atendimento humano.

Validacao:

- [ ] Simular pergunta simples.
- [ ] Simular pergunta juridica complexa.
- [ ] Simular mensagem agressiva/confusa.
- [ ] Simular tentativa de obter promessa de resultado.

### Fase 4 - Contexto da conversa

- [x] Criar carregador de contexto da conversa.
- [x] Buscar contato, lead, cliente, conversa e ultimas mensagens relevantes.
- [x] Se ja for cliente convertido, IA nao deve tratar como novo lead.
- [x] Se lead perdido voltar, IA deve sinalizar possivel reabertura.
- [x] Limitar historico enviado ao Gemini.
- [x] Remover ou reduzir dados sensiveis desnecessarios.

Validacao:

- [ ] Conversa sem lead.
- [ ] Conversa com lead aberto.
- [ ] Conversa com cliente convertido.
- [ ] Conversa com lead perdido.

### Fase 5 - Sessao e persistencia da IA

- [x] Criar repositorio para `ai_sessions`.
- [x] Criar repositorio para `ai_messages`.
- [x] Criar repositorio para `ai_classifications`.
- [x] Salvar mensagem do usuario antes da chamada IA.
- [x] Salvar resposta da IA antes ou junto do envio WhatsApp.
- [x] Salvar classificacao vinculada ao lead quando houver lead.
- [x] Registrar evento em `lead_events` quando a IA classificar ou pedir atendimento humano.

Validacao:

- [ ] Conferir registros no Supabase via MCP.
- [ ] Garantir RLS sem expor dados ao browser.

### Fase 6 - Orquestrador da IA

- [x] Criar `ai-orchestrator.ts`.
- [x] Receber `conversationId` e `messageId`; `contactId` e `leadId` sao resolvidos pelo contexto salvo.
- [x] Decidir se a IA deve responder.
- [x] Bloquear IA se conversa estiver em atendimento humano ativo, quando essa regra existir.
- [x] Bloquear IA se mensagem for `fromMe`.
- [x] Bloquear IA em grupo.
- [x] Chamar Gemini.
- [x] Validar resposta.
- [x] Atualizar lead/conversa.
- [x] Retornar decisao de envio.

Validacao:

- [ ] Simular mensagem recebida normal.
- [ ] Simular mensagem enviada pela empresa.
- [x] Simular conversa ja atribuida a atendente.
- [ ] Simular falha do Gemini.

### Fase 7 - Integracao com webhook WhatsApp

- [x] Alterar `evolution-webhook.ts` somente depois que persistencia estiver pronta.
- [x] Chamar IA apenas depois de salvar `messages`.
- [x] Enviar resposta via Evolution somente se `shouldSendReply=true`.
- [x] Se envio falhar, manter mensagem e marcar status correto.
- [x] Atualizar conversa, lead, prioridade e historico comercial quando aplicavel.
- [ ] Revalidar rotas de conversas, leads, dashboard e pipeline quando necessario.

Validacao:

- [x] Testar recebimento real.
- [x] Testar resposta automatica curta.
- [ ] Testar falha da Evolution.
- [ ] Testar falha do Gemini.
- [x] Testar que nenhuma mensagem recebida se perde.

### Fase 8 - Controles no CRM

- [x] Criar configuracao para ativar/desativar IA.
- [x] Permitir escolher modo de operacao: desligada, assistida ou automatica controlada.
- [x] Permitir escolher modelo Gemini usado pela assistente.
- [x] Permitir editar personalidade, roteiro, estilo e diretrizes do escritorio.
- [x] Permitir editar contexto institucional do escritório em campo separado das regras.
- [x] Organizar configuração da IA em abas para evitar tela longa e confusa.
- [x] Criar simulador real da assistente no painel, sem alterar atendimentos reais.
- [x] Permitir pausar IA por conversa.
- [x] Exibir no chat quando a IA atuou.
- [x] Exibir resumo e classificação para a equipe.
- [x] Exibir resumo da IA em botão/modal no atendimento, sem poluir o topo do chat.
- [x] Permitir humano assumir atendimento.
- [x] Nao criar tela poluida ou tecnica.

Validacao:

- [x] Interface clara para usuario leigo.
- [x] Textos em portugues do Brasil com acentos corretos.
- [x] Nada de termos internos como payload, token, API key, prompt bruto ou mock.

Observação:

- Controle por conversa implementado com `ai_paused_at`, `ai_paused_by` e `ai_pause_reason` em `conversations`.
- Quando a equipe assume ou pausa um atendimento, a IA deixa de responder naquela conversa.
- Mensagens automáticas aparecem no chat com selo de IA e a última classificação fica visível para a equipe.
- Em teste real, uma mensagem recebida depois de `Assumir` foi salva no CRM e não gerou resposta automática da IA.
- Em teste real, `Assumir` e `Pausar IA` interrompem a resposta automática da IA sem bloquear envio e recebimento humano pelo WhatsApp.

### Fase 9 - Testes finais e endurecimento

- [x] Rodar `npm.cmd run typecheck`.
- [x] Rodar `npm.cmd run lint`.
- [x] Rodar `npm.cmd run build`.
- [x] Testar QR/conexão WhatsApp se a etapa tocar envio real.
- [x] Testar recebimento de WhatsApp.
- [x] Testar envio de mensagem pelo CRM.
- [x] Testar lead novo vindo do WhatsApp.
- [x] Testar que `Assumir` pausa a IA por conversa sem bloquear mensagens humanas.
- [x] Testar que `Pausar IA` pausa a IA por conversa sem bloquear mensagens humanas.
- [ ] Testar cliente convertido falando novamente.
- [ ] Testar lead perdido voltando.
- [ ] Testar pergunta jurídica complexa.
- [ ] Testar tentativa de fazer IA prometer resultado.
- [ ] Testar falha do Gemini.
- [ ] Testar falha da Evolution.
- [x] Conferir Supabase com MCP.
- [x] Atualizar este TODO com o que foi feito.

## Regras de validacao obrigatoria

No Windows/PowerShell deste projeto, usar:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Nao usar `npm run ...` se o PowerShell bloquear scripts.

Quando mexer em Supabase:

- usar MCP Supabase para consultar schema e validar dados;
- criar migration limpa quando mudar schema;
- revisar RLS;
- nao expor service role no browser.

Quando mexer em WhatsApp:

- Evolution API nunca deve ser chamada pelo frontend;
- webhook sempre server-side;
- mensagem recebida deve ser salva antes da IA;
- `fromMe` nunca cria lead novo;
- cliente convertido deve ser resolvido antes de lead aberto;
- instancia ausente deve virar `not_configured`, nao `disabled`.

Quando mexer em IA:

- Gemini nunca deve ser chamado pelo browser;
- prompt deve ser versionado;
- saida deve ser validada por schema;
- erro da IA nao pode quebrar atendimento;
- resposta automatica deve ser curta e segura;
- atendimento humano sempre tem prioridade.

## Criterio de pronto da etapa IA

A etapa de IA so pode ser considerada pronta quando:

- IA responde somente em casos permitidos;
- mensagens recebidas continuam sendo salvas mesmo se IA falhar;
- resposta automatica fica registrada no CRM;
- classificacao fica salva em `ai_classifications`;
- resumo aparece para a equipe;
- lead/conversa nao duplicam;
- cliente convertido nao vira novo lead;
- guardrails juridicos foram testados;
- equipe consegue assumir atendimento;
- validacoes locais passaram;
- Supabase foi conferido;
- comportamento foi testado com WhatsApp real.

## Comportamento esperado para a proxima IA que ler este arquivo

Antes de implementar:

1. Ler `AGENTS.md`.
2. Ler este `TODO.md`.
3. Ler `docs/analise.md`.
4. Conferir arquivos atuais do webhook e conversas.
5. Pesquisar documentacao atual do Gemini e Evolution.
6. Confirmar schema real no Supabase.
7. Implementar em fases pequenas.
8. Validar cada fase.
9. Nao pular direto para bot pronto da Evolution.
10. Nao mudar regra comercial sem verificar impacto em lead, cliente, conversa e pipeline.
