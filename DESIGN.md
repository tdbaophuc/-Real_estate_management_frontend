---
version: "alpha"
name: "HeritageEstate"
description: "Enterprise design system tokens for a real estate management, listings, CRM, contracts, and operations platform."

colors:
  # Brand colors
  primary: "#14323E"           # Deep estate teal. Primary navigation, main actions, durable brand surfaces.
  secondary: "#5B6B73"         # Operational slate. Secondary text, icons, metadata, quiet controls.
  tertiary: "#7C4A03"          # Trust bronze. High-value business actions only: close deal, approve, paid.

  # Structural colors
  neutral-light: "#F5F7F8"     # App canvas. Calm office background for long operating sessions.
  neutral-dark: "#172126"      # Primary text. Softer than black while retaining enterprise contrast.
  surface: "#FFFFFF"           # Cards, tables, drawers, dialogs.
  border: "#D7E0E2"            # Low-noise separators and input outlines.

  # Semantic states
  state-new: "#50616A"         # New records, neutral work queue.
  state-contacted: "#8A5A00"   # In-progress contact, appointments, review queues.
  state-negotiating: "#A33A32" # Urgent negotiation, cancellation, risk, failed workflows.
  state-won: "#1F6F4A"         # Closed won, paid, approved, completed.
  state-info: "#2E5EAA"        # Informational status, linked records, system notices.

typography:
  h1:
    fontFamily: Plus Jakarta Sans, sans-serif
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: Plus Jakarta Sans, sans-serif
    fontSize: 1.5rem
    fontWeight: 650
    lineHeight: 1.3
  body-md:
    fontFamily: Inter, sans-serif
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.6
  label-caps:
    fontFamily: Space Grotesk, sans-serif
    fontSize: 0.75rem
    fontWeight: 600
    letterSpacing: 0.05em

rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 12px

spacing:
  xs: 8px
  sm: 12px
  md: 20px
  lg: 28px

components:
  app-shell:
    backgroundColor: "{colors.neutral-light}"
    textColor: "{colors.neutral-dark}"
  sidebar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral-dark}"
  topbar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral-dark}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "#0F2630"
    textColor: "#FFFFFF"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral-dark}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-action:
    backgroundColor: "{colors.tertiary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: 12px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral-dark}"
    rounded: "{rounded.sm}"
  table:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral-dark}"
  kanban-column:
    backgroundColor: "#EEF3F4"
    textColor: "{colors.neutral-dark}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"
  kanban-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral-dark}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  badge-new:
    backgroundColor: "#E8EEF0"
    textColor: "{colors.state-new}"
  badge-contacted:
    backgroundColor: "#FFF2D6"
    textColor: "{colors.state-contacted}"
  badge-negotiating:
    backgroundColor: "#FCE8E6"
    textColor: "{colors.state-negotiating}"
  badge-won:
    backgroundColor: "#E4F4EC"
    textColor: "{colors.state-won}"
  badge-info:
    backgroundColor: "#E7EEFA"
    textColor: "{colors.state-info}"
---

## Overview

HeritageEstate uses an enterprise operations style: quiet, structured, and optimized for repeat daily work. The interface should feel like a reliable business system for agents, managers, finance, and admin teams, not a promotional real estate landing page.

The product handles high-value workflows: property inventory, listings, customer CRM, Lead Pipeline, appointments, contracts, transactions, commissions, reports, AI assistance, and audit logs. Design choices must support scanning, comparison, review, and confident action.

## Color System

The palette is intentionally grounded in real estate operations:

- **Primary (#14323E):** Deep estate teal. Use for primary actions, active navigation, selected controls, and durable brand elements.
- **Secondary (#5B6B73):** Operational slate. Use for helper text, metadata, inactive icons, and secondary information.
- **Tertiary (#7C4A03):** Trust bronze. Reserve for high-value business actions only: approve, close deal, mark paid, finalize.
- **Neutral light (#F5F7F8):** Main canvas. It keeps table-heavy views calm during long sessions.
- **Neutral dark (#172126):** Primary text. It gives strong readability without harsh black.
- **Surface (#FFFFFF):** Cards, tables, dialogs, drawers, and input surfaces.
- **Border (#D7E0E2):** Structural separation. Use sparingly and consistently.

Semantic states must be stable across the CRM:

- **New:** neutral slate.
- **Contacted / pending / review:** amber brown.
- **Negotiating / danger / cancelled:** muted red.
- **Won / completed / paid / approved:** deep green.
- **Info / linked / system:** business blue.

## Typography

- Use `Plus Jakarta Sans` for page headings and section headings.
- Use `Inter` for dense operational content: tables, forms, cards, drawers.
- Use `Space Grotesk` with `letterSpacing: 0.05em` for compact labels such as language switchers, eyebrows, and small operational controls.
- Use Sentence case for labels, table headers, Kanban columns, and buttons. Do not use all-caps UI labels except raw technical values that are data, not interface copy.

## Layout And Density

This system should prioritize productive density over decorative whitespace:

- Tables and filters should remain compact and scannable.
- Cards are for repeated records, dialogs, drawers, and tool panels. Do not nest cards inside cards.
- Filter bars should keep action buttons stable in width across languages.
- Use spacing `md` for primary content sections and `sm` for dense forms or Kanban columns.
- On mobile, preserve hierarchy and avoid horizontal overflow rather than shrinking type aggressively.

## Shapes And Elevation

- Interactive controls use `rounded.sm` (6px). This keeps the product crisp and enterprise-grade.
- Containers use `rounded.md` or `rounded.lg`, never pill-shaped corners unless the element is a badge.
- Shadows must be subtle and neutral. Use elevation to separate layers, not to decorate.

## Component Rules

### Buttons

- Primary buttons use `primary` with white text.
- Secondary buttons are white with border and dark text.
- High-value business actions may use `tertiary`, but only when the action creates financial or workflow finality.
- Destructive buttons use danger red and must be paired with explicit confirmation for irreversible actions.

### Forms

- Inputs use white surface, dark text, border token, and 6px radius.
- Validation badges and messages must be readable at WCAG AA contrast.
- Field labels use Sentence case and concise wording.

### CRM Kanban Board

- Kanban columns use a muted background, no heavy border, and compact spacing.
- Lead cards use white surface, subtle shadow, and clearly separated metadata.
- Status labels must render as human-readable Sentence case, not raw enum values.
- Priority should be indicated with small badges or dots, not full-card color fills.

### Data Tables

- Tables are the primary enterprise view. They should be dense but readable.
- Column headers use Sentence case.
- Row actions should be compact and right-aligned.
- Empty states should explain the next useful action without marketing copy.

## Do

- Keep contrast WCAG AA for text on colored backgrounds.
- Prefer neutral surfaces and one purposeful action color.
- Preserve technical nouns such as Lead, Pipeline, CRM, Listing, Contract, Transaction, Kanban, and AI when they are domain terms.
- Make controls stable across English and Vietnamese labels.
- Use semantic status color consistently across every module.

## Do Not

- Do not use national flags for language switching.
- Do not use bright real-estate advertising colors, glossy gradients, colorful shadows, or decorative blobs.
- Do not overuse bronze accent for ordinary actions.
- Do not make operational screens look like landing pages.
- Do not use `border-radius: 9999px` for normal buttons or inputs.
