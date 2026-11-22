# ResolveDesk — Complete UI Rebuild Plan

## Design Philosophy
- **60% Brand (Deep Teal #175)** — Surfaces, structure, text
- **30% Secondary (Warm Stone #60)** — Supporting, hover states
- **10% Accent (Electric Coral #25)** — Primary CTA only
- **No flat dark themes** — Use lighter surfaces for depth
- **No status eyebrows, background blurs, high-contrast borders, emojis, italic headings, monospace headings, 0-prefixed numbers, lucide icons with backgrounds, heavy font weights, navbar theme toggles**
- **Animation principles**: exaggeration, origin awareness, staggering, squash & stretch, Fitts's law, slow-in-slow-out, Hick's law, arcs, von Restorff effect, interruptible motion, secondary action, solid drawing, peak-end rule

## Animation Specs
- Scale from 0.97 on press
- Shake on error
- Directional slides (enter from trigger)
- Interpolate size for smooth opens
- Transform, not left/top
- Turn off transitions during theme switch
- Rubber banding on scroll
- Ease-out for entrances, dropdowns 150-250ms
- Stagger lists by 30ms per row
- Stretch moving knobs 12%
- Stage details as they settle
- Arcs for object movement
- Exit 20% shorter than entry
- No bounce on everyday UI
- Only animate things that matter

## Landing Page - Scroll-Driven Sections
Hero → Trust Marquee → 3-Step Feature (Connect/Organize/Resolve) → Pricing → CTA → Footer
**Inner scroll section**: After "How it Works" scrolls into view, page scroll pauses → inner carousel scrolls through features → after last feature, resume page scroll

## New Architecture

### 1. Design System (`/src/design-system/`)
```
tokens/
  colors.css          # OKLCH palette, semantic tokens
  spacing.css         # Fluid spacing scale
  typography.css      # Fluid type scale, font stacks
  shadows.css         # Layered shadows
  radius.css          # Nested radius formula
  motion.css          # Easings, durations, spring configs
  breakpoints.css     # Container queries

primitives/
  Box.jsx             # Layout primitive
  Flex.jsx            # Flex primitive
  Grid.jsx            # Grid primitive
  Text.jsx            # Typography primitive
  Layer.jsx           # Elevation/z-index
  VisuallyHidden.jsx  # A11y

components/
  Button.jsx          # CTA, secondary, ghost, danger
  Input.jsx           # Text, textarea, select
  Card.jsx            # Surface, elevated, interactive
  Badge.jsx           # Status, neutral, accent
  Avatar.jsx          # With status indicator
  Tooltip.jsx         # CSS-only + motion
  Dropdown.jsx        # Portal, keyboard nav
  Modal.jsx           # Backdrop, focus trap
  Tabs.jsx            # Animated indicator
  Table.jsx           # Virtualized, sortable
  Skeleton.jsx        # Shimmer, per-component
  Toast.jsx           # Stack, undo, progress
  Slider.jsx          # Range, discrete
  Switch.jsx          # Toggle
  RadioGroup.jsx      # Options
  Checkbox.jsx        # Single/multi
  Progress.jsx        # Linear, circular
  Separator.jsx       # Horizontal/vertical
  Accordion.jsx       # Animated height
  Dialog.jsx          # Confirm, form
  Popover.jsx         # Anchored
  Select.jsx          # Searchable, grouped
  Textarea.jsx        # Auto-resize
  Slider.jsx          # Range input
```

### 2. Layout System (`/src/layouts/`)
```
AppShell.jsx          # Main app layout (sidebar + header + main)
AuthShell.jsx         # Centered auth container
LandingShell.jsx      # Full-page sections
PageHeader.jsx        # Title, actions, breadcrumbs
Section.jsx           # Consistent section spacing
Container.jsx         # Max-width, fluid padding
```

### 3. Pages (`/src/pages/`)
```
LandingPage.jsx       # Scroll-driven, professional
LoginPage.jsx         # Clerk + custom onboarding
DashboardPage.jsx     # Stats, charts, recent
InboxPage.jsx         # Virtualized list, filters
ComplaintDetailPage.jsx  # Thread, actions, sidebar
TeamPage.jsx          # Members, roles, invites
BotsPage.jsx          # Bot cards, status, actions
BillingPage.jsx       # Tier cards, usage, comparison
SettingsPage.jsx      # Sections: account, notifications, appearance, security
ProfilePage.jsx       # Avatar, info, preferences
```

### 4. Features (`/src/features/`)
```
dashboard/
  StatsGrid.jsx
  VolumeChart.jsx
  ResolutionGauge.jsx
  BotDistribution.jsx
  RecentComplaints.jsx

inbox/
  Toolbar.jsx
  ComplaintList.jsx
  ComplaintRow.jsx
  FilterPanel.jsx
  EmptyState.jsx

complaints/
  ThreadView.jsx
  MessageComposer.jsx
  StatusBadge.jsx
  PriorityIndicator.jsx
  AssignmentPicker.jsx
  CategoryTag.jsx
  SidebarActions.jsx

team/
  MemberTable.jsx
  InviteDialog.jsx
  RoleEditor.jsx
  PermissionsMatrix.jsx
  QuotaIndicator.jsx

bots/
  BotCard.jsx
  BotStatusIndicator.jsx
  ConnectBotDialog.jsx
  BotSettingsDrawer.jsx

billing/
  TierCard.jsx
  UsageMeter.jsx
  BillingToggle.jsx
  FeatureComparison.jsx
  UpgradeDialog.jsx
```

### 5. Hooks (`/src/hooks/`)
```
useReducedMotion()
useViewTransition()
useStaggeredAnimation()
useScrollDrivenAnimation()
useIntersectionObserver()
useKeyboardNavigation()
useFocusTrap()
useMediaQuery()
useLocalStorage()
useSessionStorage()
useDebounce()
useThrottle()
useClickOutside()
useOnScreen()
useAnimatePresence()
useSpring()
useMotionValue()
useScroll()
useTransform()
```

### 6. Utilities (`/src/lib/`)
```
cn.js                 # classNames merge
format.js             # Date, currency, relative time
animation.js          # Variants, spring configs
scroll.js             # Scroll-driven animation helpers
a11y.js               # Focus management, ARIA
theme.js              # Theme tokens, switching
validation.js         # Zod schemas
```

---

## Agent Assignments

### Agent 1: Design System Core
- Tokens (colors, spacing, typography, shadows, radius, motion)
- Primitive components (Box, Flex, Grid, Text, Layer)
- Base Button, Input, Card, Badge, Avatar

### Agent 2: Advanced Primitives
- Dropdown, Modal, Tabs, Table, Skeleton, Toast
- Tooltip, Select, Textarea, Switch, Checkbox, RadioGroup
- Slider, Progress, Separator, Accordion, Dialog, Popover

### Agent 3: Layout & Shells
- AppShell, AuthShell, LandingShell
- PageHeader, Section, Container
- Sidebar (desktop + mobile), Navbar

### Agent 4: Landing Page
- Hero with scroll-driven entrance
- Trust marquee
- 3-step feature section with inner scroll pause
- Pricing cards with PriceRoll
- CTA banner, footer
- Framer-inspired aesthetic

### Agent 5: Auth & Onboarding
- Login/SignUp screens (Clerk integration)
- Organization onboarding flow
- Invite code handling
- Custom Clerk styling matching design system

### Agent 6: Dashboard
- Stats grid with CountUp
- Volume chart (bar, animated)
- Resolution gauge (circular progress)
- Bot distribution (horizontal bars)
- Recent complaints list

### Agent 7: Inbox (Complaints List)
- Virtualized list
- Search, filter, sort toolbar
- Tabbed views (Open/All)
- Complaint row with actions
- Empty states

### Agent 8: Complaint Detail
- Thread view with messages
- Composer with send animation
- Status/priority badges
- Assignment picker
- Sidebar actions drawer

### Agent 9: Team & Bots
- Member table with role editor
- Invite dialog with permissions
- Bot cards with status indicators
- Connect bot flow

### Agent 10: Billing & Settings
- Tier cards with usage meters
- Monthly/annual toggle
- Feature comparison table
- Settings sections (account, notifications, appearance, security)
- Profile page

### Agent 11: Animation & Motion
- Scroll-driven animations
- Staggered entrance system
- Page transitions
- Micro-interactions (press, hover, focus)
- Reduced motion support

### Agent 12: Integration & Polish
- Wire all pages to contexts
- API integration
- Error boundaries
- Loading states
- Accessibility audit
- Performance optimization
- Theme switching without transitions

---

## Technical Requirements

### Dependencies to Add
```json
{
  "motion": "^11.x",
  "react-router-dom": "^6.x",
  "@clerk/clerk-react": "^5.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x",
  "zod": "^3.x",
  "date-fns": "^3.x"
}
```

### Tailwind Config
- Custom OKLCH colors
- Fluid type/spacing
- Container queries
- Custom animations
- Dark mode class strategy

### CSS Variables Structure
```css
:root {
  /* Colors - OKLCH */
  --color-brand-500: oklch(0.54 0.13 175);
  --color-accent-500: oklch(0.60 0.20 25);
  --color-secondary-500: oklch(0.64 0.095 60);
  
  /* Semantic */
  --color-bg: var(--surface-0);
  --color-fg: var(--text-primary);
  --color-muted: var(--text-secondary);
  --color-border: var(--border-default);
  
  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  
  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
}
```

---

## File Structure After Rebuild

```
frontend/src/
├── design-system/
│   ├── tokens/
│   │   ├── colors.css
│   │   ├── spacing.css
│   │   ├── typography.css
│   │   ├── shadows.css
│   │   ├── radius.css
│   │   ├── motion.css
│   │   └── index.css
│   ├── primitives/
│   │   ├── Box.jsx
│   │   ├── Flex.jsx
│   │   ├── Grid.jsx
│   │   ├── Text.jsx
│   │   ├── Layer.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Textarea.jsx
│   │   ├── Select.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   ├── Tooltip.jsx
│   │   ├── Dropdown.jsx
│   │   ├── Modal.jsx
│   │   ├── Tabs.jsx
│   │   ├── Table.jsx
│   │   ├── Skeleton.jsx
│   │   ├── Toast.jsx
│   │   ├── Switch.jsx
│   │   ├── Checkbox.jsx
│   │   ├── RadioGroup.jsx
│   │   ├── Progress.jsx
│   │   ├── Separator.jsx
│   │   ├── Accordion.jsx
│   │   ├── Dialog.jsx
│   │   ├── Popover.jsx
│   │   └── index.js
│   ├── components/
│   │   ├── StatCard.jsx
│   │   ├── VolumeChart.jsx
│   │   ├── ResolutionGauge.jsx
│   │   ├── BotDistribution.jsx
│   │   ├── TierCard.jsx
│   │   ├── UsageMeter.jsx
│   │   ├── BillingToggle.jsx
│   │   ├── FeatureComparison.jsx
│   │   └── index.js
│   └── index.js
├── layouts/
│   ├── AppShell.jsx
│   ├── AuthShell.jsx
│   ├── LandingShell.jsx
│   ├── PageHeader.jsx
│   ├── Section.jsx
│   ├── Container.jsx
│   ├── Sidebar.jsx
│   └── Navbar.jsx
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── InboxPage.jsx
│   ├── ComplaintDetailPage.jsx
│   ├── TeamPage.jsx
│   ├── BotsPage.jsx
│   ├── BillingPage.jsx
│   ├── SettingsPage.jsx
│   └── ProfilePage.jsx
├── features/
│   ├── dashboard/
│   ├── inbox/
│   ├── complaints/
│   ├── team/
│   ├── bots/
│   └── billing/
├── hooks/
│   ├── useReducedMotion.js
│   ├── useViewTransition.js
│   ├── useStaggeredAnimation.js
│   ├── useScrollDrivenAnimation.js
│   ├── useIntersectionObserver.js
│   ├── useKeyboardNavigation.js
│   ├── useFocusTrap.js
│   ├── useMediaQuery.js
│   ├── useLocalStorage.js
│   ├── useSessionStorage.js
│   ├── useDebounce.js
│   ├── useThrottle.js
│   ├── useClickOutside.js
│   ├── useOnScreen.js
│   ├── useAnimatePresence.js
│   ├── useSpring.js
│   ├── useMotionValue.js
│   ├── useScroll.js
│   └── useTransform.js
├── context/
│   ├── AuthContext.jsx
│   ├── DataContext.jsx
│   └── ThemeContext.jsx
├── services/
│   ├── api.js
│   └── supabaseClient.js
├── lib/
│   ├── cn.js
│   ├── format.js
│   ├── animation.js
│   ├── scroll.js
│   ├── a11y.js
│   ├── theme.js
│   └── validation.js
├── ui/ (legacy - to be removed)
├── App.jsx
├── main.jsx
├── Root.jsx
└── index.css
```

---

## Success Criteria

1. **Visual**: No resemblance to current UI — completely fresh, professional, 21st.dev/Originkit/SpellUI quality
2. **Animation**: All 12 principles implemented, 60fps, reduced motion respected
3. **Performance**: <100ms FCP, <200ms TTI, skeleton loading for all async
4. **Accessibility**: WCAG AA, keyboard nav, focus management, ARIA
5. **Responsive**: 320px - 1920px+, container queries
6. **Theme**: Instant switch, no flash, dark mode with depth
7. **Landing**: Scroll-driven, inner scroll pause on features section
8. **Auth**: Elevated Clerk experience matching design system
9. **Data**: All existing API contracts preserved, optimistic updates
10. **Code Quality**: TypeScript-ready, component composition, zero duplication