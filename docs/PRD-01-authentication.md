# PRD-01: Authentication & User Roles

## Problem
Finance teams need secure access to sensitive financial data. Without authentication, anyone with the URL could view company financials. Without roles, we can't differentiate between who can view vs. who can approve budgets or generate reports.

## Success Criteria
- Users can sign up and log in with email/password
- Users are assigned roles (Admin, Manager, Contributor)
- Access to features is restricted based on role
- Users see only data relevant to their permissions

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: manage users, approve budgets, delete records, access all reports |
| **Manager** | View all data, approve team budgets, export reports, manage own team |
| **Contributor** | View assigned department data, submit expense reports, view (not edit) budgets |

## Screens & Flows

### Login Screen (`/login`)

**Layout:**
- Centered card (max-width 400px)
- FinancePulse logo at top
- Email input field
- Password input field
- "Sign In" primary button
- "Forgot Password?" link
- "Don't have an account? Contact Admin" text

**Interactions:**
- Submit form → validate fields → call auth API → redirect to dashboard
- Invalid credentials → show error toast, shake form subtly
- "Forgot Password" → navigate to `/forgot-password`

**States:**
- Loading: Button shows spinner, inputs disabled
- Error: Red border on invalid fields, error message below
- Empty: Default state with placeholder text

**Mobile (390px):**
- Full-width card with 16px horizontal padding
- Inputs stack vertically
- Touch-friendly button height (48px min)

### Protected Route Wrapper

**Behavior:**
- Check auth state on mount
- If no session → redirect to `/login`
- If session but wrong role for route → redirect to `/unauthorized`
- Show loading skeleton during auth check

## Data

### Tables

**profiles** (extends auth.users)
```sql
id: uuid (FK to auth.users, PK)
full_name: text NOT NULL
avatar_url: text
department: text
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
```

**user_roles**
```sql
id: uuid (PK, default gen_random_uuid())
user_id: uuid (FK to auth.users, ON DELETE CASCADE)
role: app_role ENUM ('admin', 'manager', 'contributor')
UNIQUE (user_id, role)
```

### Access Rules (RLS)

- Users can read their own profile
- Admins can read/write all profiles
- Roles table: read via security definer function only
- New users get 'contributor' role by default via trigger

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Session expires mid-use | Show "Session expired" modal, redirect to login |
| User deleted while logged in | Auth state change triggers logout |
| Multiple tabs open | Sync auth state across tabs |
| Admin demotes themselves | Prevent last admin from losing admin role |
| Email not verified | Show verification prompt before dashboard access |

## Technical Notes

- **Auth Provider**: Lovable Cloud (Supabase Auth)
- **Session Storage**: Secure cookies via Supabase client
- **Password Requirements**: Min 8 chars, 1 uppercase, 1 number
- **Rate Limiting**: 5 failed attempts → 15 min lockout
- **MFA**: Out of scope for v1, design for future addition

## Out of Scope (v2+)

- Google/SSO OAuth providers
- Multi-factor authentication
- Password complexity meter
- User invitation flow (admin-created accounts)
- Session management (view/revoke active sessions)

## Acceptance Checklist

- [ ] Login form submits on Enter key
- [ ] Loading spinner during authentication
- [ ] Error messages are user-friendly (not technical)
- [ ] Works on mobile (390px)
- [ ] Tab navigation through form fields
- [ ] Password field has show/hide toggle
- [ ] Protected routes redirect unauthenticated users
- [ ] Role-based route protection works
- [ ] Session persists across page refreshes
