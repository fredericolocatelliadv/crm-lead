# AGENTS.md

## Project Overview

This project is a legal commercial platform composed of:

- public law firm website;
- blog/news;
- lead capture;
- CRM for legal lead conversion;
- WhatsApp integration through Evolution API;
- AI-assisted first contact through AI Studio/Gemini.

This is not a legal ERP. Do not build case management, court tracking, legal deadlines, petitions, full finance, or deep legal operations.

## Required Stack

- Next.js 16 with App Router.
- TypeScript.
- Tailwind CSS.
- Supabase for Postgres, Auth, Storage, and Realtime.
- Evolution API for WhatsApp.
- AI Studio/Gemini for AI.
- lucide-react for icons.
- shadcn/ui for CRM UI primitives when useful.

Use shadcn/ui only in the CRM/admin experience. Do not use it to redesign the public website.

## Architecture

Use Feature First architecture. Organize code by business domain, not by generic file type.

Target structure:

```txt
src/
  app/
    (public)/
    (crm)/
    api/
  features/
    site/
    blog/
    auth/
    leads/
    pipeline/
    conversations/
    whatsapp/
    ai-assistant/
    dashboard/
    settings/
    users/
  shared/
    components/
    hooks/
    lib/
    types/
    utils/
  server/
    supabase/
    auth/
    integrations/
```

Rules:

- Feature-specific components, hooks, schemas, services, and types stay inside their feature.
- Move code to `shared` only when used by two or more features.
- Sensitive integrations live in server-side code: route handlers, server actions, or `src/server`.
- In Next.js 16, never create `middleware.ts`; use `src/proxy.ts` for request proxy logic because the app lives in `src/app`.
- Avoid large components.
- Keep business rules out of JSX when they can live in services, schemas, or helpers.

## Public Website Rules

- Keep the current public website visual identity.
- Do not change public copy unless the user explicitly asks.
- Do not change colors, logos, typography, theme, or layout unless explicitly requested.
- Do not copy text, layout, visual style, or structure from external websites.
- Preserve responsive behavior.
- Public pages must stay fast, readable, and conversion-focused.

## CRM Rules

The CRM exists to convert leads into clients.

Allowed CRM areas:

- dashboard with simple conversion indicators;
- leads;
- pipeline Kanban;
- attendance/conversations;
- blog/news management;
- users and permissions;
- essential settings.

Do not add modules that do not directly support capture, attendance, WhatsApp conversation, AI first contact, pipeline movement, or conversion.

The client/customer module must stay minimal: it exists only after a lead is converted and must preserve commercial history.

All user-facing text must use Brazilian Portuguese with correct spelling and accents. Do not remove accents from labels, messages, buttons, empty states, or dashboard text.

## CRM Layout Rules

- The CRM must look professional, calm, modern, and operational.
- Do not use loud, neon, aggressive, or "hardcore" color palettes.
- Use restrained neutral surfaces, clear hierarchy, readable typography, and consistent spacing.
- Implement dark and light theme support professionally.
- Theme switching must feel native to the CRM and must not break contrast, borders, charts, badges, or forms.
- Use shadcn/ui primitives for CRM UI when useful, following their standard interaction patterns.
- Do not invent custom UI primitives when shadcn/ui already provides a suitable component.
- Use lucide-react icons inside icon actions when an icon exists.
- Badges must use semantic colors by meaning, not random decoration.
- Define consistent badge/status variants for priority, lead status, pipeline stage, source, conversation state, and role.
- Use colors sparingly in badges, status indicators, alerts, and charts.
- Do not create dashboard cards with decorative gradients or excessive visual effects.
- Dashboard cards should be scan-friendly and focused on business indicators.
- Never show programmer/admin implementation notes in client-facing CRM screens.
- Do not display labels such as "theme professional", "base ready", "will be connected later", "mock", "placeholder", "TODO", or internal implementation status in the CRM UI.
- Empty states must be written for the client's operation, not for the developer.
- CRM layouts must use available viewport width responsibly on large monitors and must not leave large empty gaps in the middle of the interface.
- Prefer responsive grids that expand across common desktop, wide desktop, tablet, and mobile sizes.
- Forms must always be separated from saved data views.
- Never place a create/edit form side-by-side with the list, table, detail, preview, or saved record it affects.
- Create and edit forms must live in their own page, modal, drawer, or dedicated editing state.
- A list/detail screen may have actions that open a form, but the form must not share a two-column layout with the saved data.
- Form pages should focus on the edit task. Detail pages should focus on reading, history, status, and actions.
- Avoid nested cards. Use cards only for actual dashboard metrics, record summaries, modals, or repeated items.

## Supabase Rules

- Supabase is the main data backend.
- Enable RLS on exposed tables.
- Do not use `user_metadata` for authorization.
- Use a dedicated profile/role table or trusted app metadata for permissions.
- Never expose service role keys to the browser.
- Use server-side code for privileged operations.
- Define explicit Storage buckets and policies.
- Create clean database migrations when changing schema.

## WhatsApp Rules

- Evolution API runs locally in Docker during development.
- The frontend must never call Evolution API directly.
- Incoming webhook handling must be server-side.
- Persist every incoming WhatsApp message before running AI, notifications, or automations.
- Link messages to contacts/leads by phone number.
- If no lead exists for an incoming phone number, create a lead with source `whatsapp`.

## AI Rules

AI is an initial assistant, not a lawyer.

The AI may:

- greet the user;
- collect name, phone, city, legal area, short description, urgency, and best contact time;
- summarize the contact;
- classify legal area, priority, and conversion potential;
- route the lead to a human.

The AI must not:

- promise legal results;
- guarantee outcomes;
- pretend to be a lawyer;
- replace human legal analysis;
- give complex legal decisions as final advice.

All AI calls must run server-side.

## Domain Language

Use these names consistently:

- `lead`: commercial contact not converted yet;
- `customer` or `client`: converted lead;
- `conversation`: thread linked to a contact/lead;
- `message`: individual message;
- `pipeline_stage`: commercial stage;
- `department`: internal department;
- `assignee`: responsible user;
- `priority`: operational priority;
- `legal_area`: legal practice area;
- `source`: lead origin.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`

## Testing Instructions

- Run typecheck, lint, and build before finishing implementation work when applicable.
- Validate public pages visually after frontend changes.
- Test lead creation after changing forms, chatbot, WhatsApp, or CRM logic.
- Test server-side webhook behavior after changing Evolution API integration.
- Test permission boundaries after changing auth, roles, RLS, or CRM routes.

## Security Notes

- Treat legal contacts and WhatsApp messages as sensitive data.
- Keep private environment variables server-only.
- Validate inputs for APIs, webhooks, forms, and server actions.
- Do not log secrets, tokens, full private messages, or sensitive client data unnecessarily.
- Prefer explicit authorization checks in server-side handlers.

## Related Docs

Use `TODO.md` as the implementation checklist. Do not put task planning in this file.
