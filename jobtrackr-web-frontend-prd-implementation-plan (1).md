# JobTrackr Web Application PRD + Implementation Plan

## 1. Document Purpose

This document defines the Product Requirements Document (PRD) and implementation plan for the **JobTrackr web application**.

The web application is the primary user interface for JobTrackr. It will serve as the main dashboard where job seekers can manage job applications, track statuses, view analytics, manage reminders, record interviews, and maintain a timeline of updates for each application.

This document should guide frontend development over the next 3 to 4 days while working alongside the NestJS backend.

---

## 2. Product Context

### 2.1 Product Name

**JobTrackr**

### 2.2 Product Positioning

> JobTrackr is a personal CRM for job seekers that helps candidates track job applications, interviews, follow-ups, reminders, and outcomes from one organized dashboard.

### 2.3 Core Problem

Many job seekers currently track applications using spreadsheets, Notion pages, browser bookmarks, emails, or memory. This becomes messy when they are applying to multiple companies, attending interviews, waiting for feedback, and trying to remember when to follow up.

The web app should solve this by giving the user a structured and calm dashboard to track their entire job search process.

### 2.4 MVP Goal

The MVP web application should allow users to:

- Register and log in
- View a dashboard summary of their job search
- Add job applications
- View all job applications
- Search and filter applications
- Update application statuses
- View detailed information for each application
- Add timeline notes/events
- Create and manage follow-up reminders
- Create and manage interview records
- View basic job search analytics

### 2.5 Non-MVP Features

The following should not be built in the first MVP:

- Job board aggregation
- AI CV review
- AI job matching
- Browser extension
- Email scraping
- LinkedIn automation
- Payment/subscription logic
- Calendar sync
- Team/collaboration features
- Admin dashboard

These features should be reserved for later versions.

---

## 3. Target Users

### 3.1 Primary User

An individual job seeker applying to multiple jobs and needing a reliable system to track their progress.

### 3.2 User Needs

The user needs to know:

- Which jobs they saved
- Which jobs they applied to
- Which companies responded
- Which applications are in interview stages
- Which follow-ups are due
- Which interviews are coming up
- Which applications ended in rejection, offer, or withdrawal
- How their job search is progressing overall

---

## 4. Web Application Role

The web app is the full dashboard experience.

It should not be treated as just a CRUD interface. It should feel like a structured workspace where users manage their job search professionally.

The mobile app will later act as a quick-action companion, but the web app should contain the most complete user experience.

---

## 5. Tech Stack

### 5.1 Required Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form
- **Validation:** Zod
- **Data Fetching:** fetch/Axios or TanStack Query
- **Auth:** JWT-based auth using backend API
- **Deployment:** Vercel

### 5.2 Recommended Supporting Libraries

- `react-hook-form` for forms
- `zod` for schema validation
- `@hookform/resolvers` for connecting forms to Zod
- `lucide-react` for icons
- `date-fns` for date formatting
- `sonner` for toast notifications
- `recharts` for dashboard charts if needed
- `clsx` and `tailwind-merge` for conditional classes

---

## 6. Design Direction

### 6.1 Design Personality

The application should feel:

- Professional
- Calm
- Organized
- Serious
- Clean
- Trustworthy
- Career-focused
- Productivity-driven

It should not feel:

- Generic
- Overly colorful
- AI-generated
- Playful in a childish way
- Gradient-heavy
- Template-like

### 6.2 Visual Direction

Recommended design approach:

- Neutral background
- Strong typography
- Subtle borders
- Soft cards
- Minimal shadows
- Clear status badges
- Clean tables/lists
- Useful empty states
- Desktop-first dashboard layout

### 6.3 Layout Pattern

Use a classic SaaS dashboard structure:

```txt
Sidebar navigation
Top header
Main content area
Page title section
Primary actions
Data/list/cards area
```

### 6.4 Main Navigation

Sidebar items:

```txt
Dashboard
Applications
Reminders
Interviews
Settings
```

Optional later:

```txt
Saved Jobs
Resume Review
Job Board
```

Do not include these optional modules in MVP navigation yet unless marked clearly as future features.

---

## 7. Core User Flows

### 7.1 Authentication Flow

```txt
User visits app
→ User registers or logs in
→ Backend validates credentials
→ Web app stores/receives authenticated session
→ User is redirected to dashboard
```

### 7.2 Add Job Application Flow

```txt
User opens Applications page
→ Clicks Add Application
→ Fills job/company details
→ Submits form
→ Backend creates application
→ User is redirected to application detail page or list page
```

