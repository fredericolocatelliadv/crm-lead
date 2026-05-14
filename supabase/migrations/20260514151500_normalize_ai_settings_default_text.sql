alter table public.ai_assistant_settings
  alter column prompt_instructions set default 'Colete as informações essenciais do contato, organize o atendimento inicial, classifique a área jurídica provável e encaminhe para a equipe humana quando necessário.',
  alter column response_style set default 'Use mensagens curtas, claras e em português do Brasil. Pergunte no máximo uma ou duas informações por vez.',
  alter column safety_instructions set default 'Não se apresente como advogada. Não prometa resultados, prazos, indenizações ou estratégias jurídicas. Quando a pergunta exigir análise jurídica, colete as informações essenciais e encaminhe para a equipe humana.';

update public.ai_assistant_settings
set prompt_instructions = 'Colete as informações essenciais do contato, organize o atendimento inicial, classifique a área jurídica provável e encaminhe para a equipe humana quando necessário.'
where prompt_instructions = 'Colete as informacoes essenciais do contato, organize o atendimento inicial, classifique a area juridica provavel e encaminhe para a equipe humana quando necessario.';

update public.ai_assistant_settings
set response_style = 'Use mensagens curtas, claras e em português do Brasil. Pergunte no máximo uma ou duas informações por vez.'
where response_style = 'Use mensagens curtas, claras e em portugues do Brasil. Pergunte no maximo uma ou duas informacoes por vez.';

update public.ai_assistant_settings
set safety_instructions = 'Não se apresente como advogada. Não prometa resultados, prazos, indenizações ou estratégias jurídicas. Quando a pergunta exigir análise jurídica, colete as informações essenciais e encaminhe para a equipe humana.'
where safety_instructions = 'Nao se apresente como advogada. Nao prometa resultados, prazos, indenizacoes ou estrategias juridicas. Quando a pergunta exigir analise juridica, colete as informacoes essenciais e encaminhe para a equipe humana.';
