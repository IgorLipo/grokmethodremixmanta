# PRD-05: Notifications System

## Problem
Finance teams miss critical events: invoices become overdue, budgets exceed limits, reports need approval. Without proactive notifications, users must constantly check dashboards, leading to delayed responses and missed deadlines.

## Success Criteria
- Users receive timely alerts for actionable events
- Notifications are prioritized by urgency
- Users can customize what notifications they receive
- Historical notifications are accessible for reference

## Screens & Flows

### Notification Bell (Global Header)

**Layout:**
- Bell icon in top-right of header
- Red badge with unread count (max "99+")
- Click opens dropdown panel

**Dropdown Panel (400px width):**
- Header: "Notifications" + "Mark all read" link
- Tabs: All | Unread | Alerts
- Notification list (scrollable, max 10 visible)
- Each notification shows:
  - Icon (by type)
  - Title (bold)
  - Description (truncated)
  - Timestamp (relative: "2h ago")
  - Unread indicator (blue dot)
- "View All" link at bottom → `/notifications`

**Interactions:**
- Click notification → navigates to related item + marks read
- Hover → shows full description
- Click outside → closes panel
- "Mark all read" → confirms, clears all unread

### Notifications Page (`/notifications`)

**Layout:**
- Full list of all notifications
- Filter buttons: All, Approvals, Alerts, Updates
- Date grouping: Today, Yesterday, This Week, Earlier
- Pagination or infinite scroll

**Bulk Actions:**
- Select multiple → Mark Read, Delete
- "Clear all read notifications" button

### Notification Settings (`/settings/notifications`)

**Layout:**
- Category toggles:
  
| Category | In-App | Email |
|----------|--------|-------|
| Invoice due soon | ✓ | ✓ |
| Invoice overdue | ✓ | ✓ |
| Budget near limit (90%) | ✓ | ✓ |
| Budget exceeded | ✓ | ✓ |
| Report needs approval | ✓ | ✓ |
| Report approved | ✓ | ○ |
| Task assigned to me | ✓ | ✓ |
| Task overdue | ✓ | ✓ |
| Weekly summary | ○ | ✓ |

- "Quiet hours" toggle (e.g., no notifications 8pm-8am)
- "Digest mode" option (batch notifications into 1 email)

**States:**

*Loading:*
- Dropdown shows spinner
- Page shows skeleton list

*Empty:*
- "All caught up! No new notifications."
- Illustration of empty inbox

*Error:*
- "Couldn't load notifications. Retry?"
- Retry button

**Mobile (390px):**
- Bell icon smaller
- Panel becomes full-screen sheet
- Swipe left to dismiss/mark read
- Long press for actions

## Notification Types

| Type | Trigger | Priority | Icon |
|------|---------|----------|------|
| `invoice_due_soon` | Invoice due in 3 days | Medium | 📄 |
| `invoice_overdue` | Invoice past due date | High | 🔴 |
| `budget_warning` | Department at 90% | Medium | ⚠️ |
| `budget_exceeded` | Department over 100% | High | 🚨 |
| `approval_request` | Report submitted for approval | High | ✅ |
| `approval_complete` | Your report was approved | Low | ✓ |
| `task_assigned` | Task assigned to you | Medium | 📋 |
| `task_overdue` | Your task is overdue | High | ⏰ |
| `mention` | You were mentioned in comment | Medium | @ |

## Data

### Tables

**notifications**
```sql
id: uuid PK
user_id: uuid FK → auth.users
type: text NOT NULL
title: text NOT NULL
body: text
priority: text DEFAULT 'medium' ('low', 'medium', 'high')
is_read: boolean DEFAULT false
action_url: text (where to navigate on click)
metadata: jsonb (type-specific data)
created_at: timestamptz DEFAULT now()
read_at: timestamptz
```

**notification_preferences**
```sql
id: uuid PK
user_id: uuid FK → auth.users (UNIQUE)
preferences: jsonb NOT NULL DEFAULT '{}'
quiet_hours_enabled: boolean DEFAULT false
quiet_hours_start: time
quiet_hours_end: time
digest_mode: boolean DEFAULT false
```

**preferences jsonb structure:**
```json
{
  "invoice_due_soon": { "in_app": true, "email": true },
  "invoice_overdue": { "in_app": true, "email": true },
  "budget_warning": { "in_app": true, "email": false }
}
```

### Access Rules (RLS)

- Users can only read/update their own notifications
- Users can only read/update their own preferences
- System (service role) can create notifications for any user

## Edge Cases

| Scenario | Handling |
|----------|----------|
| 1000+ unread notifications | Show "99+", paginate list |
| Notification for deleted item | Show "This item no longer exists" |
| User has all notifications disabled | Still receive critical alerts (overdue) |
| Rapid-fire events (10 in 1 min) | Batch into single notification |
| Email bounce | Retry 3x, then disable email for that category |
| Push permission denied | Fall back to in-app only |

## Technical Notes

- **Real-time**: Supabase realtime subscription for instant updates
- **Email Delivery**: Edge function triggered by database insert
- **Batching**: Cron job (every 15 min) for digest mode
- **Badge Sync**: Badge count updated via realtime, persisted in localStorage
- **Performance**: Query with `limit` and cursor pagination

## Out of Scope (v2+)

- Push notifications (browser/mobile)
- Slack/Teams integration
- SMS notifications
- Notification templates (customizable text)
- Snooze notifications
- @mentions in comments

## Acceptance Checklist

- [ ] Bell shows accurate unread count
- [ ] Dropdown opens on click, closes on outside click
- [ ] Clicking notification navigates correctly
- [ ] "Mark all read" clears unread state
- [ ] Settings toggles persist correctly
- [ ] High-priority notifications appear at top
- [ ] Mobile swipe gestures work
- [ ] Empty state is friendly
- [ ] Loading state shows skeleton
- [ ] Real-time updates work (new notification appears)
- [ ] Email notifications respect preferences
- [ ] Quiet hours are respected
