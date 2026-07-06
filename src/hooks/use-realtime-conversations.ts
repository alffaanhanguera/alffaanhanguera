"use client";

import { useEffect, useState } from "react";

export function useRealtimeConversations() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsConnected(true);
    }, 600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return { isConnected };
}
