import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BUILDERS } from "@/lib/floor/types";

const KEY = "floor-author";

const AuthorContext = createContext<{
  author: string;
  setAuthor: (value: string) => void;
}>({ author: "", setAuthor: () => undefined });

export function AuthorProvider({ children }: { children: ReactNode }) {
  const [author, setAuthorState] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setAuthorState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  function setAuthor(value: string) {
    setAuthorState(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
  }

  return (
    <AuthorContext.Provider value={{ author, setAuthor }}>
      {children}
    </AuthorContext.Provider>
  );
}

export function useAuthor() {
  return useContext(AuthorContext);
}

export function AuthorSelect() {
  const { author, setAuthor } = useAuthor();
  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      Notes as
      <select
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="h-10 rounded-[var(--radius-sm)] border border-border bg-surface px-2 text-sm text-ink"
      >
        <option value="">—</option>
        {BUILDERS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
        <option value="Sales">Sales</option>
      </select>
    </label>
  );
}
