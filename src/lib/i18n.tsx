import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "my";

const STORAGE_KEY = "lp-lang";

const dict = {
  en: {
    "nav.home": "Home",
    "nav.students": "Candidates",
    "nav.candidates": "For Employers",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.news": "News",
    "nav.findPassion": "Find Passion",
    "auth.studentLogin": "Candidate Login",
    "auth.employerLogin": "Employer Login",
    "auth.signOut": "Sign out",
    "auth.dashboard": "Dashboard",
    "auth.profile": "My profile",
    "auth.browseJobs": "Browse jobs",
    "auth.myApplications": "My applications",
    "auth.learning": "Learning",
    "auth.myJobPosts": "My job posts",
    "auth.applications": "Applications",
    "auth.adminPanel": "Admin Panel",
    "auth.manageNews": "Manage News",
    "auth.viewAs": "Viewing as",
    "theme.toggle": "Toggle theme",
    "lang.label": "Language",
    "news.title": "News & Announcements",
    "news.subtitle": "Latest updates from Lan Pwint",
    "news.readMore": "Read more",
    "news.empty": "No news posts yet.",
    "news.allCategories": "All",
    "news.back": "Back to news",
    "admin.news.title": "Manage News",
    "admin.news.new": "New Post",
    "admin.news.edit": "Edit",
    "admin.news.delete": "Delete",
    "admin.news.published": "Published",
    "admin.news.draft": "Draft",
    "admin.form.titleEn": "Title (English)",
    "admin.form.titleMy": "Title (Burmese)",
    "admin.form.excerptEn": "Excerpt (English)",
    "admin.form.excerptMy": "Excerpt (Burmese)",
    "admin.form.bodyEn": "Body (English)",
    "admin.form.bodyMy": "Body (Burmese)",
    "admin.form.slug": "Slug",
    "admin.form.category": "Category",
    "admin.form.imageUrl": "Image URL",
    "admin.form.publish": "Publish immediately",
    "admin.form.save": "Save post",
    "admin.form.cancel": "Cancel",
    "common.loading": "Loading…",
    "common.saved": "Saved",
    "common.error": "Something went wrong",
  },
  my: {
    "nav.home": "ပင်မ",
    "nav.students": "ကိုယ်စားလှယ်လောင်းများ",
    "nav.candidates": "အလုပ်ရှင်များ",
    "nav.about": "အကြောင်း",
    "nav.contact": "ဆက်သွယ်ရန်",
    "nav.news": "သတင်း",
    "nav.findPassion": "ဝါသနာရှာ",
    "auth.studentLogin": "ကိုယ်စားလှယ်လောင်း Login",
    "auth.employerLogin": "အလုပ်ရှင် Login",
    "auth.signOut": "ထွက်မည်",
    "auth.dashboard": "ဒက်ရှ်ဘုတ်",
    "auth.profile": "ကိုယ်ရေးအချက်အလက်",
    "auth.browseJobs": "အလုပ်များကြည့်ရန်",
    "auth.myApplications": "ကျွန်ုပ်လျှောက်ထားမှု",
    "auth.learning": "သင်ယူခြင်း",
    "auth.myJobPosts": "ကျွန်ုပ်တင်ထားသော အလုပ်များ",
    "auth.applications": "လျှောက်ထားမှုများ",
    "auth.adminPanel": "Admin စင်တာ",
    "auth.manageNews": "သတင်းစီမံ",
    "auth.viewAs": "ကြည့်ရှုနေသည်",
    "theme.toggle": "ပုံစံပြောင်း",
    "lang.label": "ဘာသာ",
    "news.title": "သတင်းနှင့် ကြေညာချက်များ",
    "news.subtitle": "လမ်းပွင့်မှ နောက်ဆုံးသတင်းများ",
    "news.readMore": "ဆက်ဖတ်ရန်",
    "news.empty": "သတင်းမရှိသေးပါ။",
    "news.allCategories": "အားလုံး",
    "news.back": "သတင်းသို့ပြန်",
    "admin.news.title": "သတင်းစီမံ",
    "admin.news.new": "သတင်းအသစ်",
    "admin.news.edit": "ပြင်ဆင်",
    "admin.news.delete": "ဖျက်ပစ်",
    "admin.news.published": "ထုတ်ပြန်ပြီး",
    "admin.news.draft": "မူကြမ်း",
    "admin.form.titleEn": "ခေါင်းစဉ် (အင်္ဂလိပ်)",
    "admin.form.titleMy": "ခေါင်းစဉ် (မြန်မာ)",
    "admin.form.excerptEn": "အကျဉ်းချုပ် (အင်္ဂလိပ်)",
    "admin.form.excerptMy": "အကျဉ်းချုပ် (မြန်မာ)",
    "admin.form.bodyEn": "အကြောင်းအရာ (အင်္ဂလိပ်)",
    "admin.form.bodyMy": "အကြောင်းအရာ (မြန်မာ)",
    "admin.form.slug": "လင့်ခ်အမည်",
    "admin.form.category": "အမျိုးအစား",
    "admin.form.imageUrl": "ပုံ URL",
    "admin.form.publish": "ချက်ချင်းထုတ်ပြန်",
    "admin.form.save": "သိမ်းမည်",
    "admin.form.cancel": "ပယ်ဖျက်",
    "common.loading": "ခဏစောင့်ပါ…",
    "common.saved": "သိမ်းပြီးပါပြီ",
    "common.error": "အမှားတစ်ခုဖြစ်နေသည်",
  },
} as const;

export type TKey = keyof typeof dict.en;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string };
const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEY) as Lang | null)) || null;
    if (stored === "en" || stored === "my") setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    if (typeof window !== "undefined" && l === "en") {
      window.dispatchEvent(new Event("lp-restore-english"));
    }
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l === "my" ? "my" : "en";
    }
  }

  const t = (k: TKey) => dict[lang][k] ?? dict.en[k] ?? k;
  return <LocaleContext.Provider value={{ lang, setLang, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
