# Personal OS — Vercel Design System

> Based on [open-design/design-systems/vercel](https://github.com/nexu-io/open-design/tree/main/design-systems/vercel)
> Adapted for Personal OS Bento Dashboard with explicit dark/light theme tokens.

## Source

- **open-design** Vercel `DESIGN.md` + `tokens.css` + `tailwind-v4.css`
- **Personal OS overrides** for dashboard dark mode (`#0a0a0a` canvas, `#111` cards)

## Token files in this repo

| File | Purpose |
|------|---------|
| `src/styles/vercel-tokens.css` | CSS variables (`:root` + `.dark`) |
| `src/styles/vercel-theme.css` | Tailwind v4 `@theme` bindings |
| `tailwind.config.js` | Reference + content paths (Tailwind v4 CSS-first) |

## Color contract

### Dark (default)
- Page: `#0a0a0a`
- Card: `#111111` / `#161616`
- Text: `#f5f5f5` / `#888888`
- Border: `rgba(255,255,255,0.08)`

### Light
- Page: `#ffffff`
- Card: `#fafafa`
- Text: `#171717` / `#666666`
- Border: `#eaeaea`
