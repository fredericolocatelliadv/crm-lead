# TODO - Estado Atual e Próximas Entregas

Este arquivo é o checklist vivo do projeto. Ele deve orientar a próxima etapa de implementação sem substituir o `AGENTS.md`, que permanece como arquivo de regras.

Atualizado em: 14/05/2026

## Estado Geral

O sistema já possui uma base funcional para site público, CRM, WhatsApp, IA, SEO, marketing, privacidade e perfil do usuário.

Última entrega registrada:

- menu lateral do CRM recolhível;
- botão de recolher/expandir dentro do menu, acima do Dashboard;
- menu de perfil no topo ao lado da troca de tema;
- página `/crm/perfil`;
- edição de dados básicos do usuário;
- upload de foto de perfil para Supabase Storage;
- bucket `profile-avatars`;
- coluna `profiles.avatar_storage_path`;
- correção do aviso do React sobre formulário com Server Action;
- commit enviado ao GitHub: `9935316 Add CRM user profile management`.

## Validações Recentes

- [x] `npm.cmd run typecheck`
- [x] `npm.cmd run lint`
- [x] `npm.cmd run build`
- [x] Verificado bucket `profile-avatars` no Supabase.
- [x] Verificadas policies de Storage para avatar de perfil.
- [x] Verificada coluna `profiles.avatar_storage_path`.
- [x] WhatsApp com QR Code, conexão, envio e recebimento funcionando em teste real.
- [x] Mensagens recebidas do WhatsApp aparecem no CRM.
- [x] IA respondeu automaticamente em teste real.
- [x] `Assumir` e `Pausar IA` interrompem resposta automática sem bloquear mensagens humanas.

## Site Público, SEO, Marketing e Privacidade

- [x] Configurações editáveis para SEO e marketing no CRM.
- [x] Campos controlados para Google Tag Manager, GA4, Meta Pixel, Search Console e verificação Meta.
- [x] Tags carregadas somente no site público.
- [x] Eventos de conversão sem dados pessoais.
- [x] Captura de UTMs, `gclid` e `fbclid`.
- [x] `sitemap.ts` e `robots.ts`.
- [x] Metadata, canonical, Open Graph e Twitter Card.
- [x] Política de Privacidade, Termos de Uso e Política de Cookies.
- [x] Banner de cookies com aceitar, recusar e personalizar.
- [x] Personalização de cookies em modal, evitando poluição visual.
- [x] Registro de ciência de privacidade e consentimento opcional nos leads.
- [ ] Revisão jurídica final dos documentos legais pelo escritório.
- [ ] Testar site público com GTM real configurado.
- [ ] Testar site público com Meta Pixel real configurado.
- [ ] Confirmar no navegador que eventos não disparam dentro do CRM.
- [ ] Confirmar no navegador que payloads de marketing não carregam nome, telefone, e-mail ou mensagem.

## CRM e Navegação

- [x] Dashboard comercial.
- [x] Leads.
- [x] Pipeline.
- [x] Conversas.
- [x] WhatsApp.
- [x] Clientes.
- [x] Blog.
- [x] Relatórios.
- [x] Usuários.
- [x] Configurações.
- [x] Assistente IA.
- [x] Perfil do usuário.
- [x] Tema claro/escuro.
- [x] Menu lateral recolhível no desktop.
- [x] Menu mobile fecha ao escolher uma página.
- [x] Destaque ativo do menu usa a rota real, sem manter Dashboard marcado fora da página.
- [ ] Validar visualmente todas as telas principais em desktop e celular antes da homologação.
- [ ] Revisar estados vazios e mensagens de erro em telas operacionais.

## Perfil do Usuário

- [x] Criar página `/crm/perfil`.
- [x] Criar menu de perfil no header.
- [x] Permitir edição de nome completo.
- [x] Permitir edição de telefone, cargo e departamento quando disponíveis.
- [x] Permitir upload de foto de perfil.
- [x] Salvar foto no bucket `profile-avatars`.
- [x] Remover avatar antigo ao substituir imagem.
- [x] Validar tamanho máximo de 3 MB.
- [x] Validar MIME types de imagem.
- [x] Remover `encType` manual de formulário com Server Action.
- [ ] Fazer teste visual autenticado de troca real de foto no CRM.

## WhatsApp

- [x] Integração server-side com Evolution API.
- [x] Página `/crm/whatsapp`.
- [x] QR Code de conexão.
- [x] Atualização automática de estado da conexão.
- [x] Desativar uso no CRM sem apagar histórico.
- [x] Reativar conexão.
- [x] Desconectar pelo endpoint da Evolution.
- [x] Excluir instância pela Evolution e limpar estado local.
- [x] Confirmações profissionais para ações críticas.
- [x] Receber texto, imagem e áudio.
- [x] Enviar texto, imagem e áudio pelo CRM.
- [x] Criar contato e lead automaticamente quando necessário.
- [x] Não criar lead novo para mensagem `fromMe`.
- [x] Persistir mensagem antes de IA ou automação.
- [ ] Testar falha da Evolution API sem perder mensagem ou histórico.
- [ ] Testar cliente convertido falando novamente.
- [ ] Testar lead perdido voltando.

## Inteligência Artificial

- [x] Página `/crm/ia`.
- [x] Configuração por abas funcionais: operação, comportamento, contexto e teste.
- [x] Gemini 2.5 Flash como modelo configurado.
- [x] Chamada ao Gemini somente no servidor.
- [x] Saída validada antes de salvar.
- [x] Resposta automática pelo WhatsApp quando a conversa permite.
- [x] Registro em `ai_sessions`, `ai_messages` e `ai_classifications`.
- [x] Selo no chat para mensagem gerada pela IA.
- [x] Botão `Resumo da IA` abre modal com classificação e dados coletados.
- [x] Botão `Assumir` pausa IA por conversa.
- [x] Botão `Pausar IA` pausa IA por conversa.
- [x] Prompt base preenchido com comportamento profissional e seguro.
- [ ] Testar pergunta jurídica complexa.
- [ ] Testar tentativa de fazer a IA prometer resultado.
- [ ] Testar falha do Gemini.
- [ ] Avaliar fila/job assíncrono para produção caso o webhook fique lento.

## Banco, Segurança e Produção

- [x] Supabase como Postgres, Auth, Storage e Realtime.
- [x] RLS ativo nas tabelas públicas verificadas.
- [x] Service role isolada no servidor.
- [x] Storage privado para anexos do CRM.
- [x] Storage público controlado para imagens do site, blog e avatar.
- [x] Migrations recentes versionadas em `supabase/migrations`.
- [ ] Ativar proteção contra senhas vazadas no Supabase Auth.
- [ ] Revisar grants do role `anon` antes de produção.
- [ ] Revisar policies duplicadas apontadas por advisor de performance.
- [ ] Criar ou revisar rate limit para endpoints públicos de lead.
- [ ] Validar backup e recuperação antes de produção.

## Comandos de Validação

No PowerShell deste projeto, usar:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Quando alterar banco:

- criar migration limpa;
- validar RLS e Storage policies;
- consultar Supabase pelo MCP;
- rodar advisors quando a mudança tocar segurança ou performance.

Quando alterar WhatsApp:

- testar QR Code;
- testar envio e recebimento real;
- testar desconexão, desativação, reativação e exclusão;
- confirmar que mensagem recebida é salva antes da IA.

Quando alterar IA:

- testar no simulador da página `/crm/ia`;
- testar com WhatsApp real;
- confirmar que humano consegue assumir;
- confirmar que classificação aparece para a equipe;
- confirmar que falha da IA não quebra o atendimento.
