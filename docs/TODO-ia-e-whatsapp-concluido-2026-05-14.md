# Guia de IA e WhatsApp - Etapa Consolidada

Atualizado em: 15/05/2026

Este documento registra a etapa de IA integrada ao WhatsApp e serve como histórico técnico-operacional. O checklist vivo do projeto permanece no `TODO.md` da raiz.

## Objetivo

Usar a IA como assistente inicial do atendimento comercial pelo WhatsApp, com controle humano, rastreabilidade e limites jurídicos claros.

A IA deve ajudar a equipe a:

- acolher o primeiro contato;
- coletar informações básicas;
- classificar área jurídica, prioridade e potencial;
- resumir o atendimento;
- responder mensagens simples e seguras;
- encaminhar para humano quando necessário;
- evitar perda de lead em momentos de alto volume.

## Decisão Arquitetural

Decisão aprovada:

- Evolution API é o canal de WhatsApp.
- O CRM é o cérebro da operação.
- Gemini via AI Studio é o motor inicial da IA.
- Supabase é o registro oficial de leads, mensagens, sessões e classificações.

Não usar nesta etapa:

- bot nativo da Evolution;
- OpenAI Bot da Evolution;
- Typebot;
- Dify;
- n8n;
- Flowise;
- EvoAI;
- automações paralelas que respondam fora do CRM.

Motivo: a mensagem precisa ser salva antes da IA, a resposta precisa aparecer no CRM, o humano precisa conseguir assumir, e a classificação precisa ficar vinculada ao lead/conversa no Supabase.

## Estado Atual Implementado

- [x] Página `/crm/ia`.
- [x] Configuração de operação, modelo, comportamento, contexto e teste.
- [x] Abas funcionais na tela de IA.
- [x] Gemini 2.5 Flash configurado como modelo operacional.
- [x] Chamada ao Gemini somente no servidor.
- [x] Validação estruturada da resposta.
- [x] Prompt com limites jurídicos.
- [x] Teste manual da assistente pela tela do CRM.
- [x] Webhook salva a mensagem recebida antes da IA.
- [x] IA responde automaticamente pelo WhatsApp quando a conversa permite.
- [x] Mensagem automática fica salva no CRM.
- [x] Chat exibe identificação de mensagem gerada pela IA.
- [x] Resumo/classificação ficam disponíveis por botão no atendimento.
- [x] `Assumir` pausa a IA naquela conversa.
- [x] `Pausar IA` pausa a IA naquela conversa.
- [x] Mensagens humanas continuam funcionando depois da pausa.
- [x] Registros reais encontrados em `ai_sessions`, `ai_messages` e `ai_classifications`.
- [x] Chat mostra estado global da IA quando ela está desativada no painel administrativo.
- [x] Chat diferencia IA automática ativa, IA assistida, IA desativada no painel, IA pausada e humano assumido.
- [x] Ação `Devolver para IA` remove o responsável humano da conversa para permitir automação novamente.
- [x] Quando a IA está desativada globalmente, o chat não oferece `Pausar IA` como se a automação estivesse ativa.
- [x] Notas internas podem ser consultadas em lista própria dentro do chat, além de continuarem no histórico.
- [x] Áudio recebido pelo WhatsApp pode ser transcrito com Gemini no servidor para a IA usar no atendimento.
- [x] Chat marca mensagens de áudio transcritas com o selo `Transcrição do áudio`.

## Fluxo Correto

1. Contato envia mensagem para o WhatsApp da empresa.
2. Evolution API chama o webhook server-side.
3. O sistema normaliza o telefone.
4. O sistema resolve contato, lead e conversa.
5. A mensagem recebida é salva no banco.
6. Se for áudio com anexo baixável, o servidor baixa o arquivo privado e pede ao Gemini uma transcrição.
7. A transcrição fica no `body` da mensagem, com metadados indicando origem Gemini, e o anexo original permanece no chat.
8. O sistema verifica se a conversa permite IA.
9. O sistema verifica se a IA está ativada globalmente e se o modo permite envio automático.
10. O sistema bloqueia a automação quando a conversa está pausada, encerrada ou assumida por humano.
11. O sistema monta contexto seguro para o Gemini.
12. Gemini devolve resposta e classificação estruturadas.
13. O sistema valida a resposta.
14. A resposta automática é enviada pelo WhatsApp quando permitida.
15. A mensagem da IA, sessão e classificação são salvas.
16. A equipe vê o atendimento no CRM.
17. Um humano pode assumir, pausar a IA ou devolver a conversa para a automação.

Regra obrigatória: se qualquer etapa de IA falhar, a mensagem recebida deve continuar salva e visível para a equipe.

## Dados Que a IA Pode Usar

A IA pode usar somente dados necessários ao primeiro atendimento:

- mensagens recentes da conversa;
- transcrições de áudio recebidas pelo WhatsApp;
- nome quando informado;
- telefone normalizado;
- cidade quando informada;
- área jurídica provável;
- urgência;
- melhor horário de contato;
- contexto preenchido pelo escritório na tela de IA;
- diretrizes e limites configurados pelo escritório;
- dados comerciais do lead necessários para triagem.

A IA não deve usar nem inventar:

- estratégia jurídica final;
- promessa de resultado;
- informação processual inexistente;
- dados pessoais não informados;
- decisão jurídica conclusiva.

## Limites Jurídicos

A IA pode:

- fazer acolhimento;
- pedir informações;
- explicar que a equipe irá analisar;
- orientar o próximo passo comercial;
- registrar urgência;
- chamar humano quando houver risco, dúvida ou pedido explícito.

A IA não pode:

- dizer que é advogada;
- prometer êxito;
- garantir prazo ou resultado;
- dar parecer jurídico definitivo;
- orientar ação processual como decisão final;
- insistir quando o contato pedir atendimento humano.

## Controle Humano

O humano sempre tem prioridade.

Ações disponíveis no atendimento:

- `Assumir`: indica que a equipe assumiu a conversa e pausa a IA.
- `Pausar IA`: interrompe respostas automáticas naquela conversa.
- `Devolver para IA`: remove o responsável humano e permite que a próxima mensagem recebida seja processada pela automação, desde que a IA global esteja ativa.
- `Resumo da IA`: abre modal com classificação, dados identificados e alertas.
- `Alterar status`: mantém controle operacional do atendimento.
- `Transferir`: repassa a conversa para outro responsável.
- `Notas internas`: permite ver notas salvas em lista própria e registrar nova observação sem enviar ao cliente.

O topo do chat deve mostrar o estado real da automação:

- `IA automática ativa`: painel global em modo automático, conversa sem pausa local e sem humano assumido.
- `IA sem envio automático`: painel global em modo assistido.
- `IA desativada no painel`: IA desligada em `/crm/ia`.
- `IA pausada`: pausa aplicada naquela conversa.
- `Humano assumiu`: conversa possui responsável humano e não deve responder automaticamente.

## Persistência

Tabelas envolvidas:

- `conversations`;
- `messages`;
- `leads`;
- `contacts`;
- `ai_sessions`;
- `ai_messages`;
- `ai_classifications`;
- `lead_events`.

Regras:

- mensagem recebida deve entrar em `messages` antes da IA;
- resposta da IA deve entrar em `messages` como saída automática;
- sessão e classificação devem ficar vinculadas à conversa e ao lead quando houver;
- humano assumindo a conversa deve impedir nova resposta automática naquela conversa;
- devolver conversa para a IA deve remover `conversations.assigned_to`;
- IA desligada no painel deve bloquear resposta automática e aparecer no chat como configuração global;
- áudio sem transcrição não deve acionar resposta automática da IA;
- mensagem `fromMe` não pode criar lead novo.

## Arquivos Principais

- `src/features/ai-assistant/server/gemini-client.ts`
- `src/features/ai-assistant/server/ai-orchestrator.ts`
- `src/features/ai-assistant/server/prompt.ts`
- `src/features/ai-assistant/server/conversation-context.ts`
- `src/features/ai-assistant/data/ai-settings.ts`
- `src/features/ai-assistant/data/ai-session-repository.ts`
- `src/features/ai-assistant/components/ai-settings-form.tsx`
- `src/features/whatsapp/server/evolution-webhook.ts`
- `src/features/conversations/actions.ts`
- `src/features/conversations/components/conversation-actions.tsx`
- `src/features/conversations/data/conversation-directory.ts`

## Pendências de Endurecimento

- [ ] Testar cliente convertido falando novamente.
- [ ] Testar lead perdido voltando.
- [ ] Testar `Devolver para IA` com WhatsApp real e confirmar resposta automática na mensagem seguinte.
- [ ] Testar IA desligada no painel e confirmar badge `IA desativada no painel` no chat.
- [ ] Testar modo assistido e confirmar badge `IA sem envio automático` no chat.
- [ ] Validar visualmente `Notas internas` em desktop e celular.
- [ ] Testar áudio real recebido pelo WhatsApp e confirmar transcrição, selo no chat e resposta automática.
- [ ] Testar pergunta jurídica complexa.
- [ ] Testar tentativa de fazer a IA prometer resultado.
- [ ] Testar falha do Gemini.
- [ ] Testar falha da Evolution.
- [ ] Confirmar que falha da IA não impede mensagens humanas.
- [ ] Avaliar fila/job assíncrono para produção se o webhook ficar lento.
- [ ] Revisar logs sanitizados para diagnóstico sem expor dados sensíveis.

## Validação Obrigatória ao Alterar IA

No PowerShell deste projeto:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Além disso:

- testar a aba `Teste` em `/crm/ia`;
- testar WhatsApp real;
- confirmar persistência em `messages`;
- confirmar persistência em `ai_sessions`, `ai_messages` e `ai_classifications`;
- confirmar botão `Assumir`;
- confirmar botão `Pausar IA`;
- confirmar botão `Resumo da IA`;
- confirmar que a IA não promete resultado jurídico.
