# CCS Computer Sit-In Monitoring System
## Feature Implementation Specification

---

## Overview

This document specifies the new features to be implemented on top of the existing CCS Computer Sit-In Monitoring System. Features are organized by role: **Student-facing** and **Admin-facing**.

---

## Part 1 — Student-Side Features

---

### Feature 1: Software Availability / Lab Viewer

#### Description
Students can browse the software applications available in each computer laboratory before or during their sit-in session. Each laboratory entry displays its associated software tools (e.g., VS Code, XAMPP, Microsoft Word, Excel), helping students choose the right lab for their needs.

#### User Story
> *As a student, I want to see what software is installed in each laboratory so that I can choose the lab that has the tools I need for my session.*

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| SF-01 | The system shall provide a dedicated **"Labs & Software"** section accessible from the student navigation. |
| SF-02 | Each laboratory shall expose its **lab name**, **room number/identifier**, and the list of **available software applications**. |
| SF-03 | Each software entry shall record at minimum: **software name** and a **category** (e.g., IDE, Office, Database, Design). |
| SF-04 | Students shall be able to **search or filter** laboratories by software name or category. |
| SF-05 | The software list per lab shall be **read-only** for students — no editing capability. |
| SF-06 | The data presented shall always reflect the **latest state** as managed by the administrator. |

#### Data Requirements
- `laboratories` table: `lab_id`, `lab_name`, `room_number`, `description`
- `software` table: `software_id`, `software_name`, `category`, `icon_url` (optional)
- `lab_software` pivot table: `lab_id`, `software_id` (many-to-many relationship)

#### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/labs` | Retrieve all laboratories with their software lists |
| `GET` | `/api/labs/{lab_id}/software` | Retrieve software for a specific lab |

---

### Feature 2: Student Testimonials / Feedback

#### Description
Students can submit feedback or testimonials about their experience using the CCS Sit-In Monitoring System, covering system usability, lab conditions, overall satisfaction, or other relevant matters.

#### User Story
> *As a student, I want to provide feedback about the system so that the administration can understand my experience and improve the platform.*

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| ST-01 | A **"Give Feedback"** or **"Testimonials"** function shall be accessible to authenticated students. |
| ST-02 | A testimonial submission shall capture: **Rating** (1–5), **Category** (e.g., Usability, Lab Facilities, Staff, Other), and a **Comment** field. |
| ST-03 | Submission shall require the student to be **authenticated** (logged in). |
| ST-04 | Each student may submit feedback **multiple times**; each submission shall be **timestamped**. |
| ST-05 | Upon successful submission, the system shall return a **confirmation response**. |
| ST-06 | Students shall be able to **retrieve their own previously submitted testimonials**. |
| ST-07 | The system shall enforce **input validation**: comment must not be empty; rating must be a value between 1 and 5. |

#### Data Requirements
- `testimonials` table: `testimonial_id`, `student_id` (FK), `rating` (TINYINT 1–5), `category`, `comment`, `is_visible` (boolean, admin-controlled), `is_deleted` (boolean, soft-delete), `created_at`

#### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/testimonials` | Submit a new testimonial (authenticated student) |
| `GET` | `/api/testimonials/my` | Retrieve the current student's submitted testimonials |

---

## Part 2 — Admin-Side Features

---

### Feature 3: Software Availability Management

#### Description
Administrators can manage the software catalog and control which software is assigned to each laboratory. This includes adding, editing, and deleting software entries globally, as well as assigning or removing software per laboratory.

#### User Story
> *As an administrator, I want to manage the software list for each laboratory so that students always see accurate and up-to-date software availability.*

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| SA-01 | A **"Software Management"** module shall be present in the admin panel. |
| SA-02 | Admin shall be able to **add** new software entries with: name, category, and an optional icon reference. |
| SA-03 | Admin shall be able to **edit** existing software entries (name, category). |
| SA-04 | Admin shall be able to **delete** software entries; deletion shall prompt for confirmation. |
| SA-05 | Admin shall be able to **assign software to a laboratory** from the existing software library. |
| SA-06 | Admin shall be able to **remove software from a laboratory** without deleting the software entry globally. |
| SA-07 | The system shall expose a **per-lab software overview** showing each lab and its currently assigned software. |
| SA-08 | Any changes to software assignments shall be **immediately reflected** on the student-facing lab viewer. |

#### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/software` | Retrieve all software in the global library |
| `POST` | `/api/admin/software` | Add a new software entry |
| `PUT` | `/api/admin/software/{id}` | Update a software entry |
| `DELETE` | `/api/admin/software/{id}` | Delete a software entry |
| `POST` | `/api/admin/labs/{lab_id}/software` | Assign software to a lab |
| `DELETE` | `/api/admin/labs/{lab_id}/software/{software_id}` | Remove software from a lab |

---

### Feature 4: Analytics — Weekly Sit-In Session Graph

#### Description
The admin dashboard shall be extended with a data visualization that shows the number of sit-in sessions per day over a selected week, enabling administrators to identify usage trends and peak activity periods.

#### User Story
> *As an administrator, I want to see a weekly breakdown of sit-in sessions so that I can identify usage trends and make informed decisions about lab scheduling.*

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| AN-01 | The admin dashboard shall include a **"Weekly Sit-In Trends"** analytics section. |
| AN-02 | The graph shall plot **days of the week (Mon–Sun)** on the X-axis and the **total number of sit-in sessions per day** on the Y-axis. |
| AN-03 | The graph shall default to the **current week's data** on load. |
| AN-04 | Admin shall be able to **navigate between weeks** to view historical data. |
| AN-05 | The system shall support an optional **per-laboratory breakdown** to compare session counts across labs within the same week. |
| AN-06 | Each data point shall be queryable to return the **exact date and session count**. |
| AN-07 | Data shall be fetched dynamically from the backend; the graph shall update **without a full page reload**. |

#### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/analytics/weekly-sessions?week_start=YYYY-MM-DD` | Returns daily session counts for the specified week |

#### Sample API Response
```json
{
  "week_start": "2025-05-12",
  "week_end": "2025-05-18",
  "data": [
    { "date": "2025-05-12", "day": "Monday",    "session_count": 24 },
    { "date": "2025-05-13", "day": "Tuesday",   "session_count": 31 },
    { "date": "2025-05-14", "day": "Wednesday", "session_count": 19 },
    { "date": "2025-05-15", "day": "Thursday",  "session_count": 27 },
    { "date": "2025-05-16", "day": "Friday",    "session_count": 38 },
    { "date": "2025-05-17", "day": "Saturday",  "session_count": 12 },
    { "date": "2025-05-18", "day": "Sunday",    "session_count": 5  }
  ]
}
```

---

### Feature 5: Generate & Export Reports

#### Description
Administrators can generate comprehensive reports of sit-in session data, filtered by various parameters, and export them in multiple formats: **Excel (.xlsx)**, **PDF (.pdf)**, and **CSV (.csv)**.

#### User Story
> *As an administrator, I want to generate and export sit-in session reports so that I can submit documentation, analyze usage data, and maintain official records.*

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| GR-01 | A **"Generate Report"** function shall be accessible from the admin panel's Reports section. |
| GR-02 | Admin shall be able to filter report data by: **Date Range** (start and end date), **Laboratory** (all or specific), **Sit-In Purpose** (all or specific), and optionally by **Student**. |
| GR-03 | The system shall return a **filterable data set** for preview before export. |
| GR-04 | Admin shall select an **export format**: Excel (`.xlsx`), PDF (`.pdf`), or CSV (`.csv`). |
| GR-05 | Exported records shall include: **Student ID**, **Student Name**, **Laboratory**, **Purpose**, **Start Time**, **End Time**, and **Duration**. |
| GR-06 | The **PDF export** shall include a report header containing: report title, applied filters, and generation timestamp. |
| GR-07 | The **Excel and CSV exports** shall include column headers in the first row. |
| GR-08 | The export shall be delivered as a **file download** without navigating away from the current page. |

#### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/reports/sessions?start=YYYY-MM-DD&end=YYYY-MM-DD&lab_id=...&purpose=...` | Returns filtered session records for report generation |

---

### Feature 6: View Student Testimonials

