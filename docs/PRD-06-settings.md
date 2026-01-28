# PRD-06: Settings & Preferences

## Problem
Users need to customize their Finance Pulse experience: update their profile, configure export defaults, manage team members (admins), and set up scheduled automations. Without a centralized settings area, these tasks are scattered or impossible.

## Success Criteria
- Users can update their profile and preferences
- Admins can manage team members and roles
- Export preferences save time on recurring exports
- Scheduled reports run automatically

## Screens & Flows

### Settings Navigation (`/settings`)

**Sidebar Layout:**
- Profile
- Notifications (→ PRD-05)
- Export Preferences
- Scheduled Reports
- Team Management (Admin only)
- Security
- Billing (Admin only)

### Profile (`/settings/profile`)

**Layout:**
- Avatar upload (circular, 120px)
- Full Name input
- Email (read-only, from auth)
- Department dropdown
- Role badge (read-only)
- Timezone dropdown
- "Save Changes" button

**Interactions:**
- Click avatar → file picker (crop modal)
- Edit fields → Save button enables
- Save → success toast

**States:**
- Loading: Skeleton form
- Saving: Button shows spinner
- Error: Red text under failed field

### Export Preferences (`/settings/exports`)

**Layout:**
- **Default Format**: PDF | CSV | Excel radio
- **PDF Settings**:
  - Page size: Letter | A4
  - Orientation: Portrait | Landscape
  - Include cover page: toggle
  - Logo upload (for cover page)
- **CSV Settings**:
  - Delimiter: Comma | Semicolon | Tab
  - Include headers: toggle
- **Naming Convention**: 
  - Pattern input with placeholders: `{report_name}_{date}_{version}`
  - Preview of resulting filename

**Interactions:**
- Change any setting → auto-save
- Logo upload → crop modal → save

### Scheduled Reports (`/settings/schedules`)

**Layout:**
- List of scheduled reports
- Each shows:
  - Report name
  - Schedule (e.g., "Every Monday at 9am")
  - Recipients (email list)
  - Last run timestamp
  - Status toggle (enabled/disabled)
  - Edit | Delete buttons

- "Add Schedule" button → modal

**Add/Edit Schedule Modal:**
- Select report dropdown
- Frequency: Daily | Weekly | Monthly
- Day/Time selectors (based on frequency)
- Recipients: multi-email input with pills
- Format: PDF | CSV | Excel
- "Save Schedule" button

**States:**
- Empty: "No scheduled reports. Set up automatic delivery!"
- Error: Failed schedule shows warning icon, "Last run failed: [reason]"

### Team Management (`/settings/team`) - Admin Only

**Layout:**
- Team member list
- Each row:
  - Avatar | Name | Email | Role badge | Status
  - Actions: Change Role | Deactivate | Remove
- "Invite Member" button
- Pending invitations section

**Invite Flow:**
1. Click "Invite Member"
2. Modal: Email input, Role dropdown
3. Send → pending invitation appears
4. Invitee receives email with signup link
5. On signup, automatically added to team with role

**Role Management:**
- Dropdown to change role
- Confirmation modal for role changes
- Cannot demote last admin

### Security (`/settings/security`)

**Layout:**
- **Password Section**:
  - "Change Password" button → modal
  - Current password, New password, Confirm password
  
- **Sessions Section**:
  - List of active sessions (device, location, last active)
  - "Sign out all other sessions" button

- **Two-Factor Authentication** (v2):
  - Status: Enabled/Disabled
  - Setup button

**Mobile (390px):**
- Settings sidebar becomes top nav or hamburger
- Full-width forms
- Modals become full-screen sheets

## Data

### Tables

**profiles** (extended)
```sql
-- Add to existing profiles table
avatar_url: text
department: text
timezone: text DEFAULT 'UTC'
```

**export_preferences**
```sql
id: uuid PK
user_id: uuid FK → auth.users (UNIQUE)
default_format: text DEFAULT 'pdf'
pdf_page_size: text DEFAULT 'letter'
pdf_orientation: text DEFAULT 'portrait'
pdf_include_cover: boolean DEFAULT true
pdf_logo_url: text
csv_delimiter: text DEFAULT ','
csv_include_headers: boolean DEFAULT true
naming_pattern: text DEFAULT '{report_name}_{date}'
```

**report_schedules**
```sql
id: uuid PK
report_id: uuid FK → reports
created_by: uuid FK → auth.users
frequency: text ('daily', 'weekly', 'monthly')
day_of_week: int (0-6, for weekly)
day_of_month: int (1-31, for monthly)
time_utc: time NOT NULL
recipients: text[] NOT NULL
format: text DEFAULT 'pdf'
is_enabled: boolean DEFAULT true
last_run_at: timestamptz
last_run_status: text ('success', 'failed')
last_run_error: text
created_at: timestamptz DEFAULT now()
```

**team_invitations**
```sql
id: uuid PK
email: text NOT NULL
role: app_role NOT NULL
invited_by: uuid FK → auth.users
token: text NOT NULL (unique, for signup link)
expires_at: timestamptz NOT NULL
accepted_at: timestamptz
created_at: timestamptz DEFAULT now()
```

### Access Rules (RLS)

- Users: Read/update own profile, preferences
- Users: CRUD own report schedules
- Admins: CRUD all profiles (except password)
- Admins: Manage invitations and roles

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Avatar upload fails | Show error, keep previous avatar |
| Invitation email bounces | Mark as "delivery failed", allow resend |
| Schedule runs but report fails | Log error, send failure notification |
| User in 2 timezones (travel) | Use explicit timezone, not auto-detect |
| Delete user with active schedules | Warn, offer to transfer or disable |
| Invitation expires | Show as expired, allow resend |

## Technical Notes

- **Avatar Storage**: Supabase Storage, public bucket
- **Email Sending**: Edge function with SendGrid/Resend
- **Cron Jobs**: Supabase pg_cron for scheduled reports
- **Password Change**: Supabase Auth updateUser()
- **Session Management**: Supabase Auth sessions API

## Out of Scope (v2+)

- Two-factor authentication
- SSO configuration (SAML, OIDC)
- Audit log of settings changes
- Team permissions matrix (granular)
- Custom email templates for invitations
- Workspace/organization hierarchy

## Acceptance Checklist

- [ ] Profile photo upload and crop works
- [ ] Profile changes save with success feedback
- [ ] Export preferences auto-save
- [ ] Scheduled reports list shows accurate status
- [ ] Schedule create/edit modal validates inputs
- [ ] Team list shows all members with roles
- [ ] Invite sends email and creates pending invitation
- [ ] Role change requires confirmation
- [ ] Password change validates current password
- [ ] "Sign out all sessions" works
- [ ] Settings work on mobile (390px)
- [ ] Loading states for all sections
- [ ] Error handling for failed saves
