# JobTrackr Web Application V2 PRD + Implementation Plan

## 1. Document Purpose

This document defines the Product Requirements Document (PRD) and implementation plan for **JobTrackr V2 Web Application**.

V1 delivered the core personal CRM experience: authentication, application tracking, application statuses, timeline events, reminders, interviews, dashboard summary, and the shared backend used by web and mobile.

V2 expands JobTrackr from a job application tracker into a more complete job search platform with:

- job board aggregation
- AI job matching
- resume/CV upload and parsing
- AI CV/resume review
- subscription/beta plan surfaces
- admin dashboard
- browser extension onboarding/support
- calendar sync settings

The web application remains the main full-featured product surface. Mobile remains a companion app. The backend remains the source of truth for data, permissions, subscriptions, matching, AI results, calendar integrations, and extension-created records.

### 1.1 Phase letters vs backend V2 roadmap

Letters like **Phase V2C**, **Phase V2D** in _this web plan_ describe **frontend deliverables** and may **not match** backend PRD lettering for the same symbol. **`Saved jobs` + convert-to-application** are implemented on the backend as **V2D** with incremental phases **`D.1`–`D.6`**; see **`job-trackr-backend/V2D_SAVED_JOBS_IMPLEMENTATION_PLAN.md`** (repository root from monorepo root: `job-trackr-backend/V2D_SAVED_JOBS_IMPLEMENTATION_PLAN.md`).

---

## 2. V2 Product Positioning

### 2.1 V1 Positioning

> JobTrackr is a personal CRM for job seekers that helps candidates track job applications, interviews, follow-ups, reminders, and outcomes from one organized dashboard.

### 2.2 V2 Positioning

> JobTrackr is an AI-powered job search workspace that helps candidates discover relevant jobs, match opportunities to their resume, improve their CV, track applications, manage interviews, and stay organized from job discovery to final offer.

### 2.3 V2 Product Goal

V2 should help users move from manually tracking jobs to actively managing the full job search lifecycle:

```txt
Resume profile
→ AI profile extraction
→ Job recommendations
→ Job search/aggregation
→ Save job
→ AI job match score
→ Resume improvement suggestions
→ Apply externally
→ Track application
→ Browser extension capture
→ Reminders/interviews
→ Calendar sync
→ Analytics
```

---

## 3. V2 Scope

## 3.1 Included in V2

V2 web should include:

1. Resume upload and parsing UI
2. Candidate profile review/edit UI
3. AI resume review UI
4. Job board/search UI
5. Job details page
6. Save job to tracker
7. AI job match score
8. Matched jobs/recommendations page
9. Job alerts preferences
10. Subscription/beta plan UI
11. Admin dashboard V1
12. Admin team and roles foundation
13. Browser extension onboarding page
14. Calendar sync settings
15. Feature entitlement UI
16. AI usage visibility/limits
17. Updated navigation and information architecture

## 3.2 Excluded from V2 Initial Build

The following can remain V3 or later:

- full multi-tenant customer teams
- recruiter/company accounts
- public company profiles
- full two-way calendar sync
- full email inbox scraping
- LinkedIn automation
- automatic external application submission
- complex enterprise billing
- advanced admin analytics
- mobile admin dashboard
- AI cover letter generator, unless time allows after resume review

---

## 4. Key Product Decisions

## 4.1 Backend remains source of truth

The web frontend must not independently calculate authoritative:

- job match scores
- subscription status
- feature access
- admin permissions
- parsed resume profile
- AI review result
- saved job ownership
- extension records
- calendar sync state

The frontend displays and submits data. The backend owns validation, permissions, scoring, AI orchestration, billing state, and persistence.

## 4.2 Web-first for V2 power features

The web app should be the primary surface for:

- resume upload and editing
- AI review
- job board search
- job match explanations
- billing/subscription settings
- admin dashboard
- calendar connection settings
- extension onboarding

Mobile can later receive lightweight versions of matched jobs, alerts, and score summaries.

## 4.3 Admin should be web-first

Admin workflows are table-heavy and permission-sensitive. They belong in the web app, not mobile.

