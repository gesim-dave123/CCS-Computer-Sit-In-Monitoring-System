# Server App Definition, Features and Structure

## Definition
This server-side app is a PHP backend that provides API endpoints for the Computer Sit-In Monitoring System. It handles authentication, student and admin operations, announcements, notifications, and reporting. It connects to a database through a shared configuration and exposes entry points via public-facing PHP scripts.

## Core Features

### Authentication & User Management
- **Login** (`login.php`): Authenticates users and issues JWT tokens.
- **Register** (`register.php`): Allows new users to create accounts.
- **Edit Profile** (`editProfile.php`): Enables users to update their profile information.

### Student Features
- **Session Status** (`studentSessionStatus.php`): Retrieves the current sit-in session status for a student.
- **Sit-In History** (`studentSitInHistory.php`): Provides historical records of a student's sit-in sessions.
- **Announcements** (Read-only): Students can view announcements and notifications.

### Admin Features
- **Dashboard Stats** (`adminDashboardStats.php`): Displays overview metrics and statistics.
- **Student Management** (`adminStudents.php`): Full CRUD operations for managing student records.
- **Student Search** (`adminSearchStudent.php`): Search and filter student records.
- **Sit-In Management**:
  - `adminStartSitIn.php`: Initiates a sit-in session for a student.
  - `adminEndSitIn.php`: Concludes an active sit-in session.
  - `adminSitInList.php`: Lists all active and past sit-in sessions.
- **Sit-In Reports** (`adminSitInReports.php`): Generates detailed reports on sit-in activities.
- **Announcements** (`createAnnouncement.php`): Create and publish announcements to students.

### Notifications & Communications
- **Notifications** (`notifications.php`): Manages notification delivery and retrieval.
- **Announcement Notifications**: Automatic notifications when announcements are created.

## High-Level Structure
- Entry points live in the `public/` folder and dispatch requests into `src/`.
- Configuration files live in `config/`.
- SQL scripts used for schema and data changes live in `database/`.
- Application logic and API endpoints live in `src/`.
- Composer dependencies are stored in `vendor/`.

## Folder Breakdown

### public/
- Web entry point for the server app.
- `index.php` is the main HTTP entry and routes requests to the appropriate handlers.

### config/
- `db_connection.php` provides the database connection setup and shared DB configuration.

### database/
- `schema_sync.sql` defines or updates database schema.
- `add_announcement_notification_feedback.sql` adds data or schema changes related to announcements/notifications.

### src/
Contains the main backend endpoints and features:
- Authentication: `login.php`, `register.php`
- Profile: `editProfile.php`
- Student operations: `studentSessionStatus.php`, `studentSitInHistory.php`
- Admin operations: `adminDashboardStats.php`, `adminSearchStudent.php`, `adminStudents.php`
- Sit-in management: `adminStartSitIn.php`, `adminEndSitIn.php`, `adminSitInList.php`
- Announcements and notifications: `createAnnouncement.php`, `notifications.php`
- Reports: `adminSitInReports.php`
- `middlewares/` for shared request logic (auth, validation, etc.)

### vendor/
- Third-party PHP libraries installed by Composer.
- Autoload files and dependency packages required by the app.

## Typical Request Flow
1. A request hits `public/index.php`.
2. The request is routed to a handler in `src/`.
3. The handler may call database helpers from `config/db_connection.php`.
4. A JSON response is returned to the client.

## Conventions
- PHP files in `src/` act as endpoint handlers.
- Database access is centralized through the shared DB config.
- SQL scripts are tracked in `database/` for schema changes.
