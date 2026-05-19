# CCS Computer Sit-In Monitoring System — System Overview

## Definition

The **CCS Computer Sit-In Monitoring System** is a full-stack web application designed for the College of Computer Studies (CCS) to manage, track, and monitor student "sit-in" sessions in computer laboratories. It provides a centralized platform for laboratory administrators to oversee laboratory usage and for students to manage their personal lab activities, submit feedback, browse software, and reserve computer seats.

Built with a **React (Vite) + Tailwind CSS** frontend and a **PHP** backend (API-centric), the system uses **JWT-based authentication**, **MySQL** for persistent storage, and **Chart.js** for data visualization.

---

## Application Portals

The system has two authenticated portals and a public landing page:

| Portal | Route Prefix | Access |
|---|---|---|
| **Landing / Public** | `/` | Unauthenticated visitors |
| **Student Portal** | `/dashboard`, `/history`, etc. | Authenticated students |
| **Admin Portal** | `/admin/*` | Authenticated administrators |

---

## Core Features by Role

### 1. General Features (All Users)

- **Authentication & Security**
  - Secure account registration and login for both Students and Administrators.
  - JWT-based session management stored in `localStorage`.
  - Role-based route protection (student vs. admin).
- **Profile Management** (`dashboard.jsx`, `editProfile.php`)
  - View and update personal profile details: first name, middle name, last name, email, course, year level, address.
  - Upload a custom profile photo (JPG, PNG, WEBP; max 5 MB).
- **Notifications** (`notifications.php`)
  - System-generated in-app notifications for key activities (e.g., reservation status changes, new announcements).
- **System Landing Page** (`landingPage.jsx`, `homePage.jsx`, `features.jsx`, `howItWorks.jsx`)
  - Publicly accessible overview: system purpose, feature highlights ("How It Works"), testimonials section, and footer.

---

### 2. Student Features

#### Dashboard (`dashboard.jsx`)
- **Summary stat cards**: Total Sit-In Records, Remaining Sessions (out of 30 per term), Current Session Status (Active / Idle), Unread Announcements count.
- **Profile sidebar**: Avatar, name, course, year level, inline edit button, logout.
- **Student Information panel**: Full contact and academic details.
- **Announcements panel**: Live feed of active announcements (auto-refreshed every 30 seconds), expandable cards with priority-colour coding (high / medium / low), dismissible per session.
- **Lab Rules & Regulations** panel embedded in dashboard.

#### Sit-In History (`studentHistory.jsx`, `studentSitInHistory.php`)
- Paginated, searchable table of all past sit-in sessions.
- Columns: Laboratory, Purpose, Status, Start Time, End Time, Duration.

#### Announcements (`studentAnnouncements.jsx`, `createAnnouncement.php`)
- Dedicated page showing all student-targeted announcements.
- Priority-colour coded cards with full content, author, and date.

#### Labs & Software Viewer (`studentLabsSoftware.jsx`, `labsSoftware.php`)
- Read-only browser for all laboratories and their installed software.
- Each lab card shows: name, room number, seat count, building, and a preview list of installed software with category tags.
- Searching/filtering by lab name supported through the UI.

#### Lab Reservation (`studentReservation.jsx`, `reservations.php`)
- **3-step reservation wizard**:
  1. **Choose Lab** — card grid of all available laboratories with seat count and installed software preview.
  2. **Select Seat & Schedule** — visual seat map (grid of computer icons per lab capacity), date picker (minimum tomorrow), time-slot selector (7 predefined slots 7:30 AM – 6:00 PM), purpose/subject dropdown.
  3. **Success confirmation** — displays reservation ID; links to "My Reservations".
- **My Reservations tab** — card grid of the student's own reservations with status badges (Pending / Approved / Completed / Cancelled). Pending reservations can be cancelled.
- Real-time seat availability: seats are fetched per lab + date combination and colour-coded (green = available, red = taken, amber = selected).

#### Student Feedback / Testimonials (`studentFeedback.jsx`, `testimonials.php`)
- Submit a testimonial with: **Rating** (1–5 stars), **Category** (Usability / Lab Facilities / Staff / Other), and a **Comment** field.
- View personal submission history.
- Input validation enforced client-side and server-side.

---

### 3. Administrator Features

#### Admin Dashboard (`adminDashboard.jsx`, `adminDashboardStats.php`)
- **KPI stat cards**: Registered Students, Current Active Sit-Ins, Total Sit-Ins (all time), Total Announcements.
- **Student Sit-In Leaderboard** — bar chart (Chart.js) of the top 5 students by session count, podium-style ordering.
- **Sit-In Purpose Distribution** — doughnut/pie chart of session counts broken down by purpose with colour-coded legend.

#### Sit-In Session Control (`adminSitIn.jsx`, `adminStartSitIn.php`, `adminEndSitIn.php`, `adminSitInList.php`)
- **Manual Start Sit-In**: Search for a student by ID number, select a laboratory and purpose, initiate a session.
- **Active Sessions List**: Live table of all students currently in a session.
- **Manual End Sit-In**: Terminate an active session from the list.

#### Student Records Management (`adminStudents.jsx`, `adminStudents.php`)
- Full list of registered students with search capability.
- View student details; update or manage student records.

#### Student Search (`adminSearch.jsx`, `adminSearchStudent.php`)
- Dedicated advanced search for quickly locating a student by name or ID number.

#### Reservations Management (`adminReservations.jsx`, `reservations.php`)
- Full reservation table with status filter (All / Pending / Approved / Completed / Cancelled / Rejected) and search by student name, ID, or lab.
- **Stat cards**: Total, Pending, Approved, Today's Check-Ins, Completed counts.
- **Per-row actions**:
  - **Approve** / **Reject** pending reservations.
  - **Check In** (convert an approved, today-dated reservation into an active sit-in session).
  - **Cancel** pending or approved reservations with a confirmation dialog.
- Clickable rows open a **detail modal** with full reservation info and action buttons.

#### Labs & Software Management (`adminLabsSoftware.jsx`, `labsSoftware.php`)
- **Laboratory CRUD**: Add new labs (name, room number, seat count, building), edit or delete existing labs.
- **Software Catalog CRUD**: Add, edit, or delete software entries (name, category, optional icon URL). Categories: IDE, Office, Database, Design, Browser, Utility, Other.
- **Software Assignment**: Within a lab's detail modal, toggle any catalog software on/off for that lab. Changes are immediately reflected in the student-facing viewer.
- Grid card display of all labs with software count badges and software previews.

#### Announcement Management (`adminAnnouncements.jsx`, `createAnnouncement.php`)
- **Create / Edit announcements** with: title, content (rich textarea), type (General / Maintenance / Rules / Event), priority (Low / Medium / High), target audience (Students Only / All Users / Admins Only).
- **Announcement Feed**: Searchable, filterable list (by query text, priority, type) with priority-colour coded cards.
- Each card shows active/inactive status and edit button. Editing pre-fills the form.
- Auto-sends in-app notifications to targeted users on publish.
- **Stats row**: Total Announcements, High Priority count, Active count, Student-Visible count.

#### Reports & Export (`adminReports.jsx`, `reports.php`)
- Filterable sit-in session data table with filters: Start Date, End Date, Laboratory, Purpose, Student (name or ID).
- **Preview table**: Student ID, Name, Lab, Purpose, Status (Active/Ended), Start Time, End Time, Duration.
- **Export formats**:
  - **CSV** — server-side download via query parameters.
  - **PDF** — client-side generation via `jsPDF` + `jspdf-autotable`; includes header with title, applied filters, and generation timestamp.
  - **Excel (.xlsx)** — client-side generation via `SheetJS (xlsx)` with column headers.

#### Sit-In Records (`adminSitInRecords.jsx`, `adminSitInReports.jsx`, `adminSitInReports.php`)
- Tabular log of all sit-in records (historical, not filtered by status).
- Sub-page for summarized sit-in reports.

