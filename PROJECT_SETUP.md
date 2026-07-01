# Project Setup & Structural Flow

> **Template guide** — how this Next.js full-stack project is built, wired together, and deployed.  
> Follow this pattern when bootstrapping a new project of the same type.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-only config, no `tailwind.config.js`) |
| UI Components | shadcn/ui (new-york style) + Radix UI primitives |
| ORM | Prisma 7 + `@prisma/adapter-pg` (PostgreSQL) |
| Data fetching | React Query v3 (`react-query`) |
| Forms | react-hook-form + Zod v4 |
| Auth | JWT cookies (`jose` library) |
| Rich text | Lexical editor |
| Email | Nodemailer (SMTP) |
| File/Image upload | Axios multipart → external API |
| Excel export | `xlsx` library |
| Package manager | pnpm |
| Deployment | Vercel |

---

## 1. Repository Setup

### 1.1 Bootstrap

```bash
pnpm create next-app@latest my-project --typescript --tailwind --app --src-dir=no
cd my-project
```

### 1.2 Environment file

Create `.env` at project root. **Never commit this file.**

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"

# Auth
JWT_SECRET=your_long_random_secret_here
NEXT_PUBLIC_COOKIE_NAME=your_app_auth_token

# App URLs  (change for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_SCHOOL_URL=http://localhost:3002        # remove if no external app

# External API (if applicable — remove if not needed)
NEXT_PUBLIC_SCHOOL_API_URL=http://localhost:8002

# Email (SMTP)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_smtp_password
SMTP_FROM="Your App <no-reply@yourapp.com>"
```

Add a `.env.example` with all keys but no values and commit that instead.

### 1.3 TypeScript path alias

In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}
```

### 1.4 Tailwind v4 (CSS-only, no config file)

In `app/globals.css`:

```css
@import "tailwindcss";

@theme inline {
  --color-primary: oklch(…);
  /* all design tokens live here as CSS variables */
}
```

`postcss.config.mjs`:

```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

---

## 2. Folder Structure

```
project-root/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── globals.css               # Tailwind + CSS tokens
│   ├── page.tsx                  # Home/landing entry
│   ├── [public-routes]/          # Marketing pages (blogs, demo, support, …)
│   └── admin/                    # Admin portal
│       ├── layout.tsx            # Wraps AdminLayout component
│       ├── page.tsx              # Dashboard
│       ├── auth/                 # Login, forgot-password, reset-password
│       └── [module]/page.tsx     # One page per admin module
│
├── components/
│   ├── ui/                       # shadcn/Radix primitives (generated)
│   ├── custom/                   # Shared app widgets (uploader, pagination, modal…)
│   ├── admin/                    # Admin portal shell + per-module UI
│   │   ├── layout.tsx
│   │   ├── sidebar/
│   │   ├── navbar/
│   │   ├── header/               # PageHeader, PageBreadcrumb, BackButton
│   │   └── modules/              # One sub-folder per admin module
│   ├── pages/                    # Public marketing page sections
│   │   ├── layout/               # Navbar, footer, layout shell
│   │   ├── SchoolHome/
│   │   ├── TeachersHome/
│   │   └── StudentHome/
│   └── editor/                   # Lexical rich-text editor (if needed)
│
├── data/                         # "use server" server actions (Prisma calls)
├── hooks/                        # React Query v3 client hooks
├── lib/                          # prisma.ts, utilities, static seed data
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── providers/                    # React context providers (QueryClient, etc.)
├── public/
│   └── images/
├── seeds/                        # DB seed scripts
├── scripts/                      # One-off CLI scripts (create-admin, etc.)
├── utils/                        # Auth JWT helpers, formatters
└── validators/
    ├── schemas/                  # Zod schemas
    └── types/                    # Shared TypeScript types
```

---

## 3. Database & ORM

### 3.1 Install Prisma

```bash
pnpm add prisma @prisma/client @prisma/adapter-pg
pnpm prisma init
```

### 3.2 `prisma/schema.prisma` skeleton

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Add your models here
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3.3 `lib/prisma.ts` — singleton client

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### 3.4 Database scripts

```bash
pnpm prisma migrate dev --name initial_setup   # create + apply migration
pnpm prisma generate                            # regenerate client
pnpm prisma studio                              # visual DB browser
pnpm prisma migrate deploy                      # apply migrations in production
```

---

## 4. Data Layer — Server Actions

All database operations live in `data/` as `"use server"` async functions. No API routes needed.

### Pattern

```ts
// data/posts.ts
"use server";

import { prisma } from "@/lib/prisma";