The admin area should be hidden from normal users unless their role allows access.

---

## 5. Target Users

## 5.1 Primary User: Job Seeker

A candidate who wants to:

- track applications
- discover jobs
- get AI-based job matches
- improve their resume
- save jobs from external boards
- manage reminders and interviews
- eventually sync important dates to calendar

## 5.2 Platform Owner/Admin

The JobTrackr owner or internal team member who needs to:

- view users
- monitor resumes and jobs
- manage beta access
- review subscriptions
- inspect job source sync status
- monitor AI usage
- manage admin roles
- disable problematic accounts if necessary

## 5.3 Future Users

Future user types, not part of immediate V2:

- recruiter/company users
- team/workspace users
- career coach users
- enterprise admin users

---

## 6. V2 Information Architecture

## 6.1 Main User Navigation

Recommended sidebar:

```txt
Dashboard
Applications
Jobs
Matched Jobs
Resume
Reminders
Interviews
Calendar
Billing
Settings
```

Optional grouped navigation:

```txt
Track
- Dashboard
- Applications
- Reminders
- Interviews

Discover
- Jobs
- Submit careers page
- Matched Jobs
- Job Alerts

Improve
- Resume
- AI Review

Account
- Calendar
- Billing
- Settings
```

## 6.2 Admin Navigation

Admin should be a separate section:

```txt
/admin
/admin/overview
/admin/users
/admin/subscriptions
/admin/jobs
/admin/job-sources
/admin/resumes
/admin/ai-usage
/admin/team
/admin/settings
```

Normal users must not see admin links.

---

## 7. V2 Core User Flows

## 7.1 Resume Upload and Profile Extraction Flow

```txt
User opens Resume page
→ Uploads PDF/DOCX resume
→ Frontend sends file to backend
→ Backend stores file
→ Backend extracts text
→ Backend extracts structured candidate profile
→ Frontend shows parsed profile
→ User reviews and edits extracted profile
→ User saves candidate profile
```

Reason:

Resume parsing creates the foundation for job matching, AI CV scoring, and job alerts.

Acceptance criteria:

- User can upload supported resume files
- Upload progress/loading state is visible
- Backend returns parsed resume metadata
- User can see extracted skills, roles, experience, education, and profile summary
- User can edit parsed profile before using it for matching
- User can mark one resume as active
- User can see parsing errors clearly

---

## 7.2 AI Resume Review Flow

```txt
User opens Resume Review
→ Selects active resume
→ Optional: selects job/application/job board listing
→ Requests review
→ Backend performs AI review
→ Frontend displays score, strengths, weaknesses, missing keywords, and suggestions
```

Review types:

1. General resume review
2. Job-specific resume review

Reason:

General review improves the resume overall. Job-specific review tells the user how well their resume matches a target job.

Acceptance criteria:

- User can run general review
- User can run job-specific review against a saved job/application
- User sees a score and structured suggestions
- Suggestions are displayed in sections, not as one long AI paragraph
- User can view previous review history
- User cannot exceed feature limits if billing/entitlements restrict usage

---

## 7.3 Job Board Search Flow

```txt
User opens Jobs page
→ Searches by role, keyword, location, work mode, salary, source
→ Frontend calls backend job search endpoint
→ Backend returns normalized external jobs
→ User opens job details
→ User saves job
→ User can convert saved job to tracked application
```

Reason:

The job board shifts JobTrackr from a passive tracker to an active discovery platform.

Acceptance criteria:

- User can search jobs
- User can filter jobs
- User can open job details
- User can save job
- User can convert a saved job into an application
- Source and apply URL are clearly shown
- Data provenance/source is visible where required

---

## 7.4 AI Job Matching Flow

```txt
User has active candidate profile
→ User opens Matched Jobs
→ Backend ranks jobs using resume profile and preferences
→ Frontend displays match score and reason
→ User saves or dismisses recommended jobs
```

Reason:

This is one of the strongest differentiators of the product.

Acceptance criteria:

- User can see recommended jobs
- Each job shows match percentage/score
- Each job shows why it matched
- Each job shows missing skills or gaps
- User can save job to tracker
- User can tune preferences

---

## 7.5 Job Alerts Preferences Flow

```txt
User opens Job Alerts
→ Sets preferred roles, locations, remote preference, salary, experience level
→ Backend stores preferences
→ Backend notification worker later sends matched jobs
```

Reason:

Job alerts make JobTrackr proactive.

Acceptance criteria:

- User can configure alert preferences
- User can turn alerts on/off
- User can choose email/in-app notification preference
- User can see the last matching run status later

---

## 7.6 Browser Extension Onboarding Flow

```txt
User opens Browser Extension page
→ Sees what the extension does
→ Installs extension manually
→ Copies/pairs extension auth token or signs in through extension
→ Extension can save current job page to JobTrackr
```

Reason:

The extension bridges external job boards and JobTrackr tracking.

Acceptance criteria:

- User can understand the extension use case
- User sees setup instructions
- User can generate/revoke an extension connection token if needed
- User can view jobs saved from extension
- User can distinguish extension-created jobs from manually created jobs

---

## 7.7 Calendar Sync Flow

```txt
User opens Calendar settings
→ Connects Google Calendar
→ Backend handles OAuth flow
→ User selects what to sync
→ Interviews are synced as calendar events
→ Later reminders/deadlines can be synced
```

Reason:

Calendar sync makes interviews and follow-ups visible in the user’s normal planning workflow.

Acceptance criteria:

- User can connect Google Calendar
- User can disconnect integration
- User can see integration status
- User can choose sync type
- User sees clear status/error messages

---

## 7.8 Billing/Beta Flow

```txt
User opens Billing
→ Sees current plan: Beta Free
→ Sees beta access expiration or beta status
→ Sees future plans
→ Payment is not required during beta
→ Admin can later manage access
```

Reason:

The product should be structured like SaaS even while free during beta.

Acceptance criteria:

- User sees current plan
- User understands beta is free
- User can see available/future plans
- Feature access is displayed clearly
- Upgrade/payment can remain disabled or marked as coming soon

---

## 7.9 Admin Dashboard Flow

```txt
Admin logs in
→ Admin sees Admin section
→ Admin views users
→ Admin views user details
→ Admin views resume/job/subscription metrics
→ Admin manages beta status
→ Admin invites team members later
```

Reason:

Admin tools are needed once real beta users start using the platform.

Acceptance criteria:

- Only admins can access admin routes
- Admin can see user list
- Admin can see user details
- Admin can see subscription/beta status
- Admin can see job source status
- Admin can see AI usage summary
- Admin can assign simple roles if backend supports it

---

## 8. V2 Web Pages

## 8.1 User-Facing Pages

```txt
/dashboard
/dashboard/applications
/dashboard/applications/[id]
/dashboard/jobs
/dashboard/jobs/[id]
/dashboard/matches
/dashboard/resume
/dashboard/resume/[id]
/dashboard/resume/review
/dashboard/reminders
/dashboard/interviews
/dashboard/calendar
/dashboard/billing
/dashboard/settings
/dashboard/extension
```

## 8.2 Admin Pages

```txt
/admin
/admin/users
/admin/users/[id]
/admin/subscriptions
/admin/jobs
/admin/job-sources
/admin/resumes
/admin/ai-usage
/admin/team
/admin/settings
```

---

## 9. Page Requirements

## 9.1 Resume Page

Route:

```txt
/dashboard/resume
```

Purpose:

Manage resume uploads, active resume, parsed profile, and resume review entry point.

Sections:

- Active resume card
- Upload resume button
- Resume history
- Parsed candidate profile preview
- Review resume CTA
- Parsing status

UI requirements:

- Drag-and-drop upload
- File type restrictions
- Upload progress
- Parsing loading state
- Error state
- Active resume badge
- "Use for matching" action

Acceptance criteria:

- User can upload resume
- User can view uploaded resumes
- User can mark active resume
- User can see parsed profile summary
- User can navigate to full profile/review

---

## 9.2 Resume Detail/Profile Page

