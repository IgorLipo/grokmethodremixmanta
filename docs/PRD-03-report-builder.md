# PRD-03: Report Builder

## Problem
Finance teams spend hours manually assembling reports in spreadsheets. They copy data from multiple sources, format it consistently, and export to PDF for stakeholders. This process is error-prone, time-consuming, and hard to replicate for recurring reports.

## Success Criteria
- Users can assemble a financial report in under 5 minutes
- Reports auto-save so work is never lost
- Generated reports are professional-quality PDFs
- Users can create templates for recurring reports

## Screens & Flows

### Report Builder (`/reports/new` or `/reports/{id}/edit`)

**Layout (2-panel):**

**Left Panel - Data Modules Sidebar (280px fixed):**
- Search input to filter modules
- Collapsible categories:
  - **Financial Metrics**: Revenue, Expenses, Profit, Cash Flow
  - **Departmental**: Engineering, Marketing, Sales, Operations
  - **Comparative**: YoY Comparison, Budget vs Actual, Forecast
  - **Visualizations**: Bar Chart, Line Chart, Pie Chart, Table
- Each module is a draggable card with icon and label
- Drag handle on left side

**Right Panel - Report Canvas:**
- Top toolbar:
  - Report title (editable inline)
  - Period selector dropdown (Q1, Q2, Q3, Q4, Custom)
  - Preview button
  - Export dropdown (PDF, CSV, Excel)
  - Save button (with autosave indicator)
  - Share button

- Canvas area:
  - Drop zone with dashed border when empty
  - "Drag modules here to build your report"
  - Dropped modules stack vertically
  - Each module has:
    - Drag handle (reorder)
    - Settings gear (configure)
    - Delete X button
    - Collapsed/expanded toggle

- Module configuration modal:
  - Date range picker
  - Department filter (multi-select)
  - Display options (chart type, table format)
  - Compare to previous period toggle

**Interactions:**
- Drag module from sidebar → shows ghost element → drop on canvas
- Drag module within canvas → reorder with animation
- Click module settings → opens configuration modal
- Click Preview → opens preview modal with live rendering
- Save → shows "Saved" toast, updates autosave timestamp
- Export PDF → generates PDF, shows download progress, auto-downloads

**States:**

*Loading:*
- Canvas shows skeleton blocks
- Sidebar modules load progressively
- "Loading report..." indicator

*Empty:*
- First-time user sees onboarding tooltip
- Canvas shows "Start by dragging a module from the left"
- Suggested modules highlighted

*Error:*
- Module fails to load → shows error state within module
- "Retry" button within module
- Export fails → error toast with retry option
- Autosave fails → warning banner "Changes not saved"

*Saving:*
- Subtle "Saving..." text near title
- Checkmark appears when saved
- Debounced autosave (2 second delay after changes)

**Mobile (390px):**
- Sidebar becomes bottom sheet (swipe up to access)
- Canvas is full width
- Modules are simplified (fewer configuration options)
- Export options in header menu
- Touch-friendly drag handles

### Report Templates (`/reports/templates`)

**Layout:**
- Grid of template cards
- Each card shows:
  - Template name
  - Preview thumbnail
  - "Use Template" button
  - Edit/Delete buttons (for user-created)

**Pre-built Templates:**
1. Monthly Financial Summary
2. Quarterly Board Report
3. Department Budget Review
4. Cash Flow Analysis

### Report Preview Modal

**Layout:**
- Full-screen overlay
- Report rendered as it will appear in PDF
- Page navigation (if multi-page)
- Zoom controls
- Close button
- "Export" and "Edit" buttons

## Data

### Tables

**reports**
```sql
id: uuid PK
user_id: uuid FK → auth.users
title: text NOT NULL DEFAULT 'Untitled Report'
period: text (e.g., 'Q3-2024')
modules: jsonb NOT NULL DEFAULT '[]'
is_template: boolean DEFAULT false
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
```

**modules jsonb structure:**
```json
[
  {
    "id": "uuid",
    "type": "revenue_chart",
    "order": 0,
    "config": {
      "date_range": { "start": "2024-07-01", "end": "2024-09-30" },
      "departments": ["all"],
      "chart_type": "bar",
      "compare_previous": true
    }
  }
]
```

**report_exports**
```sql
id: uuid PK
report_id: uuid FK → reports
format: text ('pdf', 'csv', 'xlsx')
file_url: text
generated_at: timestamptz DEFAULT now()
generated_by: uuid FK → auth.users
```

### Access Rules (RLS)

- Users can CRUD their own reports
- Managers can view reports from their department
- Admins can view/edit all reports
- Templates (is_template=true) are readable by all authenticated users

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User closes browser mid-edit | Autosave recovers work on next visit |
| Module data unavailable | Show "Data unavailable" placeholder in module |
| Very long report (20+ modules) | Virtualized scrolling, lazy-load module data |
| Export times out | Show progress, allow background processing with notification |
| Conflicting edits (same report, 2 tabs) | Last write wins, show warning if stale |
| Invalid date range selected | Disable "Apply" button, show validation error |

## Technical Notes

- **Drag & Drop**: @dnd-kit/core for accessible, performant DnD
- **PDF Generation**: Server-side via Puppeteer or similar (Edge Function)
- **Autosave**: Debounced 2s after changes, uses PATCH endpoint
- **State Management**: React Query for server state, local state for canvas
- **Module Registry**: Extensible pattern for adding new module types

## Out of Scope (v2+)

- Collaborative editing (multiple users same report)
- Scheduled report generation and email delivery
- Custom branding (logo, colors) on exports
- Version history and rollback
- Comments on report sections

## Acceptance Checklist

- [ ] Drag and drop works with mouse and keyboard
- [ ] Autosave triggers after 2 seconds of inactivity
- [ ] "Saving..." indicator appears during save
- [ ] Preview modal shows accurate representation
- [ ] PDF export generates and downloads
- [ ] CSV export includes all tabular data
- [ ] Mobile users can access modules via bottom sheet
- [ ] Empty state guides users to start
- [ ] Error in one module doesn't break entire report
- [ ] Loading state shows skeletons matching layout
- [ ] Report title is editable inline
- [ ] Keyboard users can reorder modules
