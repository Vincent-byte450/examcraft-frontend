# MtihaniKenya ExamCraft – Full Stack System Documentation

## Overview

**ExamCraft** is a production-ready, full‑stack web platform developed by the MtihaniKenya engineering team to support **AI‑assisted examination creation, management, and delivery**. The system enables authenticated users to generate exams, manage questions and marking schemes, preview and download papers, and track exam-related metadata through a modern, performant web interface.

The platform is live at:

**[https://examcraft.mtihanikenya.co.ke](https://examcraft.mtihanikenya.co.ke)**

ExamCraft follows a decoupled architecture:

* **Frontend:** Vite + React application deployed as a **static site** on cPanel
* **Backend:** Node.js / Express API deployed on **Render**

This separation improves scalability, security, and operational simplicity.

---

## System Architecture

```
[ Browser ]
     |
     | HTTPS (JSON API)
     v
[ Static Frontend – cPanel ]
     |
     | API Requests
     v
[ Backend API – Render ]
     |
     | Data Persistence
     v
[ Database ]
```

* The frontend is built once and served as static assets (HTML, CSS, JS)
* All dynamic behavior (authentication, exam logic, persistence) is handled by the backend API
* Communication occurs over secured HTTP endpoints

---

## Frontend Application

### Overview

The frontend is a single‑page application responsible for user interaction, exam workflows, and UI state management. It is optimized for performance and delivered via static hosting.

### Technology Stack

* **Build Tool:** Vite
* **Framework:** React
* **Language:** TypeScript (with selective JSX components)
* **Styling:** Tailwind CSS, PostCSS
* **State Management:** React hooks
* **Hosting:** Static hosting on cPanel

---

### Frontend Project Structure

```
/
├── index.html
├── package.json
├── vite.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx
    ├── index.css
    └── components/
        ├── Auth.jsx
        ├── AIPoweredExamForm.jsx
        ├── AdBanner.jsx
        ├── exams/
        ├── questions/
        └── common/
```

---

### Key Frontend Modules

#### Authentication

* Handles login and session-aware UI rendering
* Integrates with backend authentication middleware

#### AI‑Powered Exam Creation

* Primary user workflow
* Collects exam parameters and submits them to backend AI endpoints

#### Exam Management

* Setup, edit, preview, download, and analytics views
* Modular components for maintainability

#### Shared UI Components

* Loading states, pagination, error handling, empty states

---

### Frontend Build & Deployment

```bash
npm install
npm run build
```

* Vite generates optimized static assets
* Output is uploaded to cPanel (`dist/` directory)
* No server‑side runtime is required

---

## Backend Application

### Overview

The backend is a RESTful API that powers all dynamic functionality in ExamCraft. It manages authentication, exam generation logic, persistence, validation, and business rules.

The backend is deployed as a managed service on **Render**.

---

### Backend Technology Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Authentication:** Middleware‑based token authentication
* **Data Models:** Mongoose / Schema‑based models
* **Hosting:** Render (managed Node service)

---

### Backend Project Structure

```
backend/
├── middleware/
│   ├── auth.js
│   └── validation.js
├── models/
│   ├── Exam.js
│   ├── Question.js
│   ├── Scheme.js
│   ├── Payment.js
│   └── syllabusSchema.js
├── routes/
├── controllers/
├── server.js / app.js
└── package.json
```

---

### Core Backend Domains

#### Authentication & Authorization

* Request authentication middleware
* Secures protected routes
* Enforces user‑level access control

#### Exams

* Exam creation and persistence
* Metadata storage (subject, level, structure)
* Association with questions and marking schemes

#### Questions

* Individual question storage
* Supports multiple question types
* Linked to exams and syllabi

#### Marking Schemes

* Stores grading logic and answer keys
* Linked to questions and exams

#### Payments (Extensible)

* Payment model included for future monetization
* Supports subscription or pay‑per‑exam workflows

---

### Backend Deployment (Render)

* Automatic builds from repository
* Environment variables managed via Render dashboard
* API served over HTTPS

---

## Environment Separation

| Layer    | Hosting Platform             | Notes                       |
| -------- | ---------------------------- | --------------------------- |
| Frontend | cPanel (Static)              | CDN‑friendly, fast delivery |
| Backend  | Render                       | Managed Node.js runtime     |
| Domain   | examcraft.mtihanikenya.co.ke | Public production site      |

---

## Security Considerations

* Backend routes protected via authentication middleware
* Frontend contains no secrets (static assets only)
* HTTPS enforced for all client‑server communication
* Clear separation between presentation and business logic

---

## Engineering Best Practices

* Decoupled frontend and backend
* Domain‑driven backend models
* Modular React component architecture
* Static‑first frontend deployment
* Scalable cloud hosting

---

## Future Enhancements

* API versioning
* Role‑based access control (RBAC)
* Advanced exam analytics
* Offline‑ready frontend enhancements
* Automated testing (API + UI)

---

## Conclusion

ExamCraft is a robust, scalable full‑stack platform built to support MtihaniKenya’s mission of improving access to high‑quality assessment tools. The combination of a static React frontend and a cloud‑hosted backend API ensures performance, reliability, and long‑term maintainability for production use.

## Environment Variables

Create a `.env` file (or copy from `.env.example`) and configure:

- `VITE_API_BASE_URL` (required): Base URL for the backend API (e.g. `https://api.example.com`).
- `VITE_FEATURE_ANALYTICS` (optional): Set to `true` to enable analytics integrations.
- `VITE_FEATURE_AI_ENDPOINTS` (optional): Set to `false` to disable AI-related endpoint usage.
- `VITE_ANALYTICS_ENDPOINT` (optional): Custom analytics ingestion endpoint.
- `VITE_AI_ENDPOINT` (optional): Custom AI endpoint override.

The app validates required variables at startup and throws a clear error in development if `VITE_API_BASE_URL` is missing.
