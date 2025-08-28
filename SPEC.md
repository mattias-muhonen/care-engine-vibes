# Dutch GP Care Automation Engine

A care-automation engine for Dutch general practice that identifies patients with chronic Type 2 diabetes falling outside NHG (Dutch GP guidelines) thresholds, prioritizes them for timely intervention, and uses agentic workflows to automate outreach and booking. The MVP delivers configurable clinical thresholds and pathways, complete auditability, and human-in-the-loop controls, streamlining work and boosting safety for GPs and POH‑S.

## Technologies
This will be a Proof of Concept so a technically a simple SPA web application. It will be built with the following technologies:
- React
- React-router
- react-intl
- radix-ui
- lucide-react

Mock data will be required, that should be stored as json and imported directly into components that need the data.

## Development guidelines:
- Do not use server-rendering
- Use only inline tailwind styles
- Use atomic design principles when making components
- Always use the same atomic components in every view like buttons and inputs
- Fully translated Dutch-localized UI
- AAA color-contrast compliance, large click targets, screen-reader friendly
- Make a color palette which has a specific color for interactable elements as well as hover and active colors.
- Hover effects only change colors and borders
- Responsive for desktop, tablet


### Route/view details
- Left rail navigation with Dashboard, Mass Actions, Config, Audit, and a top bar with practice switcher and user menu.
- Dashboard route component with tiles for ‘Patients out of range’, ‘Overdue reviews’, ‘Actions queued’. Add a cohort table with filters for condition, risk, reason flagged, last contact.
- Cohort Details: a side panel that opens on cohort click, showing patient list and rationale.
- Build a read-only PatientDetail component showing demographics, consent, vitals timeline, pathway status, and notes.
- MassActions route component to select cohort, preview message, pick slots, and send actions (Approve, Edit, Change channel, Queue for call). Show success toast and log every action to Audit.
- AuditLog route component that records every user action with timestamp, user, and details.


## User Stories

### Personas:
- General Practitioner (GP)
- Praktijkondersteuner Huisarts Somatiek (POH‑S; Chronic Care Nurse)
- Practice Manager

#### GP
- As a GP, I want to see prioritized lists of high-risk diabetes patients, so that I can quickly co-sign necessary outreach and bookings.
- As a GP, I want clear audit trails for every automated action, so that I feel confident delegating workflows to the engine.

#### POH‑S
- As a POH‑S, I want to review and approve pre-drafted outreach to patients with overdue HbA1c or check-ups, so that I can save time and avoid mistakes.
- As a POH‑S, I want to configure thresholds based on NHG standards, so that I trust the system’s prioritization.
- As a POH‑S, I want to view, filter, and resolve all pending actions from one dashboard.

#### Practice Manager
- As a Practice Manager, I want to ensure our practice follows guideline-based recall processes, so that we remain audit-compliant.
- As a Practice Manager, I want actionable reports and settings to cap daily bookings or pause automation, so that staff are not overloaded.

## Functional Requirements

### Dashboard (Priority: P0 - Must)
- Cohort Overview: Display patients exceeding NHG diabetes care thresholds, prioritized by risk.
- Action Queue: List of patients with suggested/intermediate actions (outreach, booking) pending approval.
- Bulk Resolution: Multi-select for mass approval or pausing actions.

### Mass Actions (Priority: P0 - Must)
- Approve & Send Outreach: Human-in-the-loop review of messages/calls to patients.
- Auto-Book Appointments: Safe, rules-based appointment scheduling to available slots.
- Pause/Kill Switch: Emergency deactivation of automation for safety/overload.

### Config Studio (Priority: P1 - Should)
- Threshold Editor: Set or adjust cohort criteria (e.g., HbA1c > 64 mmol/mol).
- Pathway Editor: Configure outreach, escalation, and follow-up steps.
- Impact Preview: Inline estimate of affected patients before changes.

### Governance & Audit (Priority: P0 - Must)
- Full Audit Log: Track every action, trigger, and approval with user/time stamps.
- Incident Reporting: Flag and resolve actions or patients in error state.
- Role-Based Controls: Define approver, reviewer, and admin rights.

### Integrations (Priority: P0 - Must)
- HIS/EHR Adapters: Import and export to selected Dutch EHRs/practice systems.
- Scheduling Hook: Book into certified Dutch appointments modules.
- Messaging Gateway: Connect to secure SMS/email gateway (e.g., Medimo, Siilo).

## User Experience


### Entry Point & First-Time User Experience
- Users receive invite or instructions from platform admin or EHR partner.
- Secure authentication with enforced MFA; users select affiliated practice.
- Guided onboarding wizard: connect HIS (via OAuth/secure connection), select messaging and scheduling providers.
- System seeds with default NHG thresholds/pathway templates.
- Optional walkthrough highlights: dashboard, approval workflow, and settings.

### Core Experience
1. POH‑S/GP logs in, lands on dashboard with flagged diabetes cohort (out-of-threshold).
   - Highlights overdue HbA1c/lab visits, color-coded by risk.
   - Immediate validation: "Data up to date? Last lab feed import: [timestamp]."
2. User reviews prioritized patients; can filter by risk, age, last check-in, etc.
   - Clicking a patient brings up recent labs, visit summary, and suggested next action(s).
3. User selects mass actions or works a single-patient queue.
   - Approves customized, templated outreach (SMS/email/letter/call).
   - Validates appointment slots (booking preview, real-time conflict detection).
4. Approvals trigger live actions (messaging send, booking into schedule).
   - System confirms action and saves a structured note for EHR export.
5. User receives progress summary and follow-up reminders for unresponsive patients.

### Advanced Features & Edge Cases
- Kill switch to pause all automations (urgent safety override).
- Daily action cap (e.g., max bookings or outreach/day); user notified if limit reached.
- Consent check: outreach suppressed for patients lacking up-to-date consent.
- Lab feed delay: stale data warnings shown; actions blocked if critical data missing.
- Duplicate detection: suppress multiple bookings/messages for same patient within X days.
- Staged rollout: enable features for test patients before live launch.


## Narrative
Martine, a POH‑S at a busy practice in Rotterdam, faces an ever-growing list of diabetes patients who need monitoring according to NHG standards. With different lab intervals, patient histories, and unpredictable appointment demand, she struggles to keep the cohort up-to-date, risking missed recalls and under-documented care.

Upon using the Dutch GP Care Automation Engine, Martine authenticates and is greeted by a real-time dashboard. All diabetes patients falling outside target ranges are neatly tiered by urgency, with clear “why flagged” notes. Instead of manually writing messages and juggling calendars, Martine quickly reviews the system’s safe outreach drafts and approves them in bulk. Patients who need bookings are automatically scheduled into the practice's agenda, with conflict checks and reminders handled by the engine.

Martine now spends more time with her patients and less on administration, while her GP and the practice manager enjoy complete audit trails and configuration flexibility. With NHG defaults baked in and no risk of system error thanks to strong controls and safety nets, the team confidently meets KPIs, increases patient safety, and demonstrates compliance—crucial both for their practice and growing insurer interest in performance-based care.
