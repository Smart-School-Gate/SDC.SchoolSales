# SmartDevCo School Sales & Visit Manager (`SDC.SchoolSales`)

> **Production-ready, internal sales and visit management platform for SmartDevCo's sales force.**
> Built with **ASP.NET Core 10 Web API**, **Entity Framework Core (Code First)**, **PostgreSQL on Neon**, and **React 19 + TypeScript + Vite + Tailwind CSS**.

---

## 1. Product & Architecture Overview

`SDC.SchoolSales` is an independent CRM, discovery questionnaire, presentation, and sales intelligence portal designed specifically for SmartDevCo representatives and sales management to target schools across Egypt and the MENA region.

### System Boundaries
- **In Scope**:
  - School prospect & contact management (multiple contacts per school, decision maker tagging).
  - Sales teams & dynamic school assignments with complete audit trails.
  - Multi-period sales quotas & live metric achievement tracking.
  - Configurable Discovery Questionnaires (Section A: ROOTACA Smart School, Section B: ROOTACA Academy).
  - Field visit reporting with automated sales pipeline status progression.
  - Interactive Presentation Deck Builder with customer-facing fullscreen mode.
  - Questions & Objections Knowledge Base with internal sales battlecards.
  - Activities, reminders, and follow-up management.
  - Bilingual UI: Arabic (RTL) and English (LTR).
  - Default Cairo Timezone (`Africa/Cairo`).
- **Out of Scope (Explicitly Isolated)**:
  - School Management System operations (student records, teacher attendance, fee invoicing, LMS grading).

### Architecture (Modular Monolith)

```
SDC.SchoolSales/
├── src/
│   ├── SmartDevCo.SchoolSales.Contracts/         # Enums, Request/Response DTOs, API wrappers
│   ├── SmartDevCo.SchoolSales.Core/              # Domain Entities, Service Contracts (Interfaces)
│   ├── SmartDevCo.SchoolSales.Infrastructure/    # EF Core DbContext, PostgreSQL mappings, 16 Services, DbSeeder
│   └── SmartDevCo.SchoolSales.Api/               # ASP.NET Core 10 Controllers, JWT Bearer, Exception Middleware
├── frontend/                                     # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/                           # Layout (Sidebar, Header, AppLayout), Modals, Cards
│   │   ├── context/                              # AuthContext, LanguageContext (AR/EN RTL/LTR)
│   │   ├── pages/                                # Dashboard, Schools, Workspace, Team, Visits, etc.
│   │   ├── services/                             # Centralized Axios/Fetch API client with token refresh
│   │   └── types/                                # TypeScript interfaces and domain enums
└── README.md
```

---

## 2. Security & Credentials

Credentials and database connection strings are managed strictly through **.NET User Secrets** in development and environment variables in production. No sensitive credentials are committed into source code or Git.

### Default Bootstrap SuperAdmin
- **Email**: `admin@smartdevco.com`
- **Password**: Configured in user secrets (`Admin@SmartDevCo2026!`)
- **Role**: `SuperAdmin`

---

## 3. Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js (v20+)](https://nodejs.org/) & `npm`
- PostgreSQL or Neon Serverless PostgreSQL instance

### Backend Setup (.NET 10 Web API)

1. Navigate to the API project directory:
   ```bash
   cd src/SmartDevCo.SchoolSales.Api
   ```

2. Configure User Secrets with your PostgreSQL connection string:
   ```bash
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=<neon_host>;Database=<db_name>;Username=<db_user>;Password=<db_password>;SSL Mode=Require;Trust Server Certificate=true;"
   dotnet user-secrets set "Jwt:SecretKey" "Your_Very_Long_And_Super_Secure_JWT_Key_2026!"
   dotnet user-secrets set "Jwt:Issuer" "SmartDevCo.SchoolSales"
   dotnet user-secrets set "Jwt:Audience" "SmartDevCo.SchoolSales.Client"
   dotnet user-secrets set "Bootstrap:SuperAdminEmail" "admin@smartdevco.com"
   dotnet user-secrets set "Bootstrap:SuperAdminPassword" "Admin@SmartDevCo2026!"
   dotnet user-secrets set "Bootstrap:SuperAdminFullName" "SmartDevCo SuperAdmin"
   ```

3. Update Database schema using EF Core migrations:
   ```bash
   dotnet ef database update --project ../SmartDevCo.SchoolSales.Infrastructure --startup-project .
   ```

4. Run the API:
   ```bash
   dotnet run --launch-profile http
   ```
   The backend will listen on `http://localhost:5075`.
   - Swagger / OpenAPI documentation is available at `http://localhost:5075/swagger`.
   - Health check endpoint is at `http://localhost:5075/api/v1/health`.

### Frontend Setup (React + Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional, defaults to local proxy):
   ```bash
   cp .env.example .env
   ```

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run at `http://localhost:5180`.

5. Build for production:
   ```bash
   npm run build
   ```

---

## 4. Key Functional Modules

### 1. Unified Dashboard
- Visualizes key business metrics calculated directly from the database:
  - Total Schools, Visited Schools, Unassigned Schools, Overdue Follow-ups, Demos & Proposals.
  - Active pipeline breakdown across all 11 sales stages.
  - Representative leaderboard ranking discoveries, assignments, visits, and wins.

### 2. School Management & Dedicated Workspace
Every school has an interactive multi-tab workspace:
- **Profile**: Full contact details, address, school type, lead source, assigned rep.
- **Contacts**: Multiple decision makers and contacts with primary contact designation.
- **Discovery**: Structured assessment questionnaire divided into **ROOTACA Smart School** (SIS, LMS, bus tracking, parent engagement) and **ROOTACA Academy** (after-school coding, STEM courses, robotics competitions).
- **Presentation**: Custom sales pitch deck viewer with fullscreen presentation mode.
- **Objections**: FAQ and objection battlecard library with toggleable "Customer-Facing Mode" that strips internal notes.
- **Visits**: Field visit audit log recording outcomes, attendees, and auto-transitioning the sales stage.
- **Activities & Follow-ups**: Action items, phone calls, WhatsApp notes, and reminders.

### 3. Sales Quotas & Achievement Engine
- Monthly and quarterly quotas per sales representative.
- Live system-calculated achievements:
  - Visited schools count.
  - Decision makers reached count.
  - Demos requested.
  - Proposals requested.
  - Deals closed.

### 4. Bilingual Arabic RTL / English LTR
- Seamless one-click language toggle across the top navigation bar.
- Automatically adjusts document direction (`dir="rtl"` vs `dir="ltr"`), icon positioning, and layout alignment.
