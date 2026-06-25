import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Admin · Users — Lan Pwint" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles, error: e1 }, { data: roles, error: e2 }] = await Promise.all([
        (supabase.from("profiles").select("id, full_name, contact_email, position, company_name, school, location, created_at, employer_status").order("created_at", { ascending: false }) as any),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      const rolesByUser = new Map<string, string[]>();
      for (const r of roles ?? []) {
        const list = rolesByUser.get(r.user_id) ?? [];
        list.push(r.role);
        rolesByUser.set(r.user_id, list);
      }
      return ((profiles ?? []) as any[]).map((p) => ({ ...p, roles: rolesByUser.get(p.id) ?? [] }));
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" | "pending" }) => {
      const { error: err } = await (supabase.from("profiles").update({ employer_status: status } as any).eq("id", id) as any);
      if (err) throw err;
    },
    onSuccess: (_d, vars) => {
      toast.success(`Employer ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl text-navy">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">Approve employer accounts and view everyone on Lan Pwint.</p>

      {error ? (
        <p className="mt-6 text-sm text-destructive">{(error as Error).message}</p>
      ) : isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : !data || data.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-serif text-xl text-navy">No users yet</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Employer status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u: any, i: number) => {
                const isEmployer = u.roles.includes("employer");
                const status: string = u.employer_status ?? "approved";
                return (
                  <tr key={u.id} className="lp-table-row border-t border-border" style={{ animationDelay: `${Math.min(i * 40, 600)}ms` }}>
                    <td className="px-4 py-3 font-medium text-navy">{u.full_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.contact_email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0
                          ? <span className="text-muted-foreground">—</span>
                          : u.roles.map((r: string) => <Badge key={r} variant="outline" className="capitalize">{r}</Badge>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.position || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.company_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.school || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.location || "—"}</td>
                    <td className="px-4 py-3">
                      {isEmployer ? (
                        <Badge
                          variant="outline"
                          className={
                            status === "approved"
                              ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
                              : status === "rejected"
                              ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          }
                        >
                          {status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                          {status === "approved" && <Check className="mr-1 h-3 w-3" />}
                          {status === "rejected" && <X className="mr-1 h-3 w-3" />}
                          {status}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEmployer ? (
                        <div className="flex justify-end gap-2">
                          {status === "pending" && (
                            <>
                              <Button size="sm" variant="default" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: u.id, status: "approved" })}>
                                <Check className="mr-1 h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: u.id, status: "rejected" })}>
                                <X className="mr-1 h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
