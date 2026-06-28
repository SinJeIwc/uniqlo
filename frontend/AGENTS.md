<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:shadcn-skill-rule -->
# shadcn/ui — always use project-local skill

When working with shadcn/ui components, styling, or patterns:
1. Load `.agents/skills/shadcn/SKILL.md` first — it has the canonical patterns for this project's shadcn version, base library (base-ui, NOT radix), and installed components.
2. Use ONLY semantic design tokens from `src/app/globals.css` — never raw Tailwind colors (`bg-black`, `text-zinc-500`, etc.). The tokens are:
   - `bg-primary` / `text-primary-foreground` — black/white
   - `bg-secondary` / `text-secondary-foreground`
   - `bg-muted` / `text-muted-foreground`
   - `bg-accent` / `text-accent-foreground`
   - `border-border` / `ring-ring`
   - `bg-destructive` / `text-destructive`
3. Button icon sizes: use `size="icon-lg"` (size-11) for header icons, `size="icon"` (size-9) for standard.
4. Variants: `pill` adds `rounded-full`; `ghost` is for icon buttons.
<!-- END:shadcn-skill-rule -->
