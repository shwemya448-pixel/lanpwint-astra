export function formatSalary(min?: number | null, max?: number | null, currency = "MMK") {
  if (!min && !max) return "Salary undisclosed";
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
  if (min && max) return `${currency} ${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${currency} ${fmt(min)}`;
  return `Up to ${currency} ${fmt(max!)}`;
}

export function jobTypeLabel(t: string) {
  return (
    {
      full_time: "Full time",
      part_time: "Part time",
      internship: "Internship",
      contract: "Contract",
      remote: "Remote",
    } as Record<string, string>
  )[t] ?? t;
}

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}