Route:

```txt
/dashboard/resume/[id]
```

Purpose:

Allow user to inspect and edit extracted candidate profile.

Sections:

- Resume metadata
- Extracted skills
- Experience summary
- Education
- Certifications
- Projects
- Preferred roles
- Preferred locations
- Work mode preferences
- Save profile button

Acceptance criteria:

- User can edit extracted fields
- User can save corrections
- Matching uses the confirmed profile
- User sees warnings if profile is incomplete

---

## 9.3 Resume Review Page

Route:

```txt
/dashboard/resume/review
```

Purpose:

Display AI resume review results.

Sections:

- General score
- ATS readiness
- Strengths
- Weaknesses
- Missing sections
- Bullet improvement suggestions
- Keyword recommendations
- Job-specific comparison selector
- Review history

Acceptance criteria:

- User can run review
- User can select job-specific review
- User sees structured result
- User can revisit old reviews

---

## 9.4 Jobs Page

Route:

```txt
/dashboard/jobs
```

Purpose:

Search and browse external jobs.

Filters:

- keyword
- role/title
- location
- remote/hybrid/onsite
- salary
- experience level
- source
- posted date

Job card/list item:

- job title
- company
- location
- work mode
- source
- salary if available
- posted date
- match badge if available
- save button

Acceptance criteria:

- User can search jobs
- User can filter jobs
- User can save jobs
- Empty/loading/error states exist
- Job source is visible

---

## 9.4.1 Submit Careers Page

Route:

```txt
/dashboard/jobs/submit
```

Purpose:

Let users suggest a company careers / ATS board for admin review and ingestion (Phase I organic source growth).

Form fields:

- company name (required)
- careers page URL (required, http/https)
- submitter email (optional; prefilled from account when logged in)

Success state:

- confirmation message
- detected ATS type + slug when auto-detected
- link back to Jobs search

Errors:

- 409 duplicate pending URL
- 429 rate limit

Acceptance criteria:

- User can submit from Discover nav or Jobs page CTA
- Valid URLs reach backend `POST /job-source-submissions`
- Success UI shows detection result when available

---

## 9.5 Job Detail Page

Route:

```txt
/dashboard/jobs/[id]
```

Purpose:

View a job listing and take actions.

Sections:

- job title/company
- job metadata
- description
- requirements
- salary/location/work mode
- source/apply URL
- AI match score
- matching explanation
- missing skills
- save job
- create application
- open external apply link

Acceptance criteria:

- User can view job details
- User can save job
- User can create application from job
- User can open external apply link
- User can see AI match if profile exists

---

## 9.6 Matched Jobs Page

Route:

```txt
/dashboard/matches
```

Purpose:

Display jobs ranked by fit.

Sections:

- match score cards
- recommended jobs
- missing skills
- location/work preference fit
- dismiss/save actions
- matching preferences link

Acceptance criteria:

- User can see matched jobs
- User can save/dismiss recommendations
- User can understand why each job was recommended
- User sees prompt to upload resume if no active resume exists

---

## 9.7 Billing Page

Route:

```txt
/dashboard/billing
```

Purpose:

Show SaaS plan state during beta.

Sections:

- current plan
- beta status
- feature access
- future plans
- usage limits
- upgrade placeholder

Acceptance criteria:

- User sees Beta Free status
- User sees access to current features
- Payment is not required
- Upgrade CTA can be disabled or marked "coming later"

---

## 9.8 Calendar Settings Page

Route:

```txt
/dashboard/calendar
```

Purpose:

Allow user to connect and manage calendar sync.

Sections:

- Google Calendar connection status
- connect/disconnect action
- sync settings
- last sync status
- sync error messages

Acceptance criteria:

- User can start OAuth connection
- User can see connected status
- User can disconnect
- User can choose sync interviews initially

---

## 9.9 Browser Extension Page

Route:

```txt
/dashboard/extension
```

Purpose:

Educate and connect browser extension.

Sections:

- what the extension does
- install/setup instructions
- connection status
- generated extension token if applicable
- recent extension saves
- security/revoke connection action

