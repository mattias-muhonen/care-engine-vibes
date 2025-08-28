A care-automation engine for Dutch general practice that identifies patients with chronic Type 2 diabetes falling outside NHG (Dutch GP guidelines) thresholds, prioritizes them for timely intervention, and uses agentic workflows to automate outreach and booking. The MVP delivers configurable clinical thresholds and pathways, complete auditability, and human-in-the-loop controls, streamlining work and boosting safety for GPs and POH‑S.
Goals
Business Goals
Achieve a 30% reduction in time spent on chronic cohort triage within 90 days of pilot.
Increase clinical recall rates for diabetes patients by at least 20% in first three months.
Convert 2+ pilot practices to paid within 90 days post-pilot.
Secure a letter of intent (LOI) with at least one insurer by pilot end.
Demonstrate at least 10% cost savings or capacity expansion versus current workflows.
User Goals
Rapid, risk-prioritized triaging of diabetes patients needing attention.
Minimized manual messaging and appointment booking overhead.
Full traceability and audit trails for clinical safety and accountability.
Clear notifications for urgent cases and eliminated alert fatigue.
Confidence in guideline adherence (NHG), with configurable flexibility.
Non-Goals
Diagnostic algorithm development or recommendations for care outside validated pathways.
Free-text prompt creation by users (all actions are templated, safe, auditable).
Multi-country or multi-language support beyond NL/Dutch in MVP.
Real-time bidirectional EHR updates beyond exporting structured notes/actions.
User Stories
Personas:
General Practitioner (GP)
Praktijkondersteuner Huisarts Somatiek (POH‑S; Chronic Care Nurse)
Practice Manager
GP
As a GP, I want to see prioritized lists of high-risk diabetes patients, so that I can quickly co-sign necessary outreach and bookings.
As a GP, I want clear audit trails for every automated action, so that I feel confident delegating workflows to the engine.
POH‑S
As a POH‑S, I want to review and approve pre-drafted outreach to patients with overdue HbA1c or check-ups, so that I can save time and avoid mistakes.
As a POH‑S, I want to configure thresholds based on NHG standards, so that I trust the system’s prioritization.
As a POH‑S, I want to view, filter, and resolve all pending actions from one dashboard.
Practice Manager
As a Practice Manager, I want to ensure our practice follows guideline-based recall processes, so that we remain audit-compliant.
As a Practice Manager, I want actionable reports and settings to cap daily bookings or pause automation, so that staff are not overloaded.
Functional Requirements
Dashboard (Priority: P0 - Must)
Cohort Overview: Display patients exceeding NHG diabetes care thresholds, prioritized by risk.
Action Queue: List of patients with suggested/intermediate actions (outreach, booking) pending approval.
Bulk Resolution: Multi-select for mass approval or pausing actions.
Mass Actions (Priority: P0 - Must)
Approve & Send Outreach: Human-in-the-loop review of messages/calls to patients.
Auto-Book Appointments: Safe, rules-based appointment scheduling to available slots.
Pause/Kill Switch: Emergency deactivation of automation for safety/overload.
Config Studio (Priority: P1 - Should)
Threshold Editor: Set or adjust cohort criteria (e.g., HbA1c > 64 mmol/mol).
Pathway Editor: Configure outreach, escalation, and follow-up steps.
Impact Preview: Inline estimate of affected patients before changes.
Governance & Audit (Priority: P0 - Must)
Full Audit Log: Track every action, trigger, and approval with user/time stamps.
Incident Reporting: Flag and resolve actions or patients in error state.
Role-Based Controls: Define approver, reviewer, and admin rights.
Integrations (Priority: P0 - Must)
HIS/EHR Adapters: Import and export to selected Dutch EHRs/practice systems.
Scheduling Hook: Book into certified Dutch appointments modules.
Messaging Gateway: Connect to secure SMS/email gateway (e.g., Medimo, Siilo).
User Experience
Entry Point & First-Time User Experience
Users receive invite or instructions from platform admin or EHR partner.
Secure authentication with enforced MFA; users select affiliated practice.
Guided onboarding wizard: connect HIS (via OAuth/secure connection), select messaging and scheduling providers.
System seeds with default NHG thresholds/pathway templates.
Optional walkthrough highlights: dashboard, approval workflow, and settings.
Core Experience
Step 1: POH‑S/GP logs in, lands on dashboard with flagged diabetes cohort (out-of-threshold).
Highlights overdue HbA1c/lab visits, color-coded by risk.
Immediate validation: "Data up to date? Last lab feed import: [timestamp]."
Step 2: User reviews prioritized patients; can filter by risk, age, last check-in, etc.
Clicking a patient brings up recent labs, visit summary, and suggested next action(s).
Step 3: User selects mass actions or works a single-patient queue.
Approves customized, templated outreach (SMS/email/letter/call).
Validates appointment slots (booking preview, real-time conflict detection).
Step 4: Approvals trigger live actions (messaging send, booking into schedule).
System confirms action and saves a structured note for EHR export.
Step 5: User receives progress summary and follow-up reminders for unresponsive patients.
Advanced Features & Edge Cases
Kill switch to pause all automations (urgent safety override).
Daily action cap (e.g., max bookings or outreach/day); user notified if limit reached.
Consent check: outreach suppressed for patients lacking up-to-date consent.
Lab feed delay: stale data warnings shown; actions blocked if critical data missing.
Duplicate detection: suppress multiple bookings/messages for same patient within X days.
Staged rollout: enable features for test patients before live launch.
UI/UX Highlights
Fully Dutch-localized UI and communication templates.
AAA color-contrast compliance, large click targets, screen-reader friendly.
“Why flagged?” hover/expanders on every out-of-threshold patient.
Risk tags clear and color-coded.
Preview windows before any action: user sees exactly which patients, messages, and bookings will be affected.
Undo and audit trail direct from dashboard.
Responsive for desktop, tablet, and universal Dutch practice devices.
Narrative
Martine, a POH‑S at a busy practice in Rotterdam, faces an ever-growing list of diabetes patients who need monitoring according to NHG standards. With different lab intervals, patient histories, and unpredictable appointment demand, she struggles to keep the cohort up-to-date, risking missed recalls and under-documented care.
Upon using the Dutch GP Care Automation Engine, Martine authenticates and is greeted by a real-time dashboard. All diabetes patients falling outside target ranges are neatly tiered by urgency, with clear “why flagged” notes. Instead of manually writing messages and juggling calendars, Martine quickly reviews the system’s safe outreach drafts and approves them in bulk. Patients who need bookings are automatically scheduled into the practice's agenda, with conflict checks and reminders handled by the engine.
Martine now spends more time with her patients and less on administration, while her GP and the practice manager enjoy complete audit trails and configuration flexibility. With NHG defaults baked in and no risk of system error thanks to strong controls and safety nets, the team confidently meets KPIs, increases patient safety, and demonstrates compliance—crucial both for their practice and growing insurer interest in performance-based care.
Success Metrics
Tracking Plan
cohort_generated
action_approved
action_rejected
booking_confirmed
message_sent
threshold_modified
pathway_published
audit_log_viewed
incident_flagged
kill_switch_activated
Technical Considerations
Technical Needs
Data Ingestion: Secure adapters for EHR/HIS import, delta updates, and batch jobs.
Rules Engine: NHG-parameterized engine running cohort definitions and safe pathways.
Agent Runtime: Manages workflow execution, escalation, human-in-loop review.
Messaging/Scheduling Adapters: Secure communication with certified Dutch scheduling and messaging partners.
Front-End: Web interface; accessible, responsive, Dutch-localized.
Audit Store: Immutable audit log (append-only; queryable for compliance).
Integration Points
HIS/EHRs: Start with CGM (CGM Huisarts), Promedico, and Medicom (pilot focus).
Schedulers: Topics/Afspraken.nl and Tetra Informatica modules.
Messaging: Medimo, Siilo or compatible Dutch-secure message providers.
Data Storage & Privacy
Data flows: EHR import → Rules engine → Agent action → Messaging/Scheduling → Audit/log export.
PHI encrypted at rest and in transit (TLS 1.2+).
Role-based access controls; least privilege for batch/agent processes.
No PII used outside NL/EU; full GDPR and NEN7510 adherence.
Explicit patient consent gating; no messaging to patients with incomplete/expired consent records.
Scalability & Performance
Designed for practice panel sizes: up to 4,000 per practice in MVP.
Daily automated actions: up to 100 per user/day.
Required latency: dashboard <3s load; <1.5s booking or message execution.
Support concurrent users: up to 10 per practice (POHs, GPs).
Potential Challenges
Integration: Variability in EHR/HIS APIs, schema differences, audit trails.
Governance: Config change safety, incident response, and controls for error overrides.
Adoption: Practices’ change management, resistance to semi-automation, training needs.
