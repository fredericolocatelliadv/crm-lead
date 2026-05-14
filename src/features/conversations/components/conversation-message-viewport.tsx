"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

type ConversationMessageViewportProps = {
  children: ReactNode;
  conversationId: string;
  lastMessageId: string | null;
  messageCount: number;
};

export function ConversationMessageViewport({
  children,
  conversationId,
  lastMessageId,
  messageCount,
}: ConversationMessageViewportProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const viewport = viewportRef.current;
    if (!content || !viewport) return;

    let frame = 0;

    function scrollToBottom() {
      frame = window.requestAnimationFrame(() => {
        if (!viewportRef.current) return;

        const currentViewport = viewportRef.current;
        currentViewport.scrollTop = currentViewport.scrollHeight;
      });
    }

    viewport.scrollTop = viewport.scrollHeight;
    scrollToBottom();

    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(content);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [conversationId, lastMessageId, messageCount]);

  return (
    <div ref={viewportRef} className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-4">
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
