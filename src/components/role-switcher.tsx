import { useViewRole } from "@/lib/view-role";
import { useUserRoles, type AppRole } from "@/lib/auth";
import { useLocale } from "@/lib/i18n";
import type { User } from "@supabase/supabase-js";
import { Shield, GraduationCap, Briefcase, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ICONS: Record<AppRole, typeof Shield> = {
  admin: Shield,
  student: GraduationCap,
  employer: Briefcase,
};

export function RoleSwitcher({ user }: { user: User }) {
  const roles = useUserRoles(user);
  const { viewRole, setViewRole } = useViewRole();
  const { t } = useLocale();
  if (!roles.includes("admin")) return null;

  const all: AppRole[] = ["admin", "student", "employer"];
  const Icon = ICONS[viewRole];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 px-2.5 text-xs text-[color:var(--gold)] hover:bg-[color:var(--gold)]/20 transition-colors">
          <Icon className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wide font-medium">{viewRole}</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t("auth.viewAs")}</DropdownMenuLabel>
        {all.map((r) => {
          const I = ICONS[r];
          return (
            <DropdownMenuItem
              key={r}
              onSelect={() => setViewRole(r)}
              className={viewRole === r ? "font-semibold text-[color:var(--gold)]" : ""}
            >
              <I className="mr-2 h-4 w-4" />
              <span className="capitalize">{r}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
