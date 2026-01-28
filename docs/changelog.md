# Finance Pulse - Changelog

## [Phase 2] - January 2026

### Added
- **Report Builder** (`src/pages/ReportBuilder.tsx`)
  - Full drag-and-drop interface using @dnd-kit
  - Module sidebar with collapsible categories
  - Report canvas with sortable module cards
  - Toolbar with title editing, period selector, preview/save/export actions

- **Report Components** (`src/components/reports/`)
  - `ModuleSidebar.tsx` - Draggable module palette with 3 categories
  - `ReportCanvas.tsx` - Drop zone with sortable module cards
  - `ReportToolbar.tsx` - Report header controls
  - `ModuleConfigModal.tsx` - Per-module configuration options
  - `ReportPreviewModal.tsx` - Simulated PDF preview

- **Reports Page** (`src/pages/Reports.tsx`)
  - Template quick-start cards
  - Empty state for saved reports

- **Templates Page** (`src/pages/ReportTemplates.tsx`)
  - Full template browsing with module listings
  - "Use Template" buttons

- **Report Data** (`src/data/mockReports.ts`)
  - 10 available modules across 3 categories
  - 3 demo templates
  - Period options and helper functions

- **Report Builder Hook** (`src/hooks/useReportBuilder.ts`)
  - Full state management for report building
  - Module add/remove/reorder/configure

### Dependencies Added
- `@dnd-kit/core` - Drag and drop core
- `@dnd-kit/sortable` - Sortable lists
- `@dnd-kit/utilities` - CSS utilities

### Technical Notes
- Modules have 4 types: chart, table, metric, text
- Config modal shows type-specific options
- Preview shows simulated report output
- Mobile shows "use desktop" message (touch D&D complex)

---

## [Phase 1] - January 2026

### Added
- **App Shell with Sidebar Navigation** (`src/components/layout/AppShell.tsx`)
  - Collapsible desktop sidebar with logo and nav items
  - Mobile hamburger menu with slide-down navigation
  - Active route highlighting
  - Responsive: sidebar at 1024px+, header menu below

- **All Page Routes** (placeholders)
  - `/reports` - Reports list page
  - `/reports/new` and `/reports/:id` - Report builder page
  - `/productivity` - Productivity tracker page
  - `/notifications` - Notifications page
  - `/settings` and `/settings/:tab` - Settings pages
  - `/ai` - AI Summarizer page
  - All placeholders show "Coming in Phase X" messaging

- **Mock Data Extraction** (`src/data/mockDashboard.ts`)
  - Extracted dashboard metrics from inline data
  - Structured exports: `dashboardMetrics`, `departments`, `transactions`, `invoices`, `cashFlowData`, `spendMixData`, `teamActivities`
  - Type definitions for department status

- **Updated Sources of Truth** (`docs/sources-of-truth.md`)
  - Created new documentation file
  - Documented all routes, navigation items, data files, component directories

### Changed
- `src/App.tsx` - Added all routes with AppShell wrapper
- `src/pages/Index.tsx` - Now imports from mock data file

### Technical Notes
- Sidebar width: 256px expanded, 64px collapsed
- Mobile breakpoint: 1024px (lg:)
- Animation: fade-in on route content

---

## [Initial] - January 2026

### Added
- Dashboard UI components (Hero, KPIs, Charts, Activity)
- Design system (slate/indigo palette, Inter font)
- PRD documentation for all 7 features
- Build estimation and task breakdown