#### Testimonials Management (`adminTestimonials.jsx`, `testimonials.php`)
- Paginated list of all student testimonials.
- **Summary stat cards**: Total Feedback count, Average Rating (with star display), breakdown by Category.
- **Filters**: Rating (1–5 stars), Category dropdown, keyword search (student name or comment text).
- **Per-testimonial actions**: Toggle visibility (Eye / EyeOff), Soft-Delete (flagged as deleted, retained in DB).
- Visibility toggle dimmed cards for hidden testimonials.

---

## Technical Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **UI Icons** | Lucide React |
| **Charts** | Chart.js, react-chartjs-2 (Pie, Bar) |
| **PDF Export** | jsPDF + jspdf-autotable |
| **Excel Export** | SheetJS (xlsx) |
| **Backend** | PHP (API-centric, no framework) |
| **Database** | MySQL |
| **Authentication** | JSON Web Tokens (JWT) |
| **State** | React useState / useEffect + localStorage |

---

## Database Tables (Key)

| Table | Purpose |
|---|---|
| `users` | All users (students + admins), roles, session counters, profile photos |
| `sit_in_records` | All laboratory sit-in sessions (start/end times, lab, purpose, status) |
| `announcements` | Admin-created announcements with type, priority, audience, active flag |
| `notifications` | Per-user in-app notifications linked to announcements or system events |
| `laboratories` | Lab registry: name, room number, seat count, building |
| `software` | Global software catalog: name, category, icon URL |
| `lab_software` | Many-to-many pivot: laboratories ↔ software |
| `reservations` | Computer seat reservations: student, lab, seat, date, time slot, purpose, status |
| `testimonials` | Student feedback: rating, category, comment, visibility/deleted flags |

---

## API Endpoints (Backend PHP Files)

| File | Methods | Description |
|---|---|---|
| `login.php` | POST | Authenticate user, return JWT + user object |
| `register.php` | POST | Register new student account |
| `editProfile.php` | POST (multipart) | Update profile fields and upload photo |
| `adminDashboardStats.php` | GET | KPI stats for admin dashboard |
| `adminSearchStudent.php` | GET | Search students by name/ID |
| `adminStartSitIn.php` | POST | Start a manual sit-in session |
| `adminEndSitIn.php` | POST | End an active sit-in session |
| `adminSitInList.php` | GET | Fetch all current active sessions |
| `adminSitInReports.php` | GET | Summarized sit-in report data |
| `adminStudents.php` | GET/POST/PUT/DELETE | Student CRUD operations |
| `studentSessionStatus.php` | GET | Current session status for a student |
| `studentSitInHistory.php` | GET | Paginated sit-in history for a student |
| `createAnnouncement.php` | GET/POST/PUT | Fetch, create, edit announcements; dispatch notifications |
| `notifications.php` | GET/POST | Fetch and manage user notifications |
| `labsSoftware.php` | GET/POST | Labs and software CRUD, assignment toggling |
| `reports.php` | GET | Filtered sit-in records; CSV export |
| `reservations.php` | GET/POST | Reservation CRUD; seat availability; admin actions (approve/reject/checkin/cancel) |
| `testimonials.php` | GET/POST | Student feedback CRUD; admin visibility/delete |

---

## UI Design System

> **Design prompt** for maintaining visual consistency or generating new components:
>
> *"Create a modern, professional, and high-fidelity UI for a University Laboratory Monitoring System. Use a deep violet and royal purple color palette (`#381872`, `#5428a8`) with sophisticated gold accents (`#c9973a`) for highlights and dark background gradients (`#240d48` to `#5428a8`). The interface uses glassmorphism-inspired cards, subtle dot-grid background patterns, and soft deep shadows for depth. Typography is clean and modern (Inter or system-ui). Rounded corners (16px+) on all containers. Buttons use 135° linear gradients (dark to medium purple) and lift on hover. Light-mode pages use a `slate-50` background with white cards and `slate-200` borders. Dark-mode toggles to `slate-950` backgrounds with `slate-900` cards. The overall feel is premium, academic, and user-friendly, balancing high-contrast text for readability with a sleek, tech-forward aesthetic."*

---

*Last updated: 2026-05-17 | Stack: React (Vite) + PHP API + MySQL | Auth: JWT*
