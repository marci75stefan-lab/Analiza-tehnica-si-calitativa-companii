"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { t as translate, type DictKey, type Lang } from "./i18n";

const LANG_KEY = "atc_lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "ro";
  try {
    const stored = window.localStorage.getItem(LANG_KEY);
    return stored === "en" ? "en" : "ro";
  } catch {
    return "ro";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ro");

  useEffect(() => {
    setLangState(readStoredLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(next: Lang) {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      // localStorage indisponibil (mod privat etc.) - preferinta e best-effort
    }
  }

  const value: LanguageContextValue = {
    lang,
    setLang,
    t: (key, vars) => translate(lang, key, vars),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}
