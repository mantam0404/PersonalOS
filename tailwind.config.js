/** @type {import('tailwindcss').Config} */
/**
 * Personal OS — Vercel Design System (Tailwind v4)
 *
 * This project uses Tailwind v4 CSS-first configuration.
 * Design tokens live in:
 *   - src/styles/vercel-tokens.css  (CSS variables, light + dark)
 *   - src/styles/vercel-theme.css   (@theme utility bindings)
 *
 * Source: open-design/design-systems/vercel
 * @see design-systems/vercel/DESIGN.md
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['selector', '.dark'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
          warm: 'var(--surface-warm)',
        },
        fg: {
          DEFAULT: 'var(--fg)',
          2: 'var(--fg-2)',
        },
        muted: 'var(--muted)',
        meta: 'var(--meta)',
        border: {
          DEFAULT: 'var(--border)',
          soft: 'var(--border-soft)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          on: 'var(--accent-on)',
          hover: 'var(--accent-hover)',
          active: 'var(--accent-active)',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        ring: 'var(--elev-ring)',
        raised: 'var(--elev-raised)',
        sm: 'var(--shadow-sm)',
        focus: 'var(--focus-ring)',
      },
      maxWidth: {
        container: 'var(--container-max)',
      },
      spacing: {
        'bento-gap': 'var(--bento-gap)',
        'section-desktop': 'var(--section-y-desktop)',
        'section-tablet': 'var(--section-y-tablet)',
        'section-phone': 'var(--section-y-phone)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        base: 'var(--motion-base)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
    },
  },
}
