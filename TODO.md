# TODO - SEO, Marketing e Privacidade

Este arquivo guia somente a feature de SEO, marketing, rastreamento e privacidade do site público.

## Objetivo

Preparar o site para tráfego pago, mensuração de conversões, busca orgânica e controles básicos de privacidade sem exigir alteração de código toda vez que a equipe precisar configurar Google, Meta, SEO ou documentos legais.

## Escopo

- Criar configurações editáveis no CRM para SEO e marketing.
- Permitir que o cliente informe IDs oficiais de rastreamento, sem colar scripts livres.
- Carregar tags somente no site público, nunca dentro do CRM.
- Registrar eventos de conversão quando um lead for capturado.
- Preservar UTMs e parâmetros de campanha no lead.
- Melhorar metadados, canonical, sitemap e robots do site público.
- Publicar Política de Privacidade, Termos de Uso e Política de Cookies.
- Permitir edição desses documentos pelo CRM.
- Registrar ciência de privacidade e consentimento opcional de marketing nos leads do site.

## Fora do Escopo

- Não criar dashboard completo de mídia paga.
- Não criar gerenciador de campanhas.
- Não substituir Google Analytics, Google Ads, Search Console, Meta Business ou Meta Events Manager.
- Não permitir JavaScript livre inserido pelo usuário.
- Não alterar a IA, WhatsApp, pipeline ou CRM comercial além do necessário para origem, UTM e conversão.

## Decisão Técnica

- Usar campos controlados para IDs oficiais, evitando área de script livre por segurança.
- Preferir Google Tag Manager como camada principal de marketing.
- Suportar campos diretos para GA4, Meta Pixel, verificações de domínio e SEO básico.
- Não enviar nome, telefone, e-mail ou conteúdo sensível em eventos de marketing.
- Executar lógica privilegiada no servidor quando houver persistência em banco.
- Manter o CRM sem scripts de marketing para evitar rastreamento interno da equipe.

## Fase 1 - Auditoria do Projeto

- [x] Revisar configurações atuais do site em banco e código.
- [x] Confirmar onde as configurações públicas são lidas no site.
- [x] Confirmar como o formulário público cria lead.
- [x] Confirmar como o formulário simples de WhatsApp cria lead.
- [x] Confirmar se já existe sitemap, robots e metadados por página.
- [x] Mapear onde inserir os eventos sem duplicar conversões.

## Fase 2 - Banco de Dados

- [x] Criar migration para campos de SEO e marketing em configurações do site.
- [x] Adicionar campos para URL base, título SEO, descrição SEO e imagem social padrão.
- [x] Adicionar campos para Google Tag Manager, Google Analytics 4, Meta Pixel, Google Search Console e verificação de domínio da Meta.
- [x] Adicionar opção para ativar ou pausar rastreamento de marketing.
- [x] Definir como guardar UTMs no lead sem quebrar dados existentes.
- [x] Validar que chaves sensíveis continuam fora do navegador quando não forem públicas.

## Fase 3 - CRM: Configurações de SEO e Marketing

- [x] Criar área de configuração no painel administrativo.
- [x] Separar visualmente SEO, Google, Meta e conversões.
- [x] Usar campos simples com ajuda curta para usuários leigos.
- [x] Validar formato dos IDs antes de salvar.
- [x] Exibir status claro: configurado, ausente ou pausado.
- [x] Evitar textos técnicos de implementação na tela do cliente.

## Fase 4 - Tags no Site Público

- [x] Criar componente server/client adequado para carregar tags no site público.
- [x] Carregar Google Tag Manager quando houver ID configurado.
- [x] Carregar GA4 direto somente se for necessário e não duplicar com GTM.
- [x] Carregar Meta Pixel quando houver ID configurado.
- [x] Inserir meta tag de verificação do Google Search Console.
- [x] Inserir meta tag de verificação de domínio da Meta.
- [x] Garantir que nenhuma tag seja carregada em rotas do CRM.

