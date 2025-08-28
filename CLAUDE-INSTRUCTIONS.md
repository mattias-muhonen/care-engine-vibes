# .claude Implementation Instructions — Constraints & Tasks

Persona
- You are an designer-developer building a UI-only POC. Keep changes small and incremental. Commit and push per milestone. Create one commit per milestone.

Hard constraints (do not violate)
- No server-side rendering.
- Use React (functional components + hooks) + react-router.
- Use only inline Tailwind classes for styling (no separate CSS files).
- Follow atomic design: /src/components/atoms, /molecules, /organisms, /views.
- Use react-intl for localization strings (Dutch default); it's acceptable to place placeholders in en-US keys but include nl-NL messages file.
- Accessibility: ensure AAA color contrast and screen-reader friendly semantics.
- All data must come from JSON files under /mocks and imported directly.
- Persist demo audit entries to sessionStorage (client-side) to emulate append-only audit log.
- Write all user prompts to a file called PROMPT-HISTORY.md

Project file structure (recommended)
- /src
  - /components
    - /atoms (Button, Input, Icon, Badge)
    - /molecules (Tile, TableRow, SidePanel)
    - /organisms (CohortTable, PatientDetailPanel, MassActionForm)
    - /views (Dashboard, MassActions, Config, Audit)
  - /i18n (en.json, nl.json)
  - /mocks (patients.json, cohorts.json, audit.json)
  - /utils (formatDate.ts, storage.ts)
  - /routes.tsx
  - /App.tsx
- README.md

Mock data expectations
- patients.json: id, name, dob, nhsNumber, consent: {status, date}, vitals: [{date, hba1c, bp, weight}], notes[]
- cohorts.json: cohortId, name, filter, patientIds[], reason
- audit.json: [{id, timestamp, user, actionType, details}]

Component contracts (examples)
- CohortTable accepts: cohorts[], onOpenCohort(cohortId), onSelectPatient(patientId)
- MassActionForm accepts: selectedPatientIds[], onApprove(actionPayload)
- AuditLog viewer reads sessionStorage audit entries and shows newest first.

Development / run commands (example)
- npm install
- npm run dev
- npm run build

Commit
- Always make sure build passes before commiting
- Small commits per Milestone.
- PR title format: Claude: <short description>

Developer notes / tips
- Use lucide-react for icons.
- Use radix-ui primitives for accessible components where helpful.
- Keep hover effects limited to color/border changes only.
- Use atomic components everywhere and add components to atomic folders.
- Always add translation when adding texts
- For toasts use a minimal inline implementation (no external toast library unless already allowed).
- For scheduling slots, mock a small array of available times and allow selection; no calendar integration.
- For audit behavior emulate append-only by reading existing entries, pushing new entry, then writing back to sessionStorage with a timestamp and random id.

Example small task order for implementation
1. Init project and layout shell.
2. Add atoms (like Button, Icon wrapper, Page, Link, Title, Paragraph) and organisms (like Page, Navigation, Card)
3. Add mocks and utils.
4. Implement Dashboard view and CohortTable.
5. Implement CohortDetail side panel and PatientDetail.
6. Implement MassActions form and audit append to sessionStorage.
7. Implement Audit view and kill-switch UI.

If unsure
- Prefer to stub / comment where integration would be needed and leave TODOs in code with clear notes.
- Maintain a separate list of todos in TODO.md
- Keep changes minimal per PR and include a short demo README entry for testers.

End of instructions.
