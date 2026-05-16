# CCS Computer Sit-In Monitoring System - System Overview

## Definition
The **CCS Computer Sit-In Monitoring System** is a dedicated web application designed for the College of Computer Studies (CCS) to manage, track, and monitor student "sit-in" sessions in computer laboratories. The system provides a centralized platform for laboratory administrators to oversee laboratory usage and for students to track their personal laboratory activities and stay informed about college announcements.

Built with a **React (Vite)** frontend and a **PHP** backend, the system ensures real-time monitoring, secure data management, and an intuitive user interface for both students and staff.

---

## Core Features by Role

### 1. General Features (Available to All Users)
*   **Authentication & Security:**
    *   Secure account registration and login for both Students and Administrators.
    *   JWT-based authentication for secure API interactions.
*   **Profile Management:**
    *   View and update personal profile information.
    *   Customize profile appearance (e.g., profile pictures).
*   **System Landing Page:**
    *   Publicly accessible overview of the system's purpose.
    *   Guides on "How It Works" and key system features.

### 2. Student Features
*   **Student Dashboard:**
    *   Real-time overview of current sit-in status (In-session vs. Inactive).
    *   Quick view of personal details and used session counts.
*   **Sit-In History Tracking:**
    *   Comprehensive log of all past sit-in sessions.
    *   Details include: Laboratory used, Purpose of sit-in, and Time logs (Start/End times).
*   **Announcements & Notifications:**
    *   View real-time college announcements and administrative updates.
    *   Receive system-generated notifications for important activities.

### 3. Administrator (Admin) Features
*   **Administrative Dashboard:**
    *   Live metrics including total registered students, active sit-in sessions, and announcement counts.
    *   Visual data analysis for sit-in purposes and student leaderboards.
*   **Student Records Management:**
    *   Full CRUD (Create, Read, Update, Delete) operations for student accounts.
    *   Advanced search and filtering capabilities to locate specific students.
*   **Sit-In Session Control:**
    *   **Manual Start:** Initiate a sit-in session for a student by selecting a laboratory and purpose.
    *   **Real-time Monitoring:** View a list of all students currently in a laboratory session.
    *   **Manual End:** Terminate active sessions when students finish their laboratory work.
*   **Reporting & Analytics:**
    *   Generate summary reports of all sit-in activities.
    *   Breakdown of laboratory usage by laboratory name and sit-in purpose.
*   **Announcement & Communication Management:**
    *   Create and publish announcements to the student body.
    *   Broadcast urgent notifications directly to student dashboards.

---

## Technical Stack
*   **Frontend:** React.js, Vite, Tailwind CSS (or Vanilla CSS based on project structure).
*   **Backend:** PHP (API-centric).
*   **Database:** MySQL (relational storage for users, sessions, and announcements).
*   **Authentication:** JSON Web Tokens (JWT).

---

## UI Generation Design Prompt

*For maintaining design consistency or generating new components, use the following design prompt:*

> **"Create a modern, professional, and high-fidelity UI for a University Laboratory Monitoring System. Use a deep violet and royal purple color palette (#381872, #5428a8) with sophisticated gold accents (#c9973a) for highlights. The interface should feature a 'glassmorphism' aesthetic with backdrop blurs (20px), subtle radial gradients (light purple to transparent), and soft, deep shadows for depth. Typography must be clean and modern, prioritizing 'Poppins' or 'Montserrat'. Incorporate 16px+ rounded corners for all containers and cards. Buttons should use a 135-degree linear gradient (dark to medium purple) and elevate slightly on hover. The overall feel should be premium, academic, and user-friendly, balancing high-contrast text for readability with a sleek, futuristic tech-centered vibe."**