### 7.3 Application Tracking Flow

```txt
User opens an application
→ Views current status and details
→ Updates status when progress changes
→ Backend updates application
→ Timeline event is automatically created
```

### 7.4 Timeline Flow

```txt
User opens application detail page
→ Adds note/recruiter update/status comment
→ Timeline event is saved
→ Event appears in application history
```

### 7.5 Reminder Flow

```txt
User creates follow-up reminder
→ Reminder is linked to a job application
→ Reminder appears on dashboard and reminders page
→ User can mark reminder as completed
```

### 7.6 Interview Flow

```txt
User creates interview record
→ Interview is linked to application
→ Interview appears on dashboard and interviews page
→ User can update interview notes/outcome
```

---

## 8. MVP Pages and Requirements

## 8.1 Public/Auth Pages

### 8.1.1 Login Page

Route:

```txt
/login
```

Purpose:

Allow existing users to authenticate.

Fields:

- Email
- Password

Actions:

- Login
- Link to register page

Acceptance criteria:

- User can submit valid credentials
- Invalid credentials show a clear but generic error
- Password is not displayed
- User is redirected to dashboard after successful login
- Loading state is shown during request

Security considerations:

- Do not expose backend error stack traces
- Do not show whether email or password specifically is wrong
- Do not store sensitive secrets in frontend

---

### 8.1.2 Register Page

Route:

```txt
/register
```

Purpose:

Allow new users to create an account.

Fields:

- Full name
- Email
- Password
- Confirm password

Acceptance criteria:

- User can create account with valid details
- Duplicate email shows friendly error
- Password and confirm password must match
- User is redirected to dashboard or login after successful registration

---

## 8.2 Protected Dashboard Layout

Routes under:

```txt
/dashboard/*
```

Purpose:

Provide a consistent authenticated layout.

Components:

- Sidebar
- Header
- User menu/logout
- Main content container
- Loading states

Acceptance criteria:

- Unauthenticated users cannot access dashboard pages
- Authenticated users see dashboard shell
- Sidebar navigation works
- Logout clears auth session/token

---

## 8.3 Dashboard Overview Page

Route:

```txt
/dashboard
```

Purpose:

Give users a quick summary of their job search.

Required data:

- Total applications
- Active applications
- Applications by status
- Upcoming reminders
- Upcoming interviews
- Recent timeline events
- Offer count
- Rejection count

UI sections:

- Summary cards
- Status breakdown
- Upcoming reminders list
- Upcoming interviews list
- Recent activity list

Acceptance criteria:

- Dashboard loads summary data from backend
- Empty state appears for new users
- Cards show accurate counts
- User can click through to related pages

Reason for feature:

The dashboard gives users immediate visibility into their job search progress and makes the product feel like a real CRM instead of a simple list app.

---

## 8.4 Applications List Page

Route:

```txt
/dashboard/applications
```

Purpose:

Display all job applications owned by the current user.

Features:

- Table or list of applications
- Search by job title/company
- Filter by status
- Sort by date/deadline
- Add application button
- Empty state for no applications

Application row/card should show:

- Job title
- Company name
- Status badge
- Location
- Work mode
- Deadline
- Last updated date

Acceptance criteria:

- User can view applications
- User can search applications
- User can filter by status
- User can open application details
- User can navigate to add application page

Reason for feature:

This is the central workspace of the product. The user should be able to quickly understand where each application stands.

---

## 8.5 Add Application Page

Route:

```txt
/dashboard/applications/new
```

Purpose:

Allow user to create a job application record.

Fields:

Required:

- Job title
- Company name
- Status

Optional:

- Job URL
- Location
- Work mode
- Salary minimum
- Salary maximum
- Currency
- Source
- Deadline
- Notes

Status options:

```txt
Saved
Applied
Screening
Interview
Technical Assessment
Final Interview
Offer
Rejected
Withdrawn
```

Work mode options:

```txt
Remote
Hybrid
Onsite
Unspecified
```

Source options:

```txt
LinkedIn
Company Website
Referral
Indeed
Twitter/X
Email
Other
```

Acceptance criteria:

- Required fields are validated
- Invalid URLs are rejected or warned
- Salary minimum cannot be greater than salary maximum
- Successful submission creates application through backend API
- User receives success feedback

Reason for feature:

Manual entry is the foundation of the MVP. Users need to quickly capture job opportunities they want to track.

---

## 8.6 Application Details Page

Route:

```txt
/dashboard/applications/[id]
```

Purpose:

Display full details of a single application and allow user to manage its progress.

Sections:

- Job/company summary
- Status selector
- Job details
- Salary/location/source/deadline
- Notes
- Timeline events
- Related reminders
- Related interviews
- Edit/delete actions

Acceptance criteria:

- User can view one application
- User can update application status
- Status update creates backend timeline event
- User can add timeline note
- User can create reminder from this page
- User can create interview from this page
- User can delete application after confirmation

Reason for feature:

This page is what makes the product feel like a CRM. Each job application becomes a record with history, tasks, and related interactions.

---

## 8.7 Timeline Events Section

Can be part of application detail page.

Purpose:

Show the history of activities related to an application.

Event types:

```txt
Status Change
Note
Recruiter Update
Interview Update
Reminder Created
General Update
```

Features:

- Add note/event
- View chronological events
- Display event type and timestamp
- Show automatic status-change events

Acceptance criteria:

- User can add event manually
- Status changes create event automatically from backend
- Events are listed clearly

Reason for feature:

A timeline helps the user remember what happened with each application and when. This is one of the features that differentiates JobTrackr from a simple spreadsheet.

---

## 8.8 Reminders Page

Route:

```txt
/dashboard/reminders
```

Purpose:

Allow users to manage follow-up reminders.

Features:

- View all reminders
- View upcoming reminders
- Create reminder
- Mark reminder as complete
- Delete reminder
- Link reminder to application

Reminder fields:

- Title
- Description
- Due date
- Application
- Completed status

Acceptance criteria:

- User can create reminder
- User can see upcoming reminders
- User can mark reminder as completed
- Completed reminders are visually different
- Reminder must belong to authenticated user

Reason for feature:

Follow-up discipline is important in job hunting. Reminders help users avoid forgetting recruiter follow-ups, deadlines, or application actions.

---

## 8.9 Interviews Page

Route:

```txt
/dashboard/interviews
```

Purpose:

Allow users to manage interview stages and notes.

Features:

- View all interviews
- View upcoming interviews
- Create interview
- Update interview
- Delete interview
- Link interview to application

Interview fields:

- Application
- Stage
- Interview type
- Scheduled date/time
- Location or meeting link
- Notes
- Outcome

Stage examples:

```txt
Recruiter Screen
Technical Interview
Technical Assessment
Hiring Manager Interview
Final Interview
Offer Discussion
```

Interview type examples:

```txt
Phone
Video
Onsite
Take-home
Live Coding
Other
```

Acceptance criteria:

- User can create interview record
- User can view upcoming interviews
- User can update notes/outcome
- Interview links back to application

Reason for feature:

Interview tracking turns JobTrackr from an application list into a serious job search management tool.

---

## 8.10 Settings Page

Route:

```txt
/dashboard/settings
```

Purpose:

Basic profile/settings page.

MVP fields:

- Name
- Email display
- Logout action

Optional later:

- Password change
- Notification preferences
- Theme preferences

Acceptance criteria:

- User can view profile information
- User can log out

---

## 9. Frontend Architecture

Recommended structure:

```txt
apps/web/
  app/
    login/
    register/
    dashboard/
      page.tsx
      applications/
      reminders/
      interviews/
      settings/
  components/
    ui/
    layout/
    applications/
    reminders/
    interviews/
    dashboard/
    forms/
  lib/
    api.ts
    auth.ts
    utils.ts
    constants.ts
  hooks/
  types/
```

If using Next.js App Router, keep route-level files inside `app/`, reusable UI inside `components/`, and API helper logic inside `lib/`.

---

## 10. API Integration Plan

The frontend should communicate with the backend REST API.

Base URL:

