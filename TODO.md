# TODO - Estado Atual e Próximas Entregas

Este arquivo é o checklist vivo do projeto. Ele deve orientar a próxima etapa de implementação sem substituir o `AGENTS.md`, que permanece como arquivo de regras.

Atualizado em: 15/05/2026

## Estado Geral

O sistema já possui uma base funcional para site público, CRM, WhatsApp, IA, SEO, marketing, privacidade e perfil do usuário.

Últimas entregas registradas:

- gestão real de usuários internos em `/crm/usuarios`;
- perfis profissionais `Administrador`, `Advogado` e `Especialista de Marketing`;
- proteção de menu, rotas, Server Actions e policies conforme permissões;
- vínculo opcional entre usuário advogado e equipe exibida no site;
- commit enviado ao GitHub: `a9f9945 Add professional user permissions`;
- chat com aba para ver notas internas salvas sem rolar o histórico completo;
- ação `Devolver para IA` remove o responsável humano e permite automação novamente;
- chat mostra o estado real da IA considerando o painel global: automática ativa, assistida, desativada no painel, pausada na conversa ou humano assumiu;
- quando a IA está desativada no painel, o chat mostra `IA desativada` e não oferece `Pausar IA` como se a automação estivesse ativa;
- áudios recebidos pelo WhatsApp podem ser transcritos com Gemini no servidor antes de a IA responder;
- `/crm/ia` permite ativar transcrição de áudio quando a assistente está desligada, mantendo o controle desativado quando a IA está assistida ou automática.

Próxima entrega planejada:

- validar visualmente o fluxo autenticado do chat após os ajustes de notas internas e estado da IA;
- testar na prática `Devolver para IA` seguido de nova mensagem recebida pelo WhatsApp;
- testar a indicação `IA desativada no painel` após desligar a IA em `/crm/ia`;
- testar áudio real recebido pelo WhatsApp e confirmar transcrição, selo `Transcrição do áudio` e resposta automática da IA;
- testar áudio real com IA desligada e transcrição ativada em `/crm/ia`, confirmando transcrição sem resposta automática;
- finalizar validações operacionais dos perfis profissionais em `/crm/usuarios`.

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
- [x] `Devolver para IA` remove responsável humano para permitir resposta automática novamente.
- [x] Chat sinaliza quando a IA está desativada no painel administrativo.
- [x] `Notas internas` permite ver notas salvas em lista própria e criar nova nota.
- [x] Typecheck passou após implementar transcrição de áudio com Gemini.
- [x] Typecheck passou após separar transcrição de áudio para IA desligada.

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
- [x] Captura rápida de WhatsApp sem pedir telefone, usando intenção temporária e protocolo para vincular o número real quando a mensagem chegar.
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
- [x] Conversa mostra notas internas salvas sem exigir rolagem pelo histórico inteiro.
- [x] Conversa mostra badge operacional do estado real da IA no topo do atendimento.
- [ ] Validar visualmente todas as telas principais em desktop e celular antes da homologação.
- [ ] Validar visualmente o modal `Notas internas` no chat em desktop e celular.
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

## Usuários e Permissões Profissionais

Objetivo: transformar o menu `Usuários` em uma área administrativa real para cadastrar, ativar, inativar e controlar acessos internos do escritório, sem criar módulos fora do escopo comercial do CRM.

### Perfis Oficiais

- [x] Manter `Administrador` como perfil de controle total do sistema.
- [x] Criar perfil `Advogado` para operação jurídica e comercial.
- [x] Criar perfil `Especialista de Marketing` para conteúdo, campanha e análise de captação.
- [x] Remover da interface pública do CRM os perfis antigos `Gestor` e `Atendente`, mantendo compatibilidade técnica se ainda existirem registros no banco.
- [x] Definir textos claros no painel explicando o que cada perfil pode acessar, sem linguagem técnica.

### Permissões por Perfil

Administrador:

- [x] Pode acessar Dashboard, Leads, Pipeline, Conversas, WhatsApp, IA, Clientes, Blog, Relatórios, Usuários e Configurações.
- [x] Pode cadastrar, editar, ativar, inativar e alterar perfil de usuários.
- [x] Pode configurar IA, WhatsApp, SEO, marketing, site e regras operacionais.
- [x] Não pode remover o próprio acesso de administrador.
- [x] Não pode deixar o sistema sem pelo menos um administrador ativo.

Advogado:

- [x] Pode acessar Dashboard.
- [x] Pode acessar Leads.
- [x] Pode acessar Pipeline.
- [x] Pode acessar Conversas.
- [x] Pode acessar WhatsApp em modo operacional permitido, sem ações destrutivas de instância.
- [x] Pode acessar Clientes.
- [x] Pode acessar Blog, criar e editar publicações.
- [x] Pode acessar Relatórios.
- [x] Não pode acessar IA.
- [x] Não pode acessar Configurações do sistema.
- [x] Não pode acessar Usuários e permissões.
- [x] Pode ser marcado como membro da equipe do site.
- [x] Quando marcado para aparecer no site, deve preencher dados públicos como cargo, OAB, bio, foto, e-mail, WhatsApp, Instagram, LinkedIn e posição.
- [x] Quando não marcado para aparecer no site, continua sendo apenas usuário interno do CRM.

Especialista de Marketing:

- [x] Pode acessar Dashboard.
- [x] Pode acessar Leads para análise de origem e campanha.
- [x] Pode acessar Blog, criar e editar publicações.
- [x] Pode acessar Relatórios.
- [x] Pode acessar somente a parte de Marketing e SEO das Configurações.
- [x] Não pode acessar Conversas.
- [x] Não pode acessar WhatsApp.
- [x] Não pode acessar IA.
- [x] Não pode acessar Clientes.
- [x] Não pode acessar Usuários e permissões.
- [x] Não pode alterar configurações operacionais sensíveis do escritório.
- [x] Não precisa ter vínculo com equipe exibida no site.

### Banco de Dados e Auth

- [x] Verificar enum `app_role` atual no Supabase antes de alterar.
- [x] Criar migration para incluir `lawyer` e `marketing` no enum `app_role`, se ainda não existirem.
- [x] Manter `admin` como role obrigatória para gerenciamento de usuários.
- [x] Avaliar se `manager` e `attendant` ficam como legado técnico ou se serão migrados para os novos perfis.
- [x] Usar Supabase Auth Admin somente em código server-side para criar usuários.
- [x] Nunca expor service role no navegador.
- [x] Criar usuário com senha inicial definida pelo administrador, sem depender de convite por e-mail.
- [x] Confirmar e-mail automaticamente no cadastro interno, pois o acesso será controlado pela administração do CRM.
- [x] Permitir redefinir senha na edição do usuário sem armazenar senha no banco do CRM.
- [x] Criar ou atualizar registro em `profiles` ao cadastrar usuário.
- [x] Criar ou atualizar registro em `user_roles` ao cadastrar ou alterar perfil.
- [x] Criar campo ou vínculo seguro para relacionar usuário advogado com `team_members`, sem duplicar dados desnecessariamente.
- [x] Garantir RLS para leitura e alteração de usuários apenas por administrador.
- [x] Garantir que advogado e marketing não consigam alterar permissões via requisição direta.

### Tela `/crm/usuarios`

- [x] Adicionar botão `Novo usuário`.
- [x] Criar formulário em modal, drawer ou página dedicada, sem colocar formulário lado a lado com a tabela.
- [x] Campos mínimos: nome completo, e-mail, senha inicial, telefone opcional, perfil, status ativo.
- [x] Para edição, permitir nova senha opcional com confirmação.
- [x] Para advogado, exibir seção opcional `Exibir este advogado no site`.
- [x] Para advogado exibido no site, permitir preencher OAB, cargo, bio, foto, e-mail público, WhatsApp, Instagram, LinkedIn e posição.
- [x] Para marketing, ocultar campos de equipe do site.
- [x] Listar usuários com nome, e-mail, perfil, status, data de criação e ações.
- [x] Permitir ativar e inativar usuário com confirmação profissional.
- [x] Permitir alterar perfil com confirmação profissional.
- [x] Mostrar avisos simples para impactos de cada ação, em linguagem de cliente leigo.
- [x] Manter estados vazios e erros em português correto.

### Menu, Rotas e Ações

- [x] Filtrar itens do menu conforme permissões do perfil logado.
- [x] Proteger páginas no servidor, não apenas esconder menu.
- [x] Bloquear `/crm/ia` para Advogado e Marketing.
- [x] Bloquear `/crm/configuracoes` geral para Advogado.
- [x] Permitir ao Marketing apenas a área de Marketing e SEO, sem acesso a configurações operacionais.
- [x] Bloquear `/crm/usuarios` para Advogado e Marketing.
- [x] Bloquear ações críticas de WhatsApp para Advogado quando envolver excluir, desconectar, desativar ou reconfigurar instância.
- [x] Bloquear Server Actions por permissão real, não apenas por estado visual.
- [x] Revisar policies de `blog_posts`, `team_members`, `site_settings`, `profiles` e `user_roles` para refletir os novos perfis.