#### Description
Administrators can view all testimonials and feedback submitted by students, with filtering, search, and aggregate statistics. Admins may also control the visibility of individual testimonials.

#### User Story
> *As an administrator, I want to view all student feedback so that I can assess usability, address concerns, and measure student satisfaction.*

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| VT-01 | A **"Student Testimonials"** section shall be accessible from the admin panel. |
| VT-02 | Testimonials shall be returned in a **paginated list**, sorted by most recent by default. |
| VT-03 | Each testimonial record shall expose: **Student Name**, **Student ID**, **Rating**, **Category**, **Comment**, and **Submission Date**. |
| VT-04 | Admin shall be able to **filter testimonials** by: Rating (1–5), Category, and Date Range. |
| VT-05 | Admin shall be able to **search** testimonials by student name or keyword within the comment text. |
| VT-06 | Admin shall be able to **toggle testimonial visibility** (visible / hidden). |
| VT-07 | The system shall provide **aggregate statistics**: total testimonial count, average rating, and a count breakdown by category. |
| VT-08 | Admin shall be able to **soft-delete** a testimonial; the record shall be flagged as deleted but retained in the database. |

#### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/testimonials?rating=...&category=...&search=...&page=...` | Retrieve paginated testimonials with optional filters |
| `PATCH` | `/api/admin/testimonials/{id}/visibility` | Toggle visibility of a testimonial |
| `DELETE` | `/api/admin/testimonials/{id}` | Soft-delete a testimonial |
| `GET` | `/api/admin/testimonials/summary` | Retrieve aggregate rating and category statistics |

---

## Part 3 — Database Schema Additions

The following new tables are required to support the features specified above.

```sql
-- Labs (verify if already exists; extend if needed)
CREATE TABLE laboratories (
  lab_id       INT PRIMARY KEY AUTO_INCREMENT,
  lab_name     VARCHAR(100) NOT NULL,
  room_number  VARCHAR(50),
  description  TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Global software library
CREATE TABLE software (
  software_id   INT PRIMARY KEY AUTO_INCREMENT,
  software_name VARCHAR(100) NOT NULL,
  category      VARCHAR(50),       -- e.g., IDE, Office, Database, Design
  icon_url      VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many: laboratories <-> software
CREATE TABLE lab_software (
  lab_id        INT NOT NULL,
  software_id   INT NOT NULL,
  PRIMARY KEY (lab_id, software_id),
  FOREIGN KEY (lab_id)       REFERENCES laboratories(lab_id) ON DELETE CASCADE,
  FOREIGN KEY (software_id)  REFERENCES software(software_id) ON DELETE CASCADE
);

-- Student testimonials
CREATE TABLE testimonials (
  testimonial_id  INT PRIMARY KEY AUTO_INCREMENT,
  student_id      INT NOT NULL,
  rating          TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category        VARCHAR(50),         -- e.g., Usability, Lab Facilities, Staff, Other
  comment         TEXT NOT NULL,
  is_visible      BOOLEAN DEFAULT TRUE,
  is_deleted      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

## Part 4 — Implementation Checklist

### Student Side
- [ ] **SF-01–06** — Labs & Software viewer with search/filter by software name or category
- [ ] **ST-01–07** — Testimonial submission with rating, category, comment, and input validation
- [ ] **ST-06** — Student personal testimonial history retrieval

### Admin Side
- [ ] **SA-01–04** — Global software library CRUD (add, edit, delete)
- [ ] **SA-05–08** — Per-lab software assignment and removal
- [ ] **AN-01–07** — Weekly sit-in session analytics with week navigation
- [ ] **GR-01–08** — Report generation with filters and multi-format export (Excel, PDF, CSV)
- [ ] **VT-01–08** — Testimonials viewer with filters, search, visibility toggle, and soft-delete

### Backend / Database
- [ ] Create `software`, `lab_software`, and `testimonials` tables
- [ ] Implement all API endpoints listed per feature
- [ ] Protect admin-only endpoints with JWT role verification
- [ ] Implement weekly session aggregation query for the analytics endpoint

---

*Document prepared for the CCS Computer Sit-In Monitoring System — Feature Expansion Phase.*
*Stack: React (Vite) + PHP API + MySQL | Auth: JWT*