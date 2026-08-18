# WATAreGeese UI

## Visual Principles

WATAreGeese is a map-first product. Interfaces should feel clear, compact, and calm: neutral surfaces, subtle borders, restrained shadows, and Waterloo gold as an accent. Goose branding should appear in small details rather than dominate the screen.

## Design Tokens

Semantic tokens live in `web/src/index.css` and are exposed to Tailwind in `web/tailwind.config.js`.

Core token groups:

- Color: `background`, `surface`, `surface-raised`, `text-primary`, `text-secondary`, `border`, `primary`, `accent`, `route`, `success`, `warning`, `danger`, `focus-ring`
- Type: page title, section title, body, secondary body, label, building code
- Shape/elevation: `control`, `panel`, `sheet`, `subtle`, `panel`, `sheet`
- Motion and touch: reduced-motion support and a 44px touch target

## Responsive Model

Use three meaningful modes:

- Phone: below `sm` / 640px
- Tablet and small laptop: `sm` through below `lg` / 640-1023px
- Desktop: `lg` and above / 1024px+

The intended pattern is one shared map/content tree with responsive surfaces:

- Mobile: map fills the viewport with a bottom-sheet overlay
- Tablet: same map-first model with wider overlay spacing
- Desktop: side panel around 320-400px with map/content filling the rest

## Component Inventory

- `Button`
- `IconButton`
- `SearchInput`
- `LocationField`
- `Sheet`
- `Panel`
- `Chip`
- `Divider`
- `SectionHeader`
- `RouteMetric`
- `MapControlButton`
- `AppShell`

## Accessibility Expectations

Interactive controls should have visible focus states, keyboard-safe behavior, and approximately 44px touch targets. Icon-only actions require accessible labels. Components should accept composition props such as `className` without depending on app state, routing, campus data, or Google Maps.

## Local Showcase

`web/src/pages/DesignSystemPage.tsx` is a standalone showcase component for local visual inspection. It is intentionally not wired into the production app route yet.
