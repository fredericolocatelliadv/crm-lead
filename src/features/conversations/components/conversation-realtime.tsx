"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/shared/lib/supabase/browser";

type ConversationRealtimeProps = {
  selectedConversationId: string | null;
};

export function ConversationRealtime({ selectedConversationId }: ConversationRealtimeProps) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function refreshSoon() {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        router.refresh();
      }, 250);
    }

    const channel = supabase
      .channel(`crm-conversations:${selectedConversationId ?? "inbox"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        refreshSoon,
      )
      .on(
        "postgres_changes",
        selectedConversationId
          ? {
              event: "*",
              filter: `conversation_id=eq.${selectedConversationId}`,
              schema: "public",
              table: "messages",
            }
          : { event: "*", schema: "public", table: "messages" },
        refreshSoon,
      )
      .subscribe();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      supabase.removeChannel(channel);
    };
  }, [router, selectedConversationId]);

  return null;
}
