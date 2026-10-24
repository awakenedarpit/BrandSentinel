---
name: BrandSentinel AI Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#cedaf8'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e8eeff'
  surface-container-high: '#e0e8ff'
  surface-container-highest: '#d7e2ff'
  on-surface: '#0f1b31'
  on-surface-variant: '#484556'
  inverse-surface: '#243047'
  inverse-on-surface: '#ecf0ff'
  outline: '#787587'
  outline-variant: '#c9c4d8'
  surface-tint: '#5c3aeb'
  primary: '#4003d1'
  on-primary: '#ffffff'
  primary-container: '#5936e8'
  on-primary-container: '#d6ceff'
  inverse-primary: '#c8bfff'
  secondary: '#004ddf'
  on-secondary: '#ffffff'
  secondary-container: '#3168fc'
  on-secondary-container: '#fffbff'
  tertiary: '#3a4361'
  on-tertiary: '#ffffff'
  tertiary-container: '#515b79'
  on-tertiary-container: '#cad3f7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5deff'
  primary-fixed-dim: '#c8bfff'
  on-primary-fixed: '#1a0064'
  on-primary-fixed-variant: '#430dd4'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#00164e'
  on-secondary-fixed-variant: '#003baf'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#bcc5e9'
  on-tertiary-fixed: '#101a35'
  on-tertiary-fixed-variant: '#3c4663'
  background: '#f9f9ff'
  on-background: '#0f1b31'
  surface-variant: '#d7e2ff'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-meta:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers an ultra-premium, enterprise-grade aesthetic tailored for executive brand stewards, corporate risk teams, and marketing governance officers. It establishes an atmosphere of vigilance, forensic precision, and intellectual clarity.

### Core Philosophy
- **Vigilance & Trust:** Evoke defense and stability through deep structured navy and crisp high-contrast surfaces.
- **Cognitive Clarity:** Dense compliance telemetry presented with calm restraint, preventing cognitive fatigue via clear spatial hierarchy and deliberate accent highlights.
- **Modern Kinetic AI:** Radiant violet-to-blue gradients reserved exclusively for high-leverage AI telemetry, smart recommendations, and proactive insights.

### Aesthetic Movement
A synthesis of **Corporate Modern** and **Tactile Precision**: ultra-sharp 1px borders, subtle multi-tier diffusion shadows, high-legibility typography with negative headline tracking, and soft-radius container geometry.

## Colors

The palette balances authoritative structure with vibrant, intelligent illumination.

### Primary & Brand Accents
- **Primary Violet (`#5936E8`):** The core intelligence driver. Used for primary CTAs, active navigation states, selected rule toggles, and hero AI actions.
- **Electric Blue (`#356BFF`):** Secondary accent. Used for interactive links, data visualizations, live monitoring streams, and combined gradient blends with Brand Violet.
- **Deep Navy / Neutral-900 (`#101A35`):** Structural anchor. Powers the left-hand executive navigation bar, terminal headers, and deep surface containers.
- **Soft Lavender Tint (`#EEE9FF`):** Tinted highlight surface for AI rule badges, selected table rows, and active filter tags.

### Neutrals & Canvas
- **Canvas App Background:** `#F7F8FC`
- **Surface & Cards:** `#FFFFFF`
- **Primary Text:** `#182238`
- **Secondary / Muted Text:** `#64708A`
- **Delicate Border / Dividers:** `#E4E8F0`

### Semantic Governance System
- **Compliant (Success):** `#10B981` (Surface: `#ECFDF5`, Border: `#A7F3D0`)
- **Review Required (Warning):** `#F59E0B` (Surface: `#FFFBEB`, Border: `#FDE68A`)
- **Violation (Critical):** `#EF4444` (Surface: `#FEF2F2`, Border: `#FECACA`)

## Typography

The typographic hierarchy prioritizes rapid scannability and structural density.

### Rules of Usage
- **Display & Section Headers:** Set in `Inter` with optical kerning and aggressive negative tracking (`-0.02em` to `-0.03em`) for high-polish enterprise precision.
- **Body & Data Grid:** Set in `Inter` regular and medium weights. Line heights remain tight (`1.4` to `1.5`) to preserve dense vertical space for tabular data.
- **Rule Identifiers & System Telemetry:** Set exclusively in `JetBrains Mono` (`label-code`) with all-caps uppercase styling and positive tracking (`0.04em`) to distinctly frame audit tokens such as `BG-001`, `IP-404`, or `VOICE-TRADEMARK`.

## Layout & Spacing

The layout is built around a rigorous 8px metric system designed for enterprise density and two-pane analytical workspaces.

### Architectural Framework
- **Primary Shell:** Fixed/collapsible left navigation sidebar (`260px` expanded, `72px` collapsed).
- **Workspace Canvas:** A persistent 64px header containing context filters, global search, and compliance status indicators.
- **Body Grid:** Two-column fluid workspace. The primary inspection stream occupies `65%` (or 8 of 12 columns), while the AI diagnostics, rule validation checklist, and inspector drawer occupy `35%` (or 4 of 12 columns).
- **Responsive Adaptations:**
  - **Desktop (>1280px):** Full dual-pane view with persistent inspection rail.
  - **Tablet (768px - 1279px):** Inspector transitions into a sliding right drawer; sidebar collapses into icon-only mode.
  - **Mobile (<768px):** Stacks inspector beneath audit feed; top bar collapses into a persistent bottom sheet navigation.

## Elevation & Depth

Visual hierarchy uses layered surfaces combined with soft, low-chroma ambient shadows rather than harsh physical elevation.

### Surface Tiers
- **Tier 0 (Canvas):** `#F7F8FC`
- **Tier 1 (Cards, Workspaces, Grids):** Pure `#FFFFFF` resting on 1px solid `#E4E8F0` border.
- **Tier 2 (Popovers, Flyouts, Selected Rule Cards):** `#FFFFFF` paired with subtle two-stage ambient shadow:
  `box-shadow: 0 1px 3px rgba(16, 26, 53, 0.05), 0 10px 25px -5px rgba(16, 26, 53, 0.06);`
- **Tier 3 (Modals, Forensic Zoom Drawers):** High-diffusion elevation:
  `box-shadow: 0 20px 40px -10px rgba(16, 26, 53, 0.12);`
- **AI Highlight / Focus State:** Soft brand aura using `box-shadow: 0 0 0 3px rgba(89, 54, 232, 0.15)`.

## Shapes

The geometric framework balances approachable modern styling with technical restraint.

- **Cards & Data Containers:** `12px` to `16px` border-radius (`rounded-lg` to `rounded-xl`).
- **Interactive Buttons & Inputs:** `8px` border-radius for an agile, professional feel.
- **Badges, Rule Pills, Status Indicators:** `9999px` full pill radius for immediate semantic separation from rectilinear form fields.
- **Brand Avatar & Shield Badges:** Squircle profiles with smooth continuous curves.

## Components

### Buttons
- **Primary (AI / Action):** Solid `#5936E8` background, `#FFFFFF` text, subtle gradient hover shift to `#356BFF`. 8px border radius, 0 1px 2px rgba(16, 26, 53, 0.1) shadow.
- **Secondary:** Surface `#FFFFFF`, 1px solid `#E4E8F0`, text `#182238`. On hover: surface `#F7F8FC`, border `#CBD5E1`.
- **Tertiary / Ghost:** Transparent background, text `#64708A`, hover background `#EEE9FF` with text `#5936E8`.
- **Destructive:** Surface `#FEF2F2`, border `#FECACA`, text `#EF4444`. On active: `#EF4444` background with `#FFFFFF` text.

### Chips & Semantic Badges
- **Rule ID Chip:** Monospace tag (`JetBrains Mono`), `#F1F5F9` background, `#101A35` text, 1px `#E2E8F0` border.
- **Violation Badge:** `#FEF2F2` background, `#EF4444` text, 4px inner dot indicator.
- **Compliance Badge:** `#ECFDF5` background, `#10B981` text, checkmark icon prefix.
- **AI Suggested Fix Badge:** `#EEE9FF` background, `#5936E8` text, sparkle icon prefix.

### Data Cards & Inspection Tiles
- Base white container with 1px `#E4E8F0` perimeter border and 12px outer radius.
- Padding structured strictly at 24px (`space-lg`) on desktop, 16px (`space-md`) on mobile.
- Context headers feature an uppercase `label-meta` subtitle paired with a semi-bold action title and contextual action trigger.

### Form Inputs & Select Fields
- Height: 40px standard.
- Background: `#FFFFFF` with 1px border `#E4E8F0`.
- Active / Focus: Border changes to `#5936E8` with a 3px outer glow ring of `rgba(89, 54, 232, 0.15)`.
- Icon alignment: 16px Lucide outline icons set to secondary text `#64708A`.

### Lists & Audit Rows
- Alternating hover state with 150ms ease to `#F7F8FC`.
- Left-edge 3px indicator line showing rule severity: Green (passed), Amber (warning), Red (violation).