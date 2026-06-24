import { useLocale } from "@/lib/i18n";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { lang, setLang, t } = useLocale();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("lang.label")}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 text-sm text-foreground hover:bg-muted transition-colors"
        >
          <Languages className="h-4 w-4" />
          <span className="font-medium uppercase">{lang}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onSelect={() => setLang("en")} className={lang === "en" ? "font-semibold text-[var(--gold)]" : ""}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setLang("my")} className={lang === "my" ? "font-semibold text-[var(--gold)]" : ""}>
          မြန်မာ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