export interface CreatePostInput {
  title: string;
  content: string;
}

export async function getPosts() {
  return prisma.post.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createPost(data: CreatePostInput) {
  return prisma.post.create({ data });
}

export async function updatePost(id: string, data: Partial<CreatePostInput>) {
  return prisma.post.update({ where: { id }, data });
}

export async function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}
```

**Rules:**
- One file per Prisma model (or closely related group)
- Export typed input interfaces alongside the functions
- Use `prisma.$transaction([...])` for multi-step operations
- Return `{ success: boolean; error?: string }` from mutations that need explicit error feedback

---

## 5. Hooks Layer — React Query v3

`hooks/` wraps every `data/` function in a React Query hook.

### Setup

```bash
pnpm add react-query
```

`providers/react-query/index.tsx`:

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "react-query";
import { useState } from "react";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: { queries: { refetchOnWindowFocus: false } },
    })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

Wire into `app/layout.tsx`:

```tsx
import { ReactQueryProvider } from "@/providers/react-query";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
```

### Hook file pattern

```ts
// hooks/use-posts.ts
"use client";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getPosts, createPost, updatePost, deletePost, CreatePostInput } from "@/data/posts";

export const POST_KEYS = {
  all: ["posts"] as const,
  list: ["posts", "list"] as const,
  detail: (id: string) => ["posts", "detail", id] as const,
};

export function usePosts() {
  return useQuery(POST_KEYS.list, getPosts, { staleTime: 1000 * 30 });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation((data: CreatePostInput) => createPost(data), {
    onSuccess: () => queryClient.invalidateQueries(POST_KEYS.all),
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: Partial<CreatePostInput> }) =>
      updatePost(id, data),
    { onSuccess: () => queryClient.invalidateQueries(POST_KEYS.all) }
  );
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deletePost(id), {
    onSuccess: () => queryClient.invalidateQueries(POST_KEYS.all),
  });
}
```

**React Query v3 gotchas:**
- Use `isLoading` (not `isPending`)
- `staleTime` in milliseconds
- `enabled: Boolean(id)` to disable until dependency is ready

---

## 6. Forms — react-hook-form + Zod v4

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

### Schema pattern (Zod v4 numeric fields)

> `z.coerce.number()` types fields as `unknown` in Zod v4 — define explicit TS types instead.

```ts
// Define types manually
type PostFormValues = {
  title: string;
  content: string;
  sortOrder: number;
  published: boolean;
};

// Then validate with a matching schema
const PostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  sortOrder: z.number().int().min(0),
  published: z.boolean(),
});

// Helper to parse NumberInput string → number
function toInt(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Math.trunc(value);
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : Math.trunc(n);
  }
  return fallback;
}
```

### Form component pattern

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

export function PostForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutateAsync: createPost, isLoading } = useCreatePost();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(PostSchema),
    defaultValues: { title: "", content: "", sortOrder: 0, published: true },
  });

  const onSubmit = async (values: PostFormValues) => {
    try {
      await createPost(values);
      toast.success("Post created");
      onSuccess();
    } catch {
      toast.error("Failed to create post");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* more fields… */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <ButtonSpinner label="Saving…" /> : "Save"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 7. Auth — JWT Cookies

```bash
pnpm add jose bcryptjs
pnpm add -D @types/bcryptjs
```

### `utils/auth.ts`

```ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE = process.env.NEXT_PUBLIC_COOKIE_NAME!;

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
```

### `middleware.ts` (route protection)

```ts
import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/utils/auth";

const PUBLIC_ADMIN_ROUTES = [
  "/admin/auth/login",
  "/admin/auth/forgot-password",
  "/admin/auth/reset-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (PUBLIC_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) return NextResponse.next();

  const token = request.cookies.get(process.env.NEXT_PUBLIC_COOKIE_NAME!)?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/auth/login", request.url));

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/auth/login", request.url));
  }
}

export const config = { matcher: ["/admin/:path*"] };
```

---

## 8. Admin Module Pattern

Every admin section follows the same 4-file structure:

```
components/admin/modules/[module]/
├── container.tsx          # Page shell (breadcrumb, header, CTA button)
├── [module]-list.tsx      # Data table/list with search, filter, pagination, export
├── manage-[module].tsx    # Create / edit form (react-hook-form + Zod)
└── [optional helpers]
```

### `container.tsx`

```tsx
import PageBreadcrumb from "../../header/pagebreadcrumb";
import PageHeader from "../../header/pageHeader";
import { Button } from "@/components/ui/button";
import PostList from "./post-list";