### Integração com Equipe do Site

- [x] Reaproveitar `team_members` para exibição pública de advogados.
- [x] Criar vínculo entre usuário advogado e membro da equipe quando necessário.
- [x] Permitir editar dados públicos do advogado a partir do cadastro de usuário.
- [x] Manter a seção `Equipe` do site consumindo apenas membros ativos.
- [x] Não criar membro de equipe para Especialista de Marketing.
- [x] Não obrigar advogado interno a aparecer no site.

### Validação da Entrega

- [ ] Testar cadastro de Administrador.
- [ ] Testar cadastro de Advogado sem exibição no site.
- [ ] Testar cadastro de Advogado com exibição no site.
- [ ] Testar cadastro de Especialista de Marketing.
- [ ] Testar que Advogado não vê nem acessa IA, Configurações e Usuários.
- [ ] Testar que Marketing não vê nem acessa Conversas, WhatsApp, IA, Clientes e Usuários.
- [ ] Testar que Marketing acessa Blog, Relatórios e Marketing/SEO.
- [ ] Testar que Administrador continua acessando tudo.
- [ ] Testar tentativa direta por URL em páginas bloqueadas.
- [ ] Testar tentativa direta de Server Action sem permissão.
- [x] Rodar `npm.cmd run typecheck`.
- [x] Rodar `npm.cmd run lint`.
- [x] Rodar `npm.cmd run build`.
- [x] Validar RLS e policies no Supabase após migration.
- [x] Rodar advisors do Supabase se a mudança tocar policies, roles ou grants.
- [x] Testar criação direta no Supabase Auth com senha e remoção de usuário temporário.

Observações dos advisors em 14/05/2026:
- Segurança: `site_whatsapp_intents` está com RLS ativo e sem policy pública; manter assim se a tabela continuar sendo usada apenas por fluxo server-side/service role, ou criar policies explícitas quando houver acesso autenticado.
- Segurança: leaked password protection do Supabase Auth está desativado; ativar antes de produção.
- Performance: há foreign keys sem índice em `ai_assistant_settings.updated_by`, `conversations.ai_paused_by` e `site_whatsapp_intents.contact_id/lead_id`; revisar em migration de performance.
- Performance: índices recém-criados e operacionais aparecem como não utilizados por falta de volume/uso real; não remover agora sem dados de produção.

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
- [x] Transcrever áudio recebido pelo WhatsApp com Gemini no servidor para uso da IA.
- [x] Criar contato e lead automaticamente quando necessário.
- [x] Não criar lead novo para mensagem `fromMe`.
- [x] Persistir mensagem antes de IA ou automação.
- [x] Vincular atendimento iniciado pelo site ao lead real quando o webhook receber o protocolo do WhatsApp.
- [x] Sincronizar responsável da conversa com o lead vinculado ao assumir, transferir ou responder manualmente.
- [x] Corrigir leads existentes sem responsável quando já havia conversa atribuída.
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
- [x] Botão `Devolver para IA` libera a conversa assumida por humano, removendo o responsável para a automação voltar.
- [x] Chat considera a configuração global de `/crm/ia` antes de exibir ações de automação.
- [x] Chat mostra `IA desativada no painel` quando a IA global está desligada.
- [x] Chat mostra `IA sem envio automático` quando a IA está em modo assistido.
- [x] Chat não oferece `Pausar IA` quando a IA está desativada no painel.
- [x] IA usa transcrição de áudio recebida pelo WhatsApp quando o áudio possui anexo baixável no Storage.
- [x] `/crm/ia` tem controle separado para transcrição de áudio com IA desligada.
- [x] O controle de transcrição fica desativado quando a IA está em modo assistido ou automático.
- [x] Prompt base preenchido com comportamento profissional e seguro.
- [ ] Testar `Devolver para IA` com WhatsApp real e confirmar resposta automática na mensagem seguinte.
- [ ] Testar áudio real recebido pelo WhatsApp e confirmar transcrição, selo no chat e resposta automática.
- [ ] Testar áudio real com IA desligada e transcrição ativada, confirmando que não há resposta automática.
- [ ] Testar desligamento global da IA em `/crm/ia` e confirmação visual no chat.
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
