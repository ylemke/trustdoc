# TrustDoc Design System v2.0
## Non-Generic, Editorial, Professional

**Design Philosophy:** Legal infrastructure with editorial sophistication. Not corporate-boring, not startup-flashy. Authoritative, trustworthy, modern.

**Visual References:**
- Linear (dark mode sophistication)
- Stripe Docs (editorial typography)
- Resend (brutalist touches)
- Observatory (asymmetric layouts)
- Swiss design principles (grid-breaking intentionally)

---

## Color System

### Primary Palette (Dark Mode First)
```css
:root {
  /* Neutrals - Warm grayscale, not cold blue-gray */
  --gray-50: #fafaf9;
  --gray-100: #f5f5f4;
  --gray-200: #e7e5e4;
  --gray-300: #d6d3d1;
  --gray-400: #a8a29e;
  --gray-500: #78716c;
  --gray-600: #57534e;
  --gray-700: #44403c;
  --gray-800: #292524;
  --gray-900: #1c1917;
  --gray-950: #0c0a09;

  /* Accent - Subdued, not bright */
  --accent-amber: #fbbf24;
  --accent-amber-dark: #f59e0b;
  --accent-emerald: #10b981;
  --accent-emerald-dark: #059669;
  --accent-rose: #f43f5e;
  --accent-rose-dark: #e11d48;

  /* Semantic */
  --approve: var(--accent-emerald);
  --override: var(--accent-amber);
  --escalate: var(--accent-rose);

  /* Background layers */
  --bg-base: #0a0908;
  --bg-elevated: #1a1816;
  --bg-overlay: #252220;
  --bg-paper: #ffffff;

  /* Text hierarchy */
  --text-primary: #fafaf9;
  --text-secondary: #a8a29e;
  --text-tertiary: #78716c;
  --text-inverse: #1c1917;

  /* Borders */
  --border-subtle: rgba(250, 250, 249, 0.08);
  --border-default: rgba(250, 250, 249, 0.12);
  --border-strong: rgba(250, 250, 249, 0.2);

  /* Hash/Code display */
  --code-bg: #1c1917;
  --code-text: #10b981;
  --code-border: rgba(16, 185, 129, 0.2);
}