export default function PostContainer() {
  return (
    <div className="py-2 sm:py-4 space-y-4 px-2">
      <PageBreadcrumb />
      <div className="flex items-start justify-between gap-3">
        <PageHeader
          title={<span>Blog <span className="text-orange-gradient">Posts</span></span>}
          description="Manage all blog posts from here."
        />
      </div>
      <PostList />
    </div>
  );
}
```

### `[module]-list.tsx` structure

```
state: searchQuery, filter, currentPage, selectedItem, dialogOpen
│
├── isLoading → <Skeleton /> cards
├── isError   → <Empty> with retry button
├── no data   → <Empty> with create CTA
└── data      →
      ├── <Card> with filter controls (Input, Select, export Button)
      ├── items mapped to <Item variant="outline"> cards
      │     └── <ItemContent> + <ItemActions> (<DropdownMenu>)
      ├── <CustomPagination>
      ├── <ScrollableDialogModal> create form
      ├── <ScrollableDialogModal> edit form
      └── <AlertDialog> delete confirmation
```

### `app/admin/[module]/page.tsx`

```tsx
import ModuleContainer from "@/components/admin/modules/[module]/container";

export default function AdminModulePage() {
  return <ModuleContainer />;
}
```

---

## 9. Seed Scripts

```
seeds/
├── admin.ts          # Default admin users (bcrypt hash passwords)
├── blog.ts           # Sample blog posts
├── testimonials.ts   # Text + video testimonials
└── pricing.ts        # Pricing plans + page settings
```

### `seeds/[model].ts` template

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function seed() {
  console.log("🌱 Seeding [model]…");
  let created = 0, updated = 0;

  for (const item of SEED_DATA) {
    const existing = await prisma.[model].findUnique({ where: { uniqueField: item.uniqueField } });

    if (existing) {
      await prisma.[model].update({ where: { id: existing.id }, data: item });
      updated++;
      continue;
    }

    await prisma.[model].create({ data: item });
    created++;
  }

  console.log(`✅ Done — ${created} created, ${updated} updated`);
}

seed()
  .catch((err) => { console.error("❌ Seed failed:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

### `package.json` scripts

```json
{
  "scripts": {
    "dev":                "next dev",
    "build":              "next build",
    "start":              "next start",
    "lint":               "eslint",
    "db:push":            "prisma db push",
    "db:generate":        "prisma generate",
    "db:migrate":         "prisma migrate dev",
    "db:studio":          "prisma studio",
    "admin:create":       "tsx scripts/create-admin.ts",
    "seed:admins":        "tsx seeds/admin.ts",
    "seed:blogs":         "tsx seeds/blog.ts",
    "seed:testimonials":  "tsx seeds/testimonials.ts",
    "seed:pricing":       "tsx seeds/pricing.ts",
    "seed:all":           "pnpm seed:admins && pnpm seed:blogs && pnpm seed:testimonials && pnpm seed:pricing"
  }
}
```

---

## 10. Static / Seed Data Pattern

Static seed data lives in `lib/` as plain TS files — separate from the seed scripts themselves.

```
lib/
├── prisma.ts             # Prisma singleton
├── blog-data.ts          # Static blog post data for seeding
├── testimonial-data.ts   # Static testimonial data + UI mappers
├── pricing-data.ts       # Static pricing plan data + UI types/mappers
├── send-email.ts         # Nodemailer helper
├── utils.ts              # cn(), misc utilities
└── export-excel.ts       # exportToExcel() + formatExportDate()
```

**UI mapper pattern** (e.g. `lib/pricing-data.ts`):

```ts
// Prisma type → UI-friendly type
export function toPricingPlanUI(plan: PricingPlanWithPacks): PricingPlanUI {
  return {
    id: plan.id,
    name: plan.name,
    price: plan.price,
    features: plan.features,
    creditPacks: plan.creditPacks.sort(...).map(...),
  };
}
```

---

## 11. Validators

```
validators/
├── schemas/
│   ├── custom-validation.ts   # imageSchema, fileSchema, shared Zod helpers
│   ├── admin-auth.ts          # Login / password reset Zod schemas
│   ├── blog.ts                # Blog form schema
│   └── [module].ts            # Per-module schemas
└── types/
    ├── school.ts              # API response types for School service
    └── [model].ts             # Shared TS interfaces
