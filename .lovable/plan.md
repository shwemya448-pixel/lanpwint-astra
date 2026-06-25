## Goal

Rebuild the admin workspace to match the reference dashboard layout (left sidebar + stat tiles + chart + tables), styled with the existing Lan Pwint theme (navy / gold / serif headings — no theme change). Give the admin full jobs/applications/news/learn powers, and lock news/lesson posting to admins only.

## What changes for the user

1. New left-sidebar admin shell (admin pages only). Student/employer keep their current top nav.
2. Admin dashboard with insight tiles: total users, % students vs employers vs admins, signups last 7d, revenue placeholder, top countries, age buckets, and a line chart of signups over time.
3. Admin can post jobs as Lan Pwint and manage every job/application (accept, offer, reject) from one place.
4. News stays admin-only to publish; students and employers can read at `/news`.
5. Admin can add YouTube video lessons (new `youtube_url` column on `lessons`); students see them on `/student/learn`.

## Sidebar (admin only)

Collapsible left sidebar via shadcn `Sidebar`. Sections:

- Dashboard — `/admin/dashboard` (insights)
- Jobs — `/admin/jobs` (list + new)
- Applications — `/admin/applications` (every app, accept/offer/reject)
- News — `/admin/news` (existing)
- Learn (videos) — `/admin/learn`
- Users — read-only profile/role list (uses `profiles` + `user_roles`)
- Switch perspective buttons stay

Admin top header (theme tokens: navy/gold) keeps theme + language toggles + sign-out. Student and employer layouts untouched.

## Database

One migration:

- `ALTER TABLE public.lessons ADD COLUMN youtube_url text;`
- Tighten lesson policies so only admins can insert/update/delete; everyone authenticated can select.
- Confirm `jobs` RLS allows admin full access (add admin policy if missing) so admin can insert jobs with `employer_id = auth.uid()` and update/delete any.
- Confirm `applications` RLS allows admin to read/update any (add admin policy if missing) for accept/reject.
- News tables already restricted; verify admin-only write policy and authenticated read.

No mock revenue data is stored — the "revenue" tile reads from an empty `payments` source and shows `MMK 0` with a "Connect payments" hint, so it isn't fake.

## Insights data (real, no fakes)

Server fn `getAdminInsights` (admin-gated via `has_role`) returns:

- total users, role breakdown (% from `user_roles`)
- signups per day for last 30d (`profiles.created_at`)
- top 5 country buckets if `profiles.country` exists, else hidden gracefully
- age buckets if `profiles.dob`/`age` exists, else hidden gracefully
- jobs/applications counts

Charts: `recharts` (already used in the project where applicable; install if missing). Line chart for signups, donut for role split, bars for countries/ages.

## Admin jobs & applications

- `/admin/jobs` reuses the existing job form (`employer.jobs.new`) — extract its form into a shared component `JobForm` and mount under both routes.
- Admin posts with `employer_id = auth.uid()` (the admin account acts as Lan Pwint).
- `/admin/applications` lists every application joined to job + student profile, with Accept (sets status `offered` then `accepted`), Reject (status `rejected`) buttons. Triggers already notify the student.

## Learn videos

- `/admin/learn` lists lessons; add/edit form with `title`, `youtube_url`, `description`, `category`.
- `/student/learn` shows a "Videos" grid embedding `https://www.youtube.com/embed/<id>` for each lesson with a youtube_url, alongside existing lesson cards.

## Files

New:
- `src/components/admin/admin-sidebar.tsx`
- `src/components/admin/admin-shell.tsx` (wraps `SidebarProvider` + header for admin only)
- `src/components/jobs/job-form.tsx` (shared)
- `src/lib/admin-insights.functions.ts`
- `src/lib/admin-jobs.functions.ts`
- `src/lib/admin-applications.functions.ts`
- `src/lib/admin-lessons.functions.ts`
- `src/routes/_authenticated/admin.jobs.index.tsx`
- `src/routes/_authenticated/admin.jobs.new.tsx`
- `src/routes/_authenticated/admin.applications.tsx`
- `src/routes/_authenticated/admin.learn.tsx`
- `src/routes/_authenticated/admin.users.tsx`

Edited:
- `src/routes/_authenticated/admin.tsx` — use new admin shell instead of `RoleLayout`
- `src/routes/_authenticated/admin.dashboard.tsx` — rebuild as insights dashboard
- `src/routes/_authenticated/student.learn.tsx` — render YouTube videos
- `src/routes/_authenticated/employer.jobs.new.tsx` — use shared `JobForm`
- one migration file

## Out of scope

- Real payments/revenue integration (tile shows zero state, ready to wire later).
- Geo/age analytics if `profiles` lacks those columns — tiles hide rather than fabricate.
- Touching the public/student/employer top-nav layout.