Acceptance criteria:

- User understands how to use extension
- User can connect/revoke extension
- User can view records created from extension

---

## 9.10 Admin Overview

Route:

```txt
/admin
```

Purpose:

Give platform owner a quick operational view.

Cards:

- total users
- active beta users
- resumes uploaded
- jobs indexed
- AI reviews run
- subscriptions/plans
- job source health
- extension saves

Acceptance criteria:

- Only admins can access
- Admin sees aggregate metrics
- Non-admin is denied/redirected

---

## 9.11 Admin Users

Routes:

```txt
/admin/users
/admin/users/[id]
```

Purpose:

Manage and inspect users.

User list columns:

- name
- email
- plan
- role
- resume count
- application count
- last active
- created date

User detail sections:

- profile
- applications summary
- resumes
- subscription/beta status
- AI usage
- extension saves
- admin actions

Admin actions:

- change role
- change beta status
- disable/reactivate account later
- reset feature limits later

Acceptance criteria:

- Admin can view users
- Admin can inspect user details
- Admin can update beta status if backend supports it
- Admin cannot accidentally modify own owner role without guardrails

---

## 9.12 Admin Job Sources

Route:

```txt
/admin/job-sources
```

Purpose:

Monitor job aggregation sources.

Sections:

- provider list
- sync status
- last successful sync
- error logs
- job counts
- manual sync action if backend supports it

Acceptance criteria:

- Admin can see source health
- Admin can see sync errors
- Admin can trigger sync later if allowed

---

## 9.13 Admin AI Usage

Route:

```txt
/admin/ai-usage
```

Purpose:

Monitor AI feature usage and cost-sensitive activity.

Sections:

- resume parse count
- AI review count
- match generation count
- failed AI jobs
- usage by user
- date filters

Acceptance criteria:

- Admin can monitor AI usage
- Admin can detect abuse or cost spikes
- Admin sees failed jobs

---

## 10. API Integration Requirements

The frontend should consume V2 backend endpoints.

Example endpoint groups:

```txt
/resumes
/resumes/:id
/resumes/:id/profile
/resumes/:id/reviews
/jobs
/jobs/:id
/jobs/:id/save
/matches
/job-alerts
/billing/me
/calendar/google/connect
/calendar/status
/extension/connect-token
/admin/overview
/admin/users
/admin/subscriptions
/admin/jobs
/admin/job-sources
/admin/ai-usage
```

The frontend should not assume final endpoint names until backend implementation is locked, but the UI should be organized around these resources.

---

## 11. Frontend State and Data Fetching

Use a server-state library such as TanStack Query if already available.

Recommended query groups:

```txt
useCurrentUser()
useDashboardSummary()
useApplications()
useResumeList()
useResumeDetail()
useResumeReview()
useJobs()
useJobDetail()
useMatchedJobs()
useBilling()
useCalendarStatus()
useAdminOverview()
useAdminUsers()
```

Mutation examples:

```txt
uploadResume()
updateCandidateProfile()
runResumeReview()
saveJob()
createApplicationFromJob()
updateJobAlertPreferences()
startCalendarConnect()
disconnectCalendar()
createExtensionToken()
updateUserBetaStatus()
```

Use optimistic updates carefully. For admin, billing, and AI review actions, avoid optimistic updates unless the backend confirms success.

---

## 12. Security and Permission Requirements

## 12.1 Route Guarding

User dashboard routes require authentication.

Admin routes require:

```txt
role = OWNER or ADMIN or approved admin role
```

The backend must enforce this. Frontend guards are UX only.

## 12.2 Feature Entitlements

Frontend should display or hide features based on backend-provided entitlements.

Example:

```txt
canUseAiReview
canUseJobMatching
canUseJobAlerts
canUseCalendarSync
canUseExtension
isBetaUser
planName
```

Do not hardcode access rules only in frontend.

## 12.3 File Upload Safety

Frontend should enforce:

- accepted file types
- maximum file size
- clear warning that uploaded resume contains personal information
- upload progress and cancellation if possible