```txt
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Production:

```txt
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
```

Required API connections:

```txt
POST /auth/register
POST /auth/login
GET /auth/me
GET /dashboard/summary
GET /applications
POST /applications
GET /applications/:id
PATCH /applications/:id
DELETE /applications/:id
GET /applications/:id/events
POST /applications/:id/events
GET /reminders
POST /reminders
PATCH /reminders/:id
DELETE /reminders/:id
GET /interviews
POST /interviews
PATCH /interviews/:id
DELETE /interviews/:id
```

---

## 11. Frontend Security Considerations

### 11.1 Environment Variables

Only expose public variables with `NEXT_PUBLIC_`.

Allowed:

```txt
NEXT_PUBLIC_API_URL
```

Never expose:

```txt
DATABASE_URL
JWT_SECRET
JWT_ACCESS_SECRET
```

### 11.2 Auth Token Handling

Preferred approach:

- Web uses secure HttpOnly cookie set by backend
- Frontend sends requests with credentials included

Alternative MVP approach:

- Store access token temporarily on client side
- Document limitation
- Improve later with HttpOnly cookies

### 11.3 Protected Routes

Dashboard routes must not be accessible without authentication.

Minimum behavior:

```txt
Unauthenticated user opens /dashboard
→ redirect to /login
```

### 11.4 Input Safety

- Validate forms client-side using Zod
- Do not render user notes as raw HTML
- Escape/display text normally
- Sanitize where necessary

### 11.5 Error Handling

Frontend should show user-friendly errors:

```txt
Could not create application. Please try again.
Invalid email or password.
Session expired. Please log in again.
```

Do not show raw backend stack traces.

---

## 12. Implementation Order for 3 to 4 Days

## Day 1: Frontend Setup + Design Foundation

### Goals

- Initialize web app
- Set up Tailwind and shadcn/ui
- Create dashboard layout
- Create basic auth pages
- Define shared UI patterns

### Tasks

1. Create Next.js app inside `apps/web`
2. Install Tailwind CSS and shadcn/ui
3. Set up project folders
4. Create auth pages:
   - `/login`
   - `/register`
5. Create dashboard shell:
   - sidebar
   - top header
   - main content wrapper
6. Define status badge component
7. Define empty state component
8. Define API client helper
9. Add `.env.local.example`

### Deliverables

- Web app runs locally
- Login/register UI exists
- Dashboard shell exists
- Status badge component exists
- API helper exists

---

## Day 2: Auth Integration + Applications List/Create

### Goals

- Connect auth UI to backend
- Build applications list
- Build add application form

### Tasks

1. Connect login form to `POST /auth/login`
2. Connect register form to `POST /auth/register`
3. Implement auth state/session handling
4. Protect dashboard routes
5. Build `/dashboard/applications`
6. Fetch applications from backend
7. Build search/filter UI
8. Build `/dashboard/applications/new`
9. Create application form with validation
10. Submit application to backend

### Deliverables

- User can register/login from web
- User can view applications
- User can create job application
- User can search/filter application list

---

## Day 3: Application Details + Timeline + Reminders/Interviews

### Goals

- Build application details page
- Add timeline functionality
- Add reminders and interviews UI

### Tasks

1. Build `/dashboard/applications/[id]`
2. Display application details
3. Add status update control
4. Add timeline event list
5. Add timeline note form
6. Show related reminders on application details
7. Show related interviews on application details
8. Build `/dashboard/reminders`
9. Build `/dashboard/interviews`
10. Connect reminder/interview create/update/delete to backend

### Deliverables

- Application detail page works
- Timeline events work
- Reminders page works
- Interviews page works

---

## Day 4: Dashboard Analytics + Polish + Deployment Prep

### Goals

- Build dashboard overview
- Improve UX states
- Prepare deployment

### Tasks

1. Connect `/dashboard` to `GET /dashboard/summary`
2. Build summary cards
3. Build application status breakdown
4. Build upcoming reminders/interviews sections
5. Build recent activity section
6. Add loading skeletons
7. Add empty states
8. Add toast notifications
9. Test all flows against backend
10. Prepare Vercel deployment
11. Write README section for web app

### Deliverables

- Dashboard overview works
- UI has loading/error/empty states
- Web app ready for deployment

---

## 13. MVP Acceptance Criteria

The web application MVP is complete when:

```txt
User can register
User can log in
User can log out
Protected pages are guarded
User can create job application
User can view all own applications
User can search/filter applications
User can view application details
User can update application status
User can add timeline note
User can create reminder
User can mark reminder complete
User can create interview
User can view dashboard summary
User sees useful empty/loading/error states
Web app is deployable to Vercel
```

---

## 14. Future Web Features

After MVP:

```txt
Job board discovery
Save external job to tracker
AI CV review
CV-to-job match score
Calendar sync
Email reminders
Browser extension
Notification preferences
Advanced analytics
Export applications to CSV
Dark mode
```

---

## 15. Final Notes

The web app should prioritize usability and clarity over feature quantity.

The goal is not to build the biggest job platform in the first version. The goal is to build a polished, reliable, credible product that proves full-stack engineering ability and solves the core job-search tracking problem well.
