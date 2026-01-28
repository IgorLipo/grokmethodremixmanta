# PRD-02: Dashboard (Command Center)

## Problem
Finance teams lack a unified view of critical metrics. Key data is scattered across spreadsheets, accounting software, and reports. Decision-makers need instant visibility into liquidity, burn rate, budget utilization, and team activity without digging through multiple tools.

## Success Criteria
- Users see real-time KPIs at a glance within 2 seconds of loading
- Dashboard updates reflect latest data without manual refresh
- Users can quickly identify problem areas (over-budget departments, pending invoices)
- Navigation to detailed views is one click away

## Screens & Flows

### Dashboard Home (`/`)

**Layout (3-column grid on desktop):**

**Left Column (4/12):**
1. Liquidity Hero Card (dark, prominent)
   - Total liquidity amount
   - Monthly burn rate
   - Runway months
   - Action button → navigates to cash flow detail
   
2. KPI Grid (2x2)
   - ARR with trend indicator
   - Gross Margin with target comparison
   - LTV:CAC with progress bar
   - NDR with progress bar

3. Live Ledger
   - Real-time transaction feed
   - Pulsing "live" indicator
   - Last 5 transactions with vendor, category, amount

**Middle Column (5/12):**
1. Budget Utilization Panel
   - Department filter tabs (All, Engineering, Marketing, G&A)
   - Progress bars per department
   - Status labels (On Track, Near Limit, Over Budget)
   - Click department → navigate to `/budgets/{dept}`

2. Accounts Payable Card
   - Invoice count due this week
   - Top 3 pending invoices with amounts
   - Status badges (Pending, Scheduled, Overdue)
   - Click invoice → navigate to `/invoices/{id}`

**Right Column (3/12):**
1. Operating Cash Chart (dark card)
   - 6-month trailing area chart
   - Hover shows exact values
   - Trend indicator

2. Spend Mix Donut Chart
   - Category breakdown (Payroll, Software, Other)
   - Center shows fixed cost percentage
   - Legend with percentages

3. Team Activity Feed
   - Recent audit actions
   - User avatar/initials, action description, timestamp
   - Click → navigate to `/activity`

**Interactions:**
- Department filter buttons toggle data in Budget Utilization
- Hover on charts shows tooltips with values
- Click on any card navigates to detailed view
- Pull-to-refresh on mobile

**States:**

*Loading:*
- Skeleton placeholders matching component shapes
- Charts show empty state with subtle animation
- "Loading financial data..." text

*Empty:*
- New account with no data
- Show onboarding prompt: "Add your first invoice to get started"
- CTA button to Add Invoice

*Error:*
- Red alert banner at top
- "Failed to load dashboard. Retry?" with retry button
- Individual cards can fail independently (partial loading)

**Mobile (390px):**
- Single column layout
- Collapsible sections (KPI grid → horizontal scroll)
- Liquidity Hero Card full width
- Charts stack vertically
- Sticky header with period selector
- Bottom navigation bar

## Data

### API Endpoints

**GET /api/dashboard/metrics**
Returns aggregated KPIs:
```json
{
  "liquidity": { "total": 4285102, "burn": 324000, "runway_months": 18 },
  "arr": { "value": 12500000, "change_pct": 12.4 },
  "gross_margin": { "value": 78.2, "target": 80 },
  "ltv_cac": { "value": 4.1, "progress": 82 },
  "ndr": { "value": 114, "progress": 100 }
}
```

**GET /api/dashboard/budgets**
Returns department budget utilization:
```json
{
  "departments": [
    { "id": "eng", "name": "Engineering", "spent": 142000, "budget": 155000, "utilization": 92, "status": "near-limit" }
  ]
}
```

**GET /api/dashboard/transactions?limit=5**
Returns recent transactions for live ledger.

**GET /api/dashboard/payables?due_within=7**
Returns invoices due within 7 days.

### Tables Referenced

- `transactions` - for Live Ledger
- `invoices` - for Accounts Payable
- `budgets` - for Budget Utilization
- `activity_log` - for Team Activity

## Edge Cases

| Scenario | Handling |
|----------|----------|
| No transactions yet | Show "No recent transactions" with link to add |
| All departments on-budget | Show success state, green indicators |
| Very large numbers ($1B+) | Format as $1.2B with abbreviation |
| Negative cash flow | Show warning icon, red text |
| Stale data (>5 min old) | Show "Last updated X min ago" badge |
| Chart data missing months | Interpolate or show gaps with explanation |

## Technical Notes

- **Caching**: Dashboard data cached for 60 seconds
- **Real-time**: Live Ledger uses Supabase realtime subscriptions
- **Charts**: Recharts library for responsive, accessible charts
- **Polling**: Fallback polling every 30s if realtime fails
- **Performance**: Lazy load right column below the fold

## Out of Scope (v2+)

- Customizable dashboard widgets
- Date range selector (currently fixed to current period)
- Export dashboard as PDF
- Dashboard sharing via link
- Custom KPI definitions

## Acceptance Checklist

- [ ] All KPI cards show real data from API
- [ ] Charts render without layout shift
- [ ] Loading skeletons match final layout
- [ ] Error state shows retry button that works
- [ ] Mobile layout is usable at 390px
- [ ] Tab navigation works through interactive elements
- [ ] Screen reader announces KPI values
- [ ] Empty states have clear CTAs
- [ ] Department filters update Budget Utilization
- [ ] Live Ledger shows pulsing indicator when connected
