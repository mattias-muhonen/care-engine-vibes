# POC Implementation Plan — Dutch GP Care Automation Engine (PoC)

Goal
- Deliver a single-page React POC that demonstrates core flows described in SPEC.md: dashboard with cohort, cohort detail panel, patient detail view (read-only), mass actions flow (preview + approve + audit logging), and a simple audit log viewer. Use mock JSON data only.

Scope (MVP)
- UI-only SPA (no server rendering, no backend). All data from local JSON mock files.
- Routes: Dashboard, Mass Actions, Config (stub), Audit.
- Components: Left rail nav, top bar, tiles, cohort table with filters, cohort side panel, PatientDetail read-only, MassActions preview flow, AuditLog viewer.
- Non-functional: Accessibility (AAA color contrast), Dutch localization stubs, responsive layout, inline Tailwind styles only, atomic component usage.

Milestones
1. Project skeleton (1 day)
   - Create React app skeleton, routing, top bar, left nav, atomic component folder.
   - Add project README with run instructions.
   Acceptance: app starts, routes available, global layout renders.

2. Mock data + utilities (0.5 day)
   - Add JSON mock files: patients.json, cohorts.json, audit.json.
   - Add small utilities for date formatting and consent filtering.
   Acceptance: components can import mock JSON and render lists.

3. Dashboard and Cohort table (1.5 days)
   - Implement tiles and cohort table with filters (condition, risk, reason flagged, last contact).
   - Cohort row opens Cohort Details side panel.
   Acceptance: filterable table, side panel opens and shows patient list & rationale.

4. PatientDetail read-only and Vitals timeline (1 day)
   - Read-only demographics, consent, vitals timeline, pathway status, notes.
   Acceptance: Clicking patient from cohort opens PatientDetail panel.

5. Mass Actions flow (2 days)
   - Select cohort, preview message, pick mock slots, approve action → write to audit.json (client-side append emulation).
   - Success toast and Audit entry created.
   Acceptance: Approve action creates audit entry and shows success feedback.

6. AuditLog viewer & Governance controls (0.5 day)
   - Show audit entries with timestamps, user, and details. Implement kill-switch UI toggle (client-side state).
   Acceptance: Audit entries show actions; kill-switch toggles automation state.

7. Polish: localization, accessibility, styling, and README (1 day)
   - Wire react-intl placeholders; ensure color palette, hover rules, tailwind inline usage.
   Acceptance: Accessible color contrast, translations placeholders present, README updated.

Deliverables
- /src with components organized by atomic design.
- /mocks/*.json (patients.json, cohorts.json, audit.json).
- README with run steps, dev commands, and POC acceptance steps.
- Basic test notes (manual QA checklist).

Acceptance criteria (overall)
- App runs locally with npm/yarn dev.
- Dashboard shows cohort rows and opens cohort/patient details.
- Mass actions preview/approve generates audit entries.
- Audit viewer lists entries with user & timestamp.
- All UI uses inline Tailwind classes, atomic components, and has Dutch localization keys.

Risks & Mitigations
- No backend: persist audit only in-memory or localStorage for demo.
- EHR integrations — out of scope; use mock adapters and clearly mark stubs.
- Booking and messaging — mocked scheduling adapter; no external calls.

Next steps for Claude
- Follow GPT-CLAUDE-INSTRUCTIONS.md for coding constraints, file layout, and recommended component APIs.
- Create PRs per milestone with the acceptance checklist filled.
