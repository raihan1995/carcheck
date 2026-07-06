---
name: Precision Automotive Intelligence
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  status-success: '#10B981'
  status-error: '#EF4444'
  status-warning: '#F59E0B'
  slate-gray: '#64748B'
  border-subtle: '#E2E8F0'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  status-badge:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-value:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  data-label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  mono-label:
    fontFamily: Courier Prime
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 1rem
  gutter-row: 0.75rem
  stack-section: 1.5rem
  card-padding: 1.25rem
---

## Brand & Style

The design system is engineered for the high-trust automotive data sector, balancing the technical rigor of a fintech platform with the sleek, aerodynamic aesthetics of modern car design. The target audience includes used-car buyers, automotive professionals, and enthusiasts who require immediate, authoritative vehicle history.

The visual style is **Corporate / Modern** with a focus on data density and clarity. It utilizes a layered surface approach to organize complex technical information into digestible modules. High-contrast status indicators and a structured grid evoke a sense of precision and mechanical reliability. The interface should feel fast, utilitarian, and indisputable.

## Colors

The palette is anchored by a deep navy primary, providing a prestigious "Dark Mode" feel even in light configurations. This serves as the foundation for high-contrast typography. 

- **Primary (#0F172A):** Used for navigation bars, primary headings, and high-emphasis containers.
- **Secondary (#3B82F6):** Reserved for actionable elements, CTAs, and active states to guide the eye through the data flow.
- **Background (#F8FAFC):** A clean, cool-toned gray that prevents eye strain during long reading sessions of technical specs.
- **Semantic Colors:** Green and Red are used strictly for legal vehicle status (Tax, MOT, Category checks). Use these alongside clear iconography to ensure accessibility.

## Typography

This design system prioritizes **Data Hierarchy**. The font of choice is Inter, selected for its tall x-height and exceptional legibility on mobile screens. 

Key typographic principles:
- **Upper-case labeling:** Small labels for data categories (e.g., "ENGINE CAPACITY") should be uppercase with slightly increased letter-spacing to distinguish them from the dynamic values.
- **Bold Statuses:** Use heavy weights for pass/fail statuses to ensure they are the first thing a user sees.
- **Monospaced Accents:** Utilize a secondary monospaced font sparingly for VIN numbers or registration plates to provide a technical, "scanned" feel.

## Layout & Spacing

The layout follows a **Fixed-Width Mobile-First** approach. Content is organized into a single-column stack of data modules. 

- **Grid:** Use a 4-column grid for internal card layouts (e.g., splitting "Taxed" and "MOT" status side-by-side).
- **Rhythm:** A 4px baseline grid ensures tight, technical alignment. Vertical spacing between different data categories should be generous (24px) to prevent the "wall of text" effect typical of technical documents.
- **Reflow:** On larger tablets, data cards should reflow into a 2-column masonry grid rather than stretching full-width.

## Elevation & Depth

This design system uses **Tonal Layers** rather than heavy shadows to maintain a clean, modern aesthetic. 

- **Level 0:** Background (#F8FAFC).
- **Level 1:** Content cards use white (#FFFFFF) backgrounds with a 1px border (#E2E8F0). No shadow.
- **Level 2:** Active or "High-Trust" modules (like the main vehicle summary) use a very soft, subtle ambient shadow (4px blur, 2% opacity) to float slightly above the canvas.
- **Interaction:** Buttons use a solid fill; upon press, they should shift to a darker tonal value rather than changing elevation.

## Shapes

The shape language is inspired by automotive surfacing—intentional, smooth, but structured. 

- **Cards & Inputs:** Use the 8px (0.5rem) default radius to mirror the soft-cornered aesthetics of modern car interiors and dashboard displays.
- **Status Badges:** Use "Pill-shaped" (999px) rounding for status indicators (e.g., "Valid") to distinguish them from interactive buttons.
- **Interactive Elements:** Primary CTAs should maintain the consistent 8px radius to feel integrated into the layout.

## Components

- **Buttons:** Primary buttons use a solid Electric Blue (#3B82F6) fill with white text. Secondary buttons use a transparent background with a 1px navy border.
- **Status Badges:** Compact labels with a light tinted background (e.g., light green background with dark green text) for MOT and Tax status.
- **Data Rows:** Use a horizontal layout with the label on the left (Slate Gray) and the value on the right (Navy, Bold). A thin 1px divider should separate rows within a card.
- **Input Fields:** Search bars for VRM (Vehicle Registration Mark) should be oversized with a high-contrast border and a prominent "Check" button inside the field.
- **MOT History Timeline:** A vertical stepper component showing MOT dates, results, and mileage. Use a red dot for failures and a green dot for passes.
- **Technical Spec Tables:** High-contrast tables with alternating row colors (White and #F8FAFC) for readability of dense mechanical data.