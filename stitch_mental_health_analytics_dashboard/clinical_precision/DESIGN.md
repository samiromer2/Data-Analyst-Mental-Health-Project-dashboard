---
name: Clinical Precision
colors:
  surface: '#f5faf8'
  surface-dim: '#F1F5F9'
  surface-bright: '#f5faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f5f2'
  surface-container: '#eaefed'
  surface-container-high: '#e4e9e7'
  surface-container-highest: '#dee4e1'
  on-surface: '#171d1c'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2c3130'
  inverse-on-surface: '#edf2f0'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#924628'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05e3d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#f5faf8'
  on-background: '#171d1c'
  surface-variant: '#dee4e1'
  border-outline-variant: '#E2E8F0'
  text-charcoal: '#1E293B'
  text-slate-muted: '#64748B'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
  data-point-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  data-point-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  panel-gap: 32px
---

## Brand & Style
The brand personality is defined by **Healthcare Intelligence**—a synthesis of clinical authority and high-performance SaaS efficiency. It is designed to evoke a sense of "Empathetic Rigor," catering to medical professionals and data analysts who require absolute clarity and zero distractions.

The design style follows a **Modern Corporate / Minimalist** aesthetic. It moves away from the "friendliness" of consumer apps toward the "precision" of institutional tools. Key visual markers include:
- **Flat Visual Language:** Minimal use of shadows or gradients to maintain a professional, paper-like clarity.
- **Structural Framing:** Reliance on thin, precise borders (`outline-variant`) rather than elevation to define relationships.
- **Surface Layering:** Using `surface-dim` to subtly group content, ensuring the interface feels integrated rather than fragmented.
- **Functional Density:** A clean but information-rich environment that respects the user's expertise.

## Colors
The palette is anchored by **Deep Teal** (#0D9488), which serves as the primary brand and action color, symbolizing health and stability. This is balanced by a sophisticated **Slate and Charcoal** neutral palette.

- **Primary:** Deep Teal for primary actions, success states, and key highlights.
- **Neutrals:** Charcoal (#1E293B) is the standard for high-contrast typography, while Slate (#64748B) is used for secondary information.
- **Surfaces:** The background remains a crisp white, while `surface-dim` (#F1F5F9) provides a subtle, non-distracting background for secondary panels and grouping areas.
- **Outlines:** Instead of shadows, use a thin 1px border (#E2E8F0) to define container boundaries and input fields.

## Typography
The system uses **Inter** for all prose and UI elements to ensure maximum legibility and a modern SaaS feel. A strong hierarchy is enforced through generous scale differences and weight variations.

To emphasize the intelligence aspect, **JetBrains Mono** is introduced for numerical data points and metrics. This monospaced choice ensures that numbers align perfectly in tables and dashboard widgets, facilitating easier comparison of data sets.

- **Headings:** Large and bold with tight letter-spacing for an authoritative look.
- **Body:** Open line-height for comfortable reading of clinical reports.
- **Metrics:** Use the monospaced font family for any dynamic data value or statistical count.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a strict 8px spacing rhythm to reduce visual noise and improve scanning speed.

- **Desktop (1280px+):** 12-column grid with 40px outer margins and 24px gutters. Use wide gutters to create "breathing room" between complex data modules.
- **Tablet (768px - 1279px):** 8-column grid with 24px margins.
- **Mobile (<768px):** 4-column grid with 16px margins. 

Large layouts should prioritize **horizontal grouping** using whitespace and thin dividers rather than nested boxes. Use the `panel-gap` unit for major section breaks to ensure a high-end, editorial feel.

## Elevation & Depth
This system intentionally avoids traditional shadows to maintain a flat, "clinical-clean" aesthetic. Hierarchy is achieved through **Tonal Tiers** and **Precise Borders**:

- **Level 0 (Base):** White (#FFFFFF) - the main workspace.
- **Level 1 (Subtle Grouping):** Use `surface-dim` (#F1F5F9) as a background for sidebars, filter panels, or dashboard "slots."
- **Level 2 (Active Elements):** Defined by 1px `border-outline-variant` (#E2E8F0) borders.
- **Level 3 (Overlays):** For modals or dropdowns, use a 1px border and a single, very soft ambient shadow (0 10px 15px -3px rgba(0, 0, 0, 0.05)) to separate the element from the data behind it.

## Shapes
The shape language is refined to a **Soft-Geometric** style (`roundedness: 1`). This provides a precise, engineered appearance common in professional SaaS platforms.

- **Buttons & Inputs:** 0.25rem (4px) corner radius.
- **Metric Cards & Panels:** 0.5rem (8px) corner radius.
- **Data Visualizations:** Bar charts and chart markers should use sharp or 2px radii to maintain technical accuracy.

## Components
- **MetricCard:** A white surface with a 1px border. Feature a `data-point-lg` value in Teal, with a small `label-sm` title in Slate above it. No shadows.
- **DataChart:** Clean axes using `border-outline-variant`. Use the Primary Teal for data lines/bars. Tooltips should have a white background and a 1px border.
- **FilterBar:** A `surface-dim` horizontal bar that spans the top of content areas. Use `rounded-sm` for individual filter pills within the bar.
- **InsightPanel:** A right-aligned drawer or section with a `surface-dim` background. Used for qualitative commentary on quantitative data.
- **Buttons:** Primary buttons are solid Deep Teal with white text. Secondary buttons use a white background with a 1px Teal border (Ghost style).
- **Input Fields:** 1px border (#E2E8F0) that transitions to Primary Teal on focus. Use `label-md` for field labels, positioned above the input.