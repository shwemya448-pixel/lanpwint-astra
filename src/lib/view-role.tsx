import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppRole } from "./auth";

const STORAGE_KEY = "lp-view-role";

type Ctx = { viewRole: AppRole; setViewRole: (r: AppRole) => void };
const ViewRoleContext = createContext<Ctx | null>(null);

export function ViewRoleProvider({ children }: { children: ReactNode }) {
  const [viewRole, setViewRoleState] = useState<AppRole>("student");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as AppRole | null) : null;
    if (stored === "student" || stored === "employer" || stored === "admin") setViewRoleState(stored);
  }, []);

  function setViewRole(r: AppRole) {
    setViewRoleState(r);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, r);
  }

  return <ViewRoleContext.Provider value={{ viewRole, setViewRole }}>{children}</ViewRoleContext.Provider>;
}

export function useViewRole() {
  const ctx = useContext(ViewRoleContext);
  if (!ctx) throw new Error("useViewRole must be used inside ViewRoleProvider");
  return ctx;
}
