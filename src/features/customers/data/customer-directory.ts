import { notFound } from "next/navigation";

import type { LeadPriority } from "@/features/leads/types/lead";
import { createClient } from "@/server/supabase/server";

export type CustomerFilters = {
  query?: string;
};

export type CustomerListItem = {
  convertedAt: string;
  convertedByName: string | null;
  email: string | null;
  id: string;
  leadId: string | null;
  legalArea: string | null;
  name: string;
  phone: string | null;
};

export type CustomerNote = {
  authorName: string | null;
  content: string;
  createdAt: string;
  id: string;
  source: "Cliente" | "Lead";
};

export type CustomerEvent = {
  actorName: string | null;
  createdAt: string;
  description: string | null;
  eventType: string;
  id: string;
};

export type CustomerAttachment = {
  downloadUrl: string | null;
  fileName: string;
  fileSize: number | null;
  fileType: string | null;
  id: string;
  uploadedAt: string;
  uploadedByName: string | null;
};

export type CustomerDetail = CustomerListItem & {
  attachments: CustomerAttachment[];
  assigneeId: string | null;
  assigneeName: string | null;
  bestContactTime: string | null;
  city: string | null;
  conversationId: string | null;
  createdAt: string;
  events: CustomerEvent[];
  leadCreatedAt: string | null;
  leadDescription: string | null;
  leadSource: string | null;
  leadSummary: string | null;
  notes: CustomerNote[];
  priority: LeadPriority;
  registryNotes: string | null;
};

export type CustomerFormValues = {
  assigneeId: string | null;
  bestContactTime: string | null;
  city: string | null;
  description: string | null;
  email: string | null;
  legalArea: string | null;
  name: string;
  notes: string | null;
  phone: string | null;
  priority: LeadPriority;
  source: string;
  summary: string | null;
};

export type CustomerListData = {
  customers: CustomerListItem[];
  filters: CustomerFilters;
};

export type CustomerDetailData = {
  customer: CustomerDetail;
};

type RelatedProfile = { email: string | null; full_name: string | null };
type RelatedLead = {
  assignee?: RelatedProfile | RelatedProfile[] | null;
  assignee_id?: string | null;
  best_contact_time?: string | null;
  city?: string | null;
  created_at: string | null;
  description: string | null;
  id: string;
  legal_area: string | null;
  priority?: LeadPriority | null;
  source: string | null;
  summary: string | null;
};

type RelatedContact = {
  city: string | null;
  id: string;
};

type CustomerRow = {
  contact_id: string | null;
  converted_at: string;
  converted_by_profile?: RelatedProfile | RelatedProfile[] | null;
  created_at: string;
  email: string | null;
  id: string;
  lead_id: string | null;
  leads?: RelatedLead | RelatedLead[] | null;
  name: string;
  notes: string | null;
  phone: string | null;
};

type NoteRow = {
  author?: RelatedProfile | RelatedProfile[] | null;
  content: string;
  created_at: string;
  id: string;
};

type EventRow = {
  actor?: RelatedProfile | RelatedProfile[] | null;
  created_at: string;
  description: string | null;
  event_type: string;
  id: string;
};

type AttachmentRow = {
  created_at: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  id: string;
  storage_bucket: string;
  storage_path: string;
  uploaded_by_profile?: RelatedProfile | RelatedProfile[] | null;
};

type ConversationRow = {
  id: string;
};

function relatedOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function profileLabel(profile: RelatedProfile | null) {
  return profile?.full_name || profile?.email || null;
}

function cleanFilterValue(value?: string) {
  const normalized = value?.trim();

  return normalized && normalized !== "all" ? normalized : undefined;
}

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = searchParams?.[key];

  return Array.isArray(value) ? value[0] : value;
}

export function parseCustomerFilters(
  searchParams?: Record<string, string | string[] | undefined>,
): CustomerFilters {
  return {
    query: cleanFilterValue(readSearchParam(searchParams, "busca")),
  };
}

export function customerToFormValues(customer: CustomerDetail): CustomerFormValues {
  return {
    assigneeId: customer.assigneeId,
    bestContactTime: customer.bestContactTime,
    city: customer.city,
    description: customer.leadDescription,
    email: customer.email,
    legalArea: customer.legalArea,
    name: customer.name,
    notes: customer.registryNotes,
    phone: customer.phone,
    priority: customer.priority,
    source: customer.leadSource ?? "manual",
    summary: customer.leadSummary,
  };
}

function matchesQuery(row: CustomerRow, query: string | undefined) {
  if (!query) return true;

  const term = query.toLowerCase();
  const lead = relatedOne(row.leads);
  const haystack = [
    row.name,
    row.email,
    row.phone,
    lead?.legal_area,
    lead?.source,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

function mapCustomer(row: CustomerRow): CustomerListItem {
  const lead = relatedOne(row.leads);

  return {
    convertedAt: row.converted_at,
    convertedByName: profileLabel(relatedOne(row.converted_by_profile)),
    email: row.email,
    id: row.id,
    leadId: row.lead_id,
    legalArea: lead?.legal_area ?? null,
    name: row.name,
    phone: row.phone,
  };
}

export async function getCustomerList(filters: CustomerFilters): Promise<CustomerListData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(
      "id,contact_id,lead_id,name,email,phone,converted_at,created_at,notes,converted_by_profile:profiles!customers_converted_by_fkey(full_name,email),leads(id,legal_area,source,summary,description,created_at)",
    )
    .order("converted_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error("Não foi possível carregar os clientes convertidos.");
  }

  const rows = ((data ?? []) as CustomerRow[]).filter((row) =>
    matchesQuery(row, filters.query),
  );

  return {
    customers: rows.map(mapCustomer),
    filters,
  };
}

export async function getCustomerIdByLeadId(leadId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível verificar o cliente convertido.");
  }

  return data?.id ?? null;
}

export async function getCustomerById(id: string): Promise<CustomerDetailData> {
  const supabase = await createClient();
  const customerResult = await supabase
    .from("customers")
    .select(
      "id,contact_id,lead_id,name,email,phone,converted_at,created_at,notes,converted_by_profile:profiles!customers_converted_by_fkey(full_name,email),leads(id,assignee_id,best_contact_time,city,legal_area,source,priority,summary,description,created_at,assignee:profiles!leads_assignee_id_fkey(full_name,email))",
    )
    .eq("id", id)
    .maybeSingle();

  if (customerResult.error) {
    throw new Error("Não foi possível carregar o cliente.");
  }

  if (!customerResult.data) {
    notFound();
  }

  const customerRow = customerResult.data as CustomerRow;
  const lead = relatedOne(customerRow.leads);
  const leadId = customerRow.lead_id;

  const [
    contactResult,
    customerNotesResult,
    leadNotesResult,
    eventsResult,
    attachmentsResult,
    conversationResult,
  ] =
    await Promise.all([
      customerRow.contact_id
        ? supabase
            .from("contacts")
            .select("id,city")
            .eq("id", customerRow.contact_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("notes")
        .select("id,content,created_at,author:profiles!notes_author_id_fkey(full_name,email)")
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),
      leadId
        ? supabase
            .from("notes")
            .select("id,content,created_at,author:profiles!notes_author_id_fkey(full_name,email)")
            .eq("lead_id", leadId)
            .is("customer_id", null)
            .is("conversation_id", null)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      leadId
        ? supabase
            .from("lead_events")
            .select("id,event_type,description,created_at,actor:profiles!lead_events_actor_id_fkey(full_name,email)")
            .eq("lead_id", leadId)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("attachments")
        .select(
          "id,storage_bucket,storage_path,file_name,file_type,file_size,created_at,uploaded_by_profile:profiles!attachments_uploaded_by_fkey(full_name,email)",
        )
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),
      leadId
        ? supabase
            .from("conversations")
            .select("id")
            .eq("lead_id", leadId)
            .order("last_message_at", { ascending: false, nullsFirst: false })
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  if (
    contactResult.error ||
    customerNotesResult.error ||
    leadNotesResult.error ||
    eventsResult.error ||
    attachmentsResult.error ||
    conversationResult.error
  ) {
    throw new Error("Não foi possível carregar o histórico do cliente.");
  }

  const contact = contactResult.data as RelatedContact | null;
  const conversation = conversationResult.data as ConversationRow | null;

  const attachments = await Promise.all(
    ((attachmentsResult.data ?? []) as AttachmentRow[]).map(async (attachment) => {
      const { data } = await supabase.storage
        .from(attachment.storage_bucket)
        .createSignedUrl(attachment.storage_path, 60 * 10);

      return {
        downloadUrl: data?.signedUrl ?? null,
        fileName: attachment.file_name,
        fileSize: attachment.file_size,
        fileType: attachment.file_type,
        id: attachment.id,
        uploadedAt: attachment.created_at,
        uploadedByName: profileLabel(relatedOne(attachment.uploaded_by_profile)),
      };
    }),
  );

  const customerNotes: CustomerNote[] = ((customerNotesResult.data ?? []) as NoteRow[]).map(
    (note) => ({
      authorName: profileLabel(relatedOne(note.author)),
      content: note.content,
      createdAt: note.created_at,
      id: note.id,
      source: "Cliente",
    }),
  );

  const leadNotes: CustomerNote[] = ((leadNotesResult.data ?? []) as NoteRow[]).map(
    (note) => ({
      authorName: profileLabel(relatedOne(note.author)),
      content: note.content,
      createdAt: note.created_at,
      id: note.id,
      source: "Lead",
    }),
  );

  return {
    customer: {
      ...mapCustomer(customerRow),
      attachments,
      assigneeId: lead?.assignee_id ?? null,
      assigneeName: profileLabel(relatedOne(lead?.assignee)),
      bestContactTime: lead?.best_contact_time ?? null,
      city: contact?.city ?? lead?.city ?? null,
      conversationId: conversation?.id ?? null,
      createdAt: customerRow.created_at,
      events: ((eventsResult.data ?? []) as EventRow[]).map((event) => ({
        actorName: profileLabel(relatedOne(event.actor)),
        createdAt: event.created_at,
        description: event.description,
        eventType: event.event_type,
        id: event.id,
      })),
      leadCreatedAt: lead?.created_at ?? null,
      leadDescription: lead?.description ?? null,
      leadSource: lead?.source ?? null,
      leadSummary: lead?.summary ?? null,
      notes: [...customerNotes, ...leadNotes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      priority: lead?.priority ?? "medium",
      registryNotes: customerRow.notes,
    },
  };
}