## Fase 5 - Eventos de Conversão

- [x] Criar utilitário único para eventos de marketing do site.
- [x] Disparar conversão ao concluir o formulário principal de contato.
- [x] Disparar conversão ao concluir o formulário simples de WhatsApp.
- [x] Padronizar evento GA4 como `generate_lead`.
- [x] Padronizar evento Meta como `Lead`.
- [x] Enviar apenas dados genéricos: origem, área, tipo de formulário e página.
- [x] Não enviar dados pessoais nem mensagem do contato para Google ou Meta.

## Fase 6 - UTMs e Origem Comercial

- [x] Capturar `utm_source`, `utm_medium`, `utm_campaign`, `utm_term` e `utm_content`.
- [x] Capturar `gclid` e `fbclid` quando existirem.
- [x] Guardar primeira página de entrada e referência.
- [x] Preservar esses dados até a criação do lead.
- [x] Salvar UTMs no lead para análise comercial.
- [x] Mostrar origem e campanha no CRM de forma objetiva quando houver dados.

## Fase 7 - SEO Técnico

- [x] Revisar metadata global do site público.
- [x] Criar ou ajustar `sitemap.ts`.
- [x] Criar ou ajustar `robots.ts`.
- [x] Definir canonical para páginas públicas.
- [x] Garantir Open Graph e Twitter Card com imagem padrão.
- [x] Verificar metadata das páginas do blog/notícias.
- [x] Manter o site rápido, sem scripts desnecessários.

## Fase 8 - Consentimento e LGPD

- [x] Avaliar banner simples de consentimento para cookies de marketing.
- [x] Permitir que scripts de marketing respeitem consentimento quando a opção estiver ativa.
- [x] Preparar texto claro para o usuário final, sem juridiquês excessivo.
- [x] Garantir que leads continuem funcionando mesmo se o usuário recusar marketing.
- [x] Separar cookies necessários de cookies opcionais de medição e marketing.
- [x] Permitir aceitar todos, recusar opcionais ou personalizar preferências.
- [x] Permitir reabrir preferências pelo rodapé quando o consentimento estiver ativo.

## Fase 9 - Documentos Legais

- [x] Criar migration para documentos legais em `site_settings`.
- [x] Criar campos de consentimento em `leads`.
- [x] Criar tela no CRM para editar Política de Privacidade, Termos de Uso e Política de Cookies.
- [x] Criar páginas públicas para os três documentos.
- [x] Adicionar links legais no rodapé do site.
- [x] Incluir páginas legais no sitemap.
- [x] Registrar versão da política e ciência de privacidade nos leads do site.
- [x] Registrar consentimento opcional de comunicação/marketing separado do envio do formulário.
- [x] Mostrar consentimentos na ficha do lead quando houver registro.
- [ ] Revisão jurídica final dos textos pelo escritório antes de produção.

## Fase 10 - Validação

- [x] Aplicar e verificar migration de documentos legais e consentimentos no Supabase.
- [x] Rodar `npm.cmd run typecheck`.
- [x] Rodar `npm.cmd run lint`.
- [x] Rodar `npm.cmd run build`.
- [x] Confirmar que as páginas legais respondem HTTP 200 no localhost.
- [x] Testar site público sem IDs configurados.
- [ ] Testar site público com GTM configurado.
- [ ] Testar site público com Meta Pixel configurado.
- [ ] Testar criação de lead pelo formulário principal.
- [ ] Testar criação de lead pelo formulário simples de WhatsApp.
- [ ] Confirmar que eventos não disparam dentro do CRM.
- [ ] Confirmar que dados pessoais não aparecem no payload de marketing.

## Referências Oficiais

- Google Tag Manager: https://support.google.com/tagmanager/answer/14842164
- Google Analytics 4: https://developers.google.com/analytics/devguides/collection/ga4
- Google Search Central: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Meta Pixel: https://developers.facebook.com/docs/meta-pixel/
- Next.js Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js Sitemap: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Next.js Robots: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
