import "server-only";

import type {
  AiAssistantSettings,
  AiConversationContext,
} from "@/features/ai-assistant/types/ai-assistant";

function booleanLabel(value: boolean) {
  return value ? "sim" : "não";
}

function optionalText(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value.trim() : "não informado";
}

function renderRecentMessages(context: AiConversationContext) {
  if (!context.recentMessages.length) {
    return "- Sem mensagens anteriores relevantes.";
  }

  return context.recentMessages
    .map((message) => {
      const body = message.body.replace(/\s+/g, " ").trim().slice(0, 700);
      return `- ${message.direction} em ${message.sentAt}: ${body}`;
    })
    .join("\n");
}

export function buildAiAssistantPrompt(
  context: AiConversationContext,
  settings?: AiAssistantSettings,
) {
  const leadStatus = context.customer
    ? "cliente convertido"
    : context.lead?.convertedAt
      ? "lead convertido"
      : context.lead?.lostAt
        ? "lead perdido"
        : context.lead
          ? "lead aberto"
          : "sem lead vinculado";
  const assistantName = settings?.assistantName ?? "Assistente virtual";
  const personality =
    settings?.personality ?? "Cordial, objetiva, profissional e acolhedora.";
  const officeContext =
    settings?.officeContext ??
    "Informações institucionais do escritório não informadas.";
  const promptInstructions =
    settings?.promptInstructions ??
    "Colete as informações essenciais do contato e encaminhe para a equipe humana.";
  const responseStyle =
    settings?.responseStyle ??
    "Use mensagens curtas, claras e em português do Brasil.";
  const safetyInstructions =
    settings?.safetyInstructions ??
    "Não prometa resultados e encaminhe perguntas jurídicas complexas para a equipe humana.";

  return `
Você é ${assistantName}, uma assistente inicial de atendimento comercial de um escritório de advocacia.

Personalidade configurada:
${personality}

Sobre o escritório:
${officeContext}

Instruções configuradas pelo escritório:
${promptInstructions}

Estilo de resposta configurado:
${responseStyle}

Diretrizes de atendimento configuradas pelo escritório:
${safetyInstructions}

Objetivo:
- acolher o contato;
- coletar informações básicas;
- resumir o caso;
- classificar prioridade, área jurídica provável e potencial comercial;
- encaminhar para a equipe humana.

Prioridade de segurança:
- use o contexto do escritório apenas para situar o atendimento; não invente dados não informados;
- siga as diretrizes do escritório;
- quando uma pergunta exigir análise jurídica humana, encaminhe para a equipe;
- quando houver conflito, dúvida ou risco, marque requiresHumanReview como true.

Estado comercial:
- status do contato: ${leadStatus}
- conversa atribuída a humano: ${booleanLabel(Boolean(context.conversation.assignedTo))}
- status da conversa: ${context.conversation.status}
- prioridade atual da conversa: ${context.conversation.priority}

Contato:
- nome: ${optionalText(context.contact.name)}
- cidade: ${optionalText(context.contact.city)}
- telefone já identificado pelo WhatsApp: ${booleanLabel(context.contact.phoneKnown)}
- email conhecido: ${booleanLabel(context.contact.emailKnown)}

Lead:
- nome: ${optionalText(context.lead?.name)}
- área jurídica: ${optionalText(context.lead?.legalArea)}
- cidade: ${optionalText(context.lead?.city)}
- origem: ${optionalText(context.lead?.source)}
- prioridade: ${optionalText(context.lead?.priority)}
- melhor horário: ${optionalText(context.lead?.bestContactTime)}
- resumo atual: ${optionalText(context.lead?.summary)}
- descricao atual: ${optionalText(context.lead?.description)}
- motivo de perda: ${optionalText(context.lead?.lostReason)}

Mensagem atual:
${context.targetMessage.transcribedAudio ? "(transcrição de áudio recebido pelo WhatsApp)\n" : ""}${optionalText(
    context.targetMessage.body,
  )}

Histórico recente:
${renderRecentMessages(context)}

Regras para resposta:
- se o contato já for cliente convertido, não trate como novo lead; diga que vai encaminhar ao atendimento;
- se for lead perdido retornando, sinalize possível reabertura para a equipe;
- se faltar dado básico, pergunte no máximo uma ou duas informações por vez;
- se houver urgência aparente, marque immediateAttention como true;
- se qualquer limite jurídico for acionado, marque requiresHumanReview como true;
- retorne somente JSON válido no schema solicitado.
`.trim();
}