```

---

## 12. Vercel Deployment

### `vercel.json`

```json
{
  "buildCommand": "pnpm prisma generate && pnpm prisma migrate deploy && pnpm seed:pricing && pnpm build"
}
```

**Order matters:**
1. `prisma generate` — regenerate Prisma client for current schema
2. `prisma migrate deploy` — apply any pending migrations to prod DB
3. `seed:*` — seed only idempotent data (upserts, not destructive)
4. `build` — Next.js build

### Environment variables on Vercel

Set all `.env` keys in **Vercel → Project → Settings → Environment Variables**. Mark sensitive ones (JWT_SECRET, DATABASE_URL, SMTP_PASS) as encrypted.

---

## 13. Sidebar Navigation Config

```ts
// components/admin/sidebar/sidebaritems.tsx

export const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/admin" },
  { icon: FileText,        label: "Content",      href: "/admin/blogs",
    subItems: [
      { label: "Blog Posts",          href: "/admin/blogs" },
      { label: "Comment Moderation",  href: "/admin/comments" },
    ],
  },
  // Add new modules here following the same pattern
  {
    icon: Tag,
    label: "New Module",
    href: "/admin/new-module",
    roles: ["SUPER_ADMIN"],   // optional: restrict by role
    subItems: [
      { label: "All Items", href: "/admin/new-module" },
    ],
  },
];
```

---

## 14. Adding a New Admin Module — Checklist

1. **Prisma model** → add to `prisma/schema.prisma`, run `pnpm db:migrate`
2. **Regenerate client** → `pnpm db:generate`
3. **Server actions** → create `data/[module].ts` with CRUD functions
4. **Static seed data** (if needed) → create `lib/[module]-data.ts`
5. **Seed script** → create `seeds/[module].ts`, add `seed:[module]` to `package.json`
6. **Hooks** → create `hooks/use-[module].ts` with React Query wrappers
7. **Zod schemas / types** → add to `validators/schemas/[module].ts` and `validators/types/`
8. **Admin UI:**
   - `components/admin/modules/[module]/container.tsx`
   - `components/admin/modules/[module]/[module]-list.tsx`
   - `components/admin/modules/[module]/manage-[module].tsx`
9. **App route** → create `app/admin/[module]/page.tsx`
10. **Sidebar** → add entry to `sidebaritems.tsx`
11. **Public component** (if public-facing) → create `components/pages/[Section]/[module].tsx` and wire to public hook

---

## 15. Key Shared Components Reference

| Component | Path | Use |
|---|---|---|
| `ScrollableDialogModal` | `components/custom/custom-modal.tsx` | Create / edit modals |
| `AlertDialog` | `components/ui/alert-dialog.tsx` | Delete confirmations |
| `CustomPagination` | `components/custom/pagination.tsx` | Client-side pagination |
| `ButtonSpinner` | `components/custom/spinner.tsx` | Loading state in buttons |
| `ImageUploader` | `components/custom/imageuploader.tsx` | Image pick + upload |
| `NumberInput` | `components/custom/number-input.tsx` | Numeric fields (react-aria) |
| `PageHeader` | `components/admin/header/pageHeader.tsx` | Admin page titles |
| `PageBreadcrumb` | `components/admin/header/pagebreadcrumb.tsx` | Auto-built from pathname |
| `Item`, `ItemContent`, `ItemTitle`… | `components/ui/item.tsx` | Admin list card rows |
| `Empty`, `EmptyHeader`… | `components/ui/empty.tsx` | Empty / error states |
| `DataGrid` + related | `components/ui/data-grid*.tsx` | Table view (alternative to cards) |
| `SectionTag` | `components/pages/layout/section-tag.tsx` | Public section labels |
| `exportToExcel` | `lib/export-excel.ts` | `.xlsx` download |

---

## 16. Local Development Quickstart

```bash
# 1. Clone and install
git clone <repo-url>
cd project
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your DB credentials and secrets

# 3. Database setup
pnpm db:migrate          # creates tables
pnpm db:generate         # generates Prisma client

# 4. Seed initial data
pnpm seed:all            # admins + blogs + testimonials + pricing

# (Optional) Create a super admin manually
pnpm admin:create

# 5. Run dev server
pnpm dev
```

Open `http://localhost:3000` (public site) and `http://localhost:3000/admin` (admin portal).

---

## 17. Production Deployment (Vercel)

```bash
# 1. Push repo to GitHub
git push origin main

# 2. Import project in Vercel dashboard
#    — Set all env vars from .env (use production DB URL, production URLs)
#    — vercel.json handles the build command automatically

# 3. First deploy runs:
#    prisma generate → prisma migrate deploy → seed:pricing → next build
```

> **Note:** Only include idempotent seeds in `vercel.json` (upserts only). Remove destructive seed scripts from the deploy command.

---

*Generated from the Edufacilis Website project — use this as a repeatable template for Next.js + Prisma + React Query projects.*
