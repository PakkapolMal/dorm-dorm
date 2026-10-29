# dorm-dorm — Design Guide

This guide sets the UX/UI rules for the prototype. Pages and flows are in [FLOW.html](FLOW.html). Product rules and numbers are in [OVERVIEW.md](OVERVIEW.md).

**Decisions:** clean UI mockup · English only · light mode only · tenant = fixed mobile layout · landlord and operator = desktop layout · tenant and landlord are built first.

**References:**
- Tenant: [Fernish](https://fernish.com/), studied at a 375 px mobile width.
- Landlord and operator: [shadcn dashboard starter](https://shadcn-dashboard.kiranism.dev/dashboard/overview), studied at desktop width.

We copy the layouts and button placement from these sites, not their branding.

---

## 1. Color tokens

These are defined once in `src/index.css` as CSS variables on `:root`. Both layouts share them. They use a warm neutral base (both references lean warm) with one brand color.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FAF8F5` | Page background (warm off-white) |
| `--surface` | `#FFFFFF` | Cards, sheets, inputs |
| `--surface-muted` | `#F3EFEA` | Image tiles, card footers, table header, selected-option panel |
| `--border` | `#E5DED6` | Card and input borders, dividers |
| `--text` | `#2B2420` | Primary text (warm near-black) |
| `--text-muted` | `#6E635A` | Secondary text, labels, captions |
| `--primary` | `#1F6F5C` | **Brand + main CTA** (deep teal-green, reads as "savings / trust") |
| `--primary-hover` | `#185A4B` | CTA hover / pressed |
| `--primary-soft` | `#E6F1EE` | Selected states, active nav item, highlight panels |
| `--on-primary` | `#FFFFFF` | Text on primary (contrast ≈ 6:1) |
| `--accent` | `#E8833A` | Small highlights only: "Popular" / "Best value" badges, cart count |
| `--accent-soft` | `#FCEBDD` | Accent badge background |
| `--on-accent-soft` | `#A34A12` | Text on accent badges (`--accent` itself is too light for text) |
| `--success` / `--success-soft` | `#27704A` / `#E3F2E8` | Active, Delivered, Refunded, "you save" |
| `--warning` / `--warning-soft` | `#8F540C` / `#FBEFD9` | Pending, Notice period, near the 1,500 cap |
| `--danger` / `--danger-soft` | `#A93226` / `#F8E1DE` | Damage fee, over cap, cancel, destructive |
| `--info` / `--info-soft` | `#2A62A0` / `#E2ECF7` | In repair, Warranty claim, informational notes |

**Color rules**
- **One primary CTA per screen.** Use `--accent` only for badges and small highlights, never for buttons.
- **Status badges** use the soft background with the strong text color of the same status (e.g. `--success-soft` behind `--success` text).
- **Prices** use `--text` in bold. **Savings** ("4,490 vs 7,500") use `--success`.

## 2. Typography

- **Font:** [Inter](https://fonts.google.com/specimen/Inter) from Google Fonts, weights 400, 500, 600 and 700, with `system-ui` as the fallback. One family for everything.
- **Numbers:** prices and KPIs use `font-variant-numeric: tabular-nums`.
- **Money format:** `1,234 THB` or `390 THB/mo`. Always comma thousands, no decimals, unit after the number.

| Style | Tenant (mobile) | Dashboard (desktop) |
|---|---|---|
| Page title | 24 / 600 | 24 / 700 (e.g. "Hi, Welcome back") |
| Section title | 18 / 600 | 16 / 600 (card title) |
| Body | 15 / 400 | 14 / 400 |
| Caption / label | 13 / 400 muted | 12–13 / 500 muted |
| Price / KPI value | 16 / 700 (card), 22 / 700 (detail) | 30 / 600 (KPI card) |

## 3. Spacing, radius, elevation

- **Spacing:** a 4 px grid, using 4 · 8 · 12 · 16 · 24 · 32 · 48. Mobile page gutter is **16 px**. Desktop content padding is **24 px**, with a **16 px** gap between cards.
- **Radius:**

  | Element | Radius |
  |---|---|
  | Tenant buttons | `999px` (pill, as on Fernish) |
  | Tenant cards and image tiles | `12px` |
  | Dashboard buttons, inputs, cards | `8px` (shadcn `--radius: .5rem`) |
  | Badges | `999px` |
- **Elevation:** keep it flat. Use a 1 px `--border` plus at most `0 1px 2px rgb(0 0 0 / .05)`. Sheets, dialogs and the sticky bottom bar get `0 8px 24px rgb(0 0 0 / .12)`.
- **Control heights:**

  | Control | Height |
  |---|---|
  | Tenant primary button, input, select | 48 px (from Fernish) |
  | Dashboard button, input | 36 px |
  | Dashboard small button | 32 px |
  | Table row | ~48 px |

---

## 4. Tenant layout: fixed mobile (from Fernish)

### App shell

On desktop the app sits in a centered phone frame: `width: 390px; min-height: 100vh; margin: 0 auto`. The `--bg` color fills the area outside the frame.

```
┌──────────────────────────────┐
│ ≡/←     dorm-dorm      🛒(2) │  Top bar 56px, sticky, white, bottom border
├──────────────────────────────┤
│                              │
│   scrollable content         │  16px gutters
│                              │
├──────────────────────────────┤
│ [ Sticky action bar ]        │  only on detail / cart / checkout
├──────────────────────────────┤
│  Shop   My Room  Bills  Help │  Bottom tab bar 64px, icons + labels
└──────────────────────────────┘
```

- **Top bar:** Fernish's pattern. The left slot holds a back arrow on inner pages. The **logo is centered**. The right slot holds the cart icon with an `--accent` count badge.
- **Bottom tab bar (deviation from Fernish):** Fernish uses a hamburger menu. We use 4 tabs (Shop · My Room · Bills · Help) because tenants come back to their subscription often. A website-style menu hides it. The active tab is `--primary` with a `--primary-soft` pill behind the icon.
- **Sticky action bar:** sits above the tab bar. It shows the running monthly total on the left and the primary pill button on the right. It is used on Item detail, Cart and Checkout.

### Page patterns

| Page (FLOW id) | Wireframe, copied from Fernish |
|---|---|
| **Landing** | Full-width hero image, then a centered headline (24/600), a one-line subcopy, and **one pill CTA centered**. Below that, a "Dorm vs Condo" comparison card (4,490 vs 7,500 THB, savings in `--success`). Then horizontal-scroll cards for "Shop bundles" (Fernish's "Shop by room"). |
| **Catalog (T1)** | Page title, then a horizontal row of **filter chips** (All · Bundles · Kitchen · Study · Air). This replaces Fernish's "Filter" button and toggle, because with 5 categories one tap beats opening a menu. **2-column product grid**: square image on `--surface-muted`, a **"+" quick-add circle button at the top-right of the image**, and a badge at the bottom-left of the image ("Best value", "Popular"). Name below in 2 lines, then a **bold `390 THB/mo`** price with a muted secondary line ("or bundle & save 90"). Bundles come first, as full-width cards spanning both columns. |
| **Item / Bundle detail (T2)** | Breadcrumb, full-width image, thumbnail strip, title. Then a **"Choose your plan" option panel** (Fernish's "Choose how you want it"): a radio list where the selected option expands on a `--primary-soft` panel with ✓ benefit lines and a select for **term (6 / 12 months)**. Below that, tabs "Details" and "What's included". The sticky bar carries the CTA "Add to cart". |
| **Cart → Checkout (T3)** | A stepper of 3 short steps: **Room → Delivery → Review**. Selects and inputs are 48 px and full width. **Fee summary card**: monthly fee, deposit, setup fee (struck through with a "Waived" badge on 12-month terms), and the total due now. The 1,500 cap warning is an inline `--warning-soft` banner. The lease and damage policy is a checkbox with a link that opens a bottom sheet. |
| **Confirmation (T4)** | Centered success icon, title, the wave date in a highlighted card, a "What happens next" numbered list, and the CTA "Go to My Room". |
| **My Room (T5)** | Status header card: dorm, room, term progress bar, next bill. A list of installed items as rows (thumbnail, name, status badge). An **actions list** (Fernish's accordion rows with a chevron): Report an issue · Leave early · Buy out items · Contract. |
| **Report issue (T6) / Leave early (T7)** | Single-column forms. The issue type and the exit pathway use **large selectable cards**, the same pattern as the plan option panel. The fee is calculated live in the sticky bar. |
| **Bills (T9)** | A list of monthly invoice cards. Tapping one opens an invoice with line items: Rent, Water, Electricity, **dorm-dorm add-on** (highlighted). |
| **Takeover (T10)** | Like detail: the items already in the room, a "Setup fee waived" badge, and the CTA "Take over subscription". |

### Tenant components

- **Button primary:** pill, 48 px tall, full width inside forms, `--primary` background, 16/600 text.
- **Button secondary:** pill outline, 1 px `--border`, `--text`.
- **Text link:** underlined `--primary`. Fernish uses "View item details" this way.
- **Option card:** 1 px border, 12 px radius, radio on the left. When selected it gets a `--primary` border and a `--primary-soft` background.
- **Badge:** pill, 12/600, soft background with strong text. On images it sits bottom-left.
- **Bottom sheet:** for policy text and confirmations. It replaces desktop dialogs on mobile.
- **Accordion row:** label on the left, chevron on the right, divider between rows. Fernish's footer uses this.

---

## 5. Landlord and operator layout: desktop (from the shadcn dashboard)

### App shell

```
┌────────────┬──────────────────────────────────────────────────────┐
│ ◼ dorm-dorm│ [⊟] Dashboard / Rooms            [Search… ⌘K]   🔔3  │ Header 56px
│  Landlord ▾│──────────────────────────────────────────────────────│
│            │ Rooms                                   [+ Add room] │ Page header
│ OVERVIEW   │ Manage rooms and add-on status                       │
│ ▣ Dashboard│                                                      │
│ ▢ Rooms    │ [Search rooms…] [⊕ Status] [⊕ Floor]        [View ▾] │ Table toolbar
│ ▢ Invoices │ ┌──────────────────────────────────────────────────┐ │
│            │ │ ROOM  TENANT   STATUS     ADD-ONS   MONTHLY   ⋮  │ │
│ ACCOUNT    │ │ ...                                              │ │
│ ▢ Settings │ └──────────────────────────────────────────────────┘ │
│            │ 0 of 24 selected     Rows per page [10▾]  Page 1 of 3 │
│ (●) User ▾ │                                                      │
└────────────┴──────────────────────────────────────────────────────┘
```

- **Sidebar:** 256 px wide, collapsible to a 48 px icon rail (the toggle sits in the header). The top shows the logo and a **role / property switcher** (the reference's org switcher). Nav groups have small uppercase muted labels ("Overview", "Operations"). The active item has a `--primary-soft` background. A user card sits at the bottom. The sidebar uses `--surface-muted` and the content area uses `--bg`.
- **Header:** sidebar toggle, then a divider, then **breadcrumbs** on the left. Search with a `⌘K` hint and a notifications bell with a count badge on the right. Skip the theme toggle, since the app is light only.
- **Page header:** title (24/700) with a muted description underneath. The **primary action button sits at the top right** ("+ Add New" in the reference).

### Page patterns

| Pattern (reference page) | Used for |
|---|---|
| **KPI cards** (Overview): a row of 4. Each has a muted label at the top-left and a **trend badge at the top-right** (outline pill, "↗ +12.5%"), a large value, and a **muted footer band** with a bold one-line insight and a muted caption. | L1: Upgraded rooms · Add-on revenue · **Your 15% share** · Pre-upgraded vacant. O1: Active subs · Next wave orders · Open tickets · Pending exits |
| **Chart card + list card** (Overview: area chart and "Recent Sales"). The list rows have an avatar, a name with a muted sub-line, and an amount right-aligned. | L1: revenue-share trend (6 months) and "Recent activity". O1: subscriptions trend and "Upcoming wave". |
| **Data table** (Products): toolbar with search and **faceted filter buttons** (dashed outline "⊕ Category") on the left and a "View" columns menu on the right. Uppercase muted column headers, a small thumbnail in the first column, a category as an outline badge, and a **⋮ row-action menu** in the last column. The footer has the selected count on the left and rows-per-page with pager arrows on the right. | L2 Rooms, L4 Invoices, O2 Orders, O3 Assets, O5 Exit requests, O6 Partners |
| **Sheet form** (Sheet & Dialog): a right-side drawer for create/edit, with the submit button in the sheet footer. | Room detail / check-out inspection (L3), Process exit (O5), Assign to wave (O2) |
| **Dialog**: a small centered modal. | Confirm actions: "Mark delivered", "Approve damage fee", "Refund deposit" |
| **Multi-step form**: "Step 1 of 3", labeled fields with a red `*` for required, Previous/Next at the bottom. | Check-out inspection (Items → Damage → Deposit settlement) |
| **Kanban** (Kanban): columns with a count chip, cards showing a title, a priority badge at the top-right, and a muted meta line with the date. | O4 Issue tickets: **New → Triage → Warranty claim / Damage fee → Resolved** |
| **Toasts**: bottom-right. Variants: success, error, warning, info. | Feedback after every action ("Room 304 marked pre-upgraded") |

### Room / asset status badges

| Status | Color |
|---|---|
| Active | success |
| Pre-upgraded (vacant) | info |
| No add-on | neutral outline |
| Notice period | warning |
| In repair | info |
| Damage | danger |
| Retired | neutral muted |

### Dashboard components

- **Button primary:** 36 px tall, 8 px radius, `--primary` background, 14/500 text, optional leading icon ("+ Add New").
- **Button outline / ghost:** used for the toolbar and secondary actions. **Faceted filter:** dashed outline.
- **Input:** 36 px, white, 1 px `--border`, with a `--primary` focus ring.
- **Card:** `--surface` background, 1 px border, 8 px radius, 24 px padding. The KPI footer band uses `--surface-muted`.

---

## 6. Shared rules

- **Icons:** [Lucide](https://lucide.dev), the icon set shadcn uses. 20 px on mobile, 16 px on desktop, 1.75 stroke.
- **Images:** product photos sit on `--surface-muted` tiles with object-fit `contain`. Placeholders are fine for the mockup.
- **Empty states:** an icon, a one-line explanation and one action. Example: "No add-ons yet" with "Browse catalog".
- **Accessibility basics:**
  - Text contrast is at least 4.5:1. Every text/background pair above passes, including status text on its soft background. Never use `--accent` as a text color.
  - Focus rings are visible.
  - Tap targets are at least 44 px on mobile.
- **Brand name:** the capitalization is not decided. Render the name from one constant so it can be changed in one place.
- **Implementation:** plain CSS with the tokens above. No UI library for now. Shadcn would bring Tailwind and Radix along with it, so only add it if building tables and sheets by hand becomes slow.
