# PRD-04: Productivity Tracker

## Problem
Finance teams struggle to track reporting cycle progress. Month-end close, quarterly reports, and audit preparation involve dozens of tasks across multiple team members. Without visibility, tasks slip through cracks, deadlines are missed, and managers can't identify bottlenecks.

## Success Criteria
- Teams can see all reporting cycle tasks in one view
- Overdue tasks are immediately visible
- Managers can assign and reassign tasks
- Completion rates are tracked and reported

## Screens & Flows

### Productivity Overview (`/productivity`)

**Layout:**

**Header:**
- Page title: "Productivity Tracker"
- Period selector: "October 2024 Close" dropdown
- View toggle: Timeline | List | Board
- "Add Task" button

**Timeline View (default):**
- Horizontal timeline with dates
- Today marker (red vertical line)
- Task bars showing:
  - Task name
  - Assignee avatar
  - Status color (green=done, yellow=in progress, red=overdue, gray=not started)
- Zoom controls (Week/Month/Quarter view)

**Task rows grouped by:**
- Phase (Preparation, Execution, Review, Filing)
- Or Department (toggle in header)

**Right Sidebar (on task click):**
- Task detail panel (360px)
- Task name (editable)
- Status dropdown
- Assignee dropdown
- Due date picker
- Description textarea
- Checklist items
- Notes/comments section
- Activity log

**Interactions:**
- Click task bar → opens sidebar with details
- Drag task bar horizontally → changes due date
- Click assignee → opens quick-assign dropdown
- Click status → opens status dropdown
- Double-click task name → inline edit

**States:**

*Loading:*
- Timeline skeleton with placeholder bars
- Sidebar shows loading spinner
- "Loading tasks..." text

*Empty:*
- No tasks for selected period
- "No tasks yet. Create your first task to track progress."
- "Add Task" prominent button
- Link to "Use Template" (pre-built reporting cycle)

*Error:*
- Banner: "Failed to load tasks. Retry?"
- Retry button
- Last successful data timestamp

**Mobile (390px):**
- List view only (timeline too complex)
- Swipe right on task → quick actions (complete, reassign)
- Tap task → full-screen detail sheet
- Floating "Add Task" button

### List View

**Layout:**
- Filterable table
- Columns: Task, Assignee, Due Date, Status, Progress
- Sortable by any column
- Bulk selection checkboxes
- Bulk actions: Mark Complete, Reassign, Delete

### Board View (Kanban)

**Layout:**
- Columns: Not Started | In Progress | In Review | Complete
- Cards show task name, assignee, due date
- Drag cards between columns
- WIP limits shown (e.g., "3/5 in progress")

### Task Templates (`/productivity/templates`)

**Pre-built templates:**
1. Monthly Close Checklist (25 tasks)
2. Quarterly Report Prep (40 tasks)
3. Annual Audit Preparation (60 tasks)
4. Budget Planning Cycle (30 tasks)

**Template application:**
- Select template → confirm period → creates all tasks with relative dates

## Data

### Tables

**reporting_cycles**
```sql
id: uuid PK
name: text NOT NULL (e.g., "October 2024 Close")
start_date: date NOT NULL
end_date: date NOT NULL
status: text DEFAULT 'active' ('active', 'completed', 'archived')
created_by: uuid FK → auth.users
created_at: timestamptz DEFAULT now()
```

**tasks**
```sql
id: uuid PK
cycle_id: uuid FK → reporting_cycles
title: text NOT NULL
description: text
phase: text ('preparation', 'execution', 'review', 'filing')
assignee_id: uuid FK → auth.users
due_date: date NOT NULL
status: text DEFAULT 'not_started' ('not_started', 'in_progress', 'in_review', 'complete')
order_index: int
parent_task_id: uuid FK → tasks (for subtasks)
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
completed_at: timestamptz
```

**task_checklists**
```sql
id: uuid PK
task_id: uuid FK → tasks
item: text NOT NULL
is_complete: boolean DEFAULT false
order_index: int
```

**task_comments**
```sql
id: uuid PK
task_id: uuid FK → tasks
user_id: uuid FK → auth.users
content: text NOT NULL
created_at: timestamptz DEFAULT now()
```

### Access Rules (RLS)

- Contributors: View all tasks, edit tasks assigned to them
- Managers: CRUD all tasks in their department
- Admins: CRUD all tasks globally

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Task overdue by 30+ days | Escalate visually (bold red), notify manager |
| Assignee leaves company | Task becomes unassigned, alert manager |
| Circular dependency (task A → B → A) | Prevent in UI, validate on save |
| 100+ tasks in cycle | Virtual scrolling, lazy-load task details |
| Reassign during task in progress | Preserve status, log reassignment |
| Due date in past when created | Warning: "Due date is in the past" |

## Technical Notes

- **Timeline Rendering**: Custom canvas or SVG for performance
- **Real-time Updates**: Supabase realtime for multi-user editing
- **Drag & Drop**: @dnd-kit for accessible reordering
- **Date Calculations**: date-fns for all date operations
- **Notifications**: Trigger on overdue, assignment change

## Out of Scope (v2+)

- Task dependencies (must complete A before B)
- Time tracking per task
- Recurring tasks (auto-create next cycle)
- External calendar sync (Google Calendar)
- Gantt chart with dependencies
- AI task suggestions based on history

## Acceptance Checklist

- [ ] Timeline renders tasks at correct positions
- [ ] Overdue tasks show red indicator
- [ ] Task click opens detail sidebar
- [ ] Assignee can be changed via dropdown
- [ ] Status changes persist immediately
- [ ] Due date can be dragged on timeline
- [ ] Mobile list view is usable
- [ ] Template creates tasks with correct relative dates
- [ ] Bulk actions work on selected tasks
- [ ] Empty state shows helpful guidance
- [ ] Loading skeleton matches final layout
- [ ] Real-time updates when teammate changes task
