"use client";

import { createContext, useContext } from "react";

type EmbedContextValue = {
  isEmbed: boolean;
};

const EmbedContext = createContext<EmbedContextValue>({ isEmbed: false });

export function EmbedProvider({ children }: { children: React.ReactNode }) {
  return (
    <EmbedContext.Provider value={{ isEmbed: true }}>
      {children}
    </EmbedContext.Provider>
  );
}

export function useEmbed() {
  return useContext(EmbedContext);
}