Backend must still validate file type and size.

## 12.4 AI Result Safety

Do not present AI results as absolute truth.

Use wording like:

- "Suggested improvements"
- "Potential gaps"
- "Estimated match"
- "Review guidance"

Avoid:

- "Guaranteed ATS score"
- "You will get hired"
- "This is objectively correct"

## 12.5 Admin Safety

Admin destructive actions should require confirmation.

Admin role changes should be logged by backend.

Frontend should prevent obvious mistakes, but backend must enforce final rules.

---

## 13. Implementation Plan

This implementation is best done in slices, not one giant build.

## Phase V2A: Resume Intelligence UI

### Goal

Build resume upload, parsing result display, candidate profile editing, and AI review UI.

### Tasks

1. Add `/dashboard/resume`
2. Build resume upload component
3. Add drag/drop or file picker
4. Connect to backend upload endpoint
5. Display upload/parsing status
6. Build resume list/history
7. Build active resume selection
8. Add `/dashboard/resume/[id]`
9. Build parsed profile editor
10. Add skills editor
11. Add experience summary editor
12. Add preferences editor
13. Add `/dashboard/resume/review`
14. Build AI review result UI
15. Build review history UI
16. Add loading/error/empty states

### Acceptance criteria

```txt
User can upload resume
User can view parsed profile
User can edit/save profile
User can mark active resume
User can run/view AI review
```

---

## Phase V2B: Job Board and Matching UI

### Goal

Build job discovery and AI matching surfaces.

### Tasks

1. Add `/dashboard/jobs`
2. Build job search/filter interface
3. Build job card/list component
4. Connect to backend job search endpoint
5. Add `/dashboard/jobs/[id]`
6. Build job detail page
7. Add save job action
8. Add create application from job action
9. Display match score if available
10. Add `/dashboard/matches`
11. Build matched jobs page
12. Build missing skills/reason display
13. Build job alert preferences UI
14. Add empty state prompting resume upload if needed
15. Add `/dashboard/jobs/submit` careers page submission form (Phase I)
16. Wire submit form to `POST /job-source-submissions` with success + 409 handling

### Acceptance criteria

```txt
User can search jobs
User can view job details
User can save jobs
User can create application from job
User can see matched jobs
User can see match reasons and gaps
User can submit a careers page for review
```

---

## Phase V2C: Billing/Beta UI

### Goal

Make the product feel SaaS-ready while keeping beta free.

### Tasks

1. Add `/dashboard/billing`
2. Fetch current plan/subscription
3. Display Beta Free plan
4. Display beta expiry/status if backend supports it
5. Display feature access
6. Display future plans
7. Add upgrade CTA as disabled/coming soon or optional checkout
8. Add billing error/loading states

### Acceptance criteria

```txt
User can see current beta plan
User understands product is free during beta
User can see future paid plans
Feature entitlements are visible
```

---

## Phase V2D: Admin Dashboard Web

### Goal

Build the first internal admin console.

### Tasks

1. Add admin route group
2. Add admin layout
3. Add admin route guard
4. Build `/admin`
5. Build `/admin/users`
6. Build `/admin/users/[id]`
7. Build `/admin/subscriptions`
8. Build `/admin/job-sources`
9. Build `/admin/ai-usage`
10. Build `/admin/team`
11. Add role badges
12. Add confirmation dialogs for admin actions
13. Add admin-specific empty/loading/error states

### Acceptance criteria

```txt
Only admins can access admin routes
Admin can view platform metrics
Admin can view users
Admin can inspect user details
Admin can view subscription/beta status
Admin can view job source health
Admin can view AI usage
```

---

## Phase V2E: Extension and Calendar Surfaces

### Goal

Add user-facing setup pages for browser extension and calendar sync.

### Tasks

1. Add `/dashboard/extension`
2. Build extension onboarding/instructions
3. Connect token/status endpoint
4. Add revoke connection action
5. Show recent extension saves
6. Add `/dashboard/calendar`
7. Build calendar connection status UI
8. Add Google connect action
9. Add disconnect action
10. Add sync settings
11. Add sync error/status display

### Acceptance criteria

```txt
User can understand extension setup
User can connect/revoke extension if backend supports it
User can see extension-created records
User can connect/disconnect calendar
User can configure what syncs
```

---

## 14. Testing Plan

## 14.1 Frontend Test Types

Use:

- unit tests for components/utilities
- integration tests for pages/forms
- e2e tests for critical user flows if Playwright is already set up

## 14.2 Required Test Cases

Resume:

```txt
Upload form rejects unsupported file types
Upload form shows loading state
Parsed profile renders correctly
Profile edit form submits valid data
AI review empty state appears when no resume exists
```

Jobs:

```txt
Jobs page renders search/filter UI
Job results render correctly
Save job action calls API
Job detail page shows match score if available
Matched jobs page prompts resume upload when no active resume exists
```

Billing:

```txt
Billing page displays Beta Free plan
Feature entitlements render correctly
Upgrade disabled state works during beta
```

Admin:

```txt
Non-admin cannot see admin navigation
Admin overview renders metrics
Admin user table renders users
Role badges render correctly
Admin action confirmation appears
```

Calendar/Extension:

```txt
Calendar disconnected state renders
Calendar connected state renders
Extension onboarding renders
Revoke extension token confirmation appears
```

## 14.3 E2E Priority Flows

```txt
Login → upload resume → view parsed profile
Login → search job → save job → create application
Login → view matched jobs → save recommendation
Admin login → view users → open user detail
Login → connect calendar flow starts
```

---

## 15. UX Standards

Every V2 page must include:

- loading state
- empty state
- error state
- success feedback
- permission denied state where relevant
- mobile-responsive fallback, even if desktop-first
- clear CTAs
- clear user guidance for AI and beta features

---

## 16. Design Guidance

Keep the V1 visual language:

- calm
- professional
- structured
- not generic AI SaaS
- not gradient-heavy
- dashboard-first
- clear tables and cards
- useful badges
- subtle borders

New V2 pages should feel like a natural extension of V1, not a separate product.

Important components to add:

```txt
ResumeUploadCard
ResumeProfileEditor
AiScoreCard
RecommendationReason
MissingSkillsList
JobSearchFilters
JobCard
JobMatchBadge
PlanCard
BetaBadge
AdminMetricCard
AdminDataTable
IntegrationStatusCard
```

---

## 17. Suggested Build Order

Recommended order:

```txt
1. Update navigation and route structure
2. Resume upload page
3. Resume detail/profile editor
4. Resume review page
5. Jobs search page
6. Job detail page
7. Matched jobs page
8. Billing/beta page
9. Admin route/layout/overview
10. Admin users/user detail
11. Admin job sources/AI usage/subscriptions
12. Extension onboarding page
13. Calendar settings page
14. Testing and polish
```

This order ensures the highest-value features are built first.

---

## 18. Final V2 Web Acceptance Criteria

V2 web frontend is acceptable when:

```txt
User can upload and manage resume
User can view/edit parsed candidate profile
User can run or view AI resume review
User can search jobs
User can view job details
User can save job
User can create application from job
User can see matched jobs
User can see match score and reasons
User can view beta/subscription state
User can access extension setup
User can access calendar integration settings
Admin can access admin dashboard
Admin can view users and platform metrics
Admin can view job source and AI usage status
All core flows have loading/error/empty states
Core flows have tests
```

---

## 19. Future V3 Web Features

After V2:

```txt
Recruiter/company accounts
Multi-tenant teams for users
Advanced paid subscriptions
Full Stripe customer portal
Outlook calendar sync
Full two-way calendar sync
Email inbox integration
AI cover letter generation
AI interview prep
Advanced job market analytics
Admin audit logs
Admin support tools
Public job pages
Referral tracking
```

---

## 20. Final Notes

V2 should be implemented as a controlled expansion of V1, not a rewrite.

The most important principle:

> Build the intelligence layer around the existing tracker, not beside it.

Job board, AI matching, resume review, browser extension, calendar sync, billing, and admin should all connect back to the core tracker experience.
