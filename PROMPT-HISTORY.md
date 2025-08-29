# PROMPT-HISTORY.md

## 2025-08-28

### Prompt 1
Read SPEC.md and CLAUDE-PLAN.md. If necessary edit the PLAN so that it's easier for you to follow.

### Prompt 2
Read CLAUDE.md file, these are the instructions you must follow always.

### Prompt 3
Why are you not writing all user prompts into a file called PROMPT-HISTORY.md?

### Prompt 4
Start implmenting the POC according to the milestones in the PLAN.

### Prompt 5
[Request interrupted by user for tool use]Just create the files in the root of this folder.

### Prompt 6
Continue to Milestone 2

### Prompt 7
Continue with milestone 3

### Prompt 8
Add a language toggle to the TopBar

### Prompt 9
Go over all texts and ensure that they have translations.

### Prompt 10
Continue with the milestones

### Prompt 11
Continue with Milestone 5

### Prompt 12
Please continue the conversation from where we left it off without asking the user any further questions. Continue with the last task that you were asked to work on.

### Prompt 13
Translations are not applied to mock data and Cohort Details.

### Prompt 14
cohortDetail.vitals.units is missin translation

### Prompt 15
You have not beend adding my prompts to PROMPT-HISTORY.md. Check what is missing and add them.

### Prompt 16
Choose a patient cohort dropdown is missing translations

### Prompt 17
Check all strings in Mass Actions and make sure they are translated.

### Prompt 18
cohorts.json is not translated

### Prompt 19
You are simply wrong. Now cohorts.json has only english texts. Add both locales to the json and use the selected locale in the UI.

### Prompt 20
Config route has just a placeholder text. Make the UI POC according to SPEC.md

### Prompt 21
Currently the UI offers functionality for the POH-S. Make the user selection have the two other roles. Changing roles should be reflected in the UI, check SPEC.md to see how they differ.

### Prompt 22
Please continue the conversation from where we left it off without asking the user any further questions. Continue with the last task that you were asked to work on.

### Prompt 23
Continue where you left off.

### Prompt 24
"Add a Pathway Templates Library to the Configuration section. Pre-load the library with NHG-default chronic care pathways: T2DM, hypertension, and asthma/COPD. Each template should be locked read-only at first, clearly marked 'NHG Default' with versioning info, summary tiles, and an edit badge (if ever locally modified)."

### Prompt 25
"Enable authorized practice users to create a 'Local Override' of any pathway template. Allow editing only on specific safe fields (e.g., visit intervals, step channels, optional step inclusion/exclusion). Show a side-by-side diff view: NHG Default vs. Local Override, highlight all deviations, and include 'Revert to Default' and 'Save with note' capabilities. Require justification and dual-approval for risky overrides (e.g., removing critical annual reviews)."

### Prompt 26
"On patient and cohort detail screens, add 'Assign Pathway' and 'Adjust Pathway' options. Per patient, permit only adjustment of scheduling (intervals/next due), temporary snooze/pause, or justified clinical exclusion (with required reason). For any exclusion of a critical step, display a confirmation modal and require countersign. Reflect all customizations in a patient audit trail."

### Prompt 27
Please continue the conversation from where we left it off without asking the user any further questions. Continue with the last task that you were asked to work on.

### Prompt 28
The patient cards in Cohort Details have a small eye icon to open patientdetails. Use a button so that it's more visible.

### Prompt 29
"Before publishing any configuration or override, display an 'Impact Preview' dialog: show the number of patients affected, changes in cohort size, system workload impact, and next due dates. Log all changes with: who made them, when, and justification. Provide an instant undo and change history view."

## 2025-08-29

### Prompt 30
"For any editable field, include a context-sensitive tooltip with rationale/clinical logic from NHG. Block pathways from saving if required steps or notification channels are missing. Allow only 'Save Draft', 'Request Review', and 'Publish' as states. Notify all practice users of published updates; highlight any NHG-to-local deviations in-app and in audit."

### Prompt 31
Add storybook for atoms, molecules and organisms.

### Prompt 32
Stories are not using the components in components/ folder. Make sure that stories do not create new components, just import existing ones.

### Prompt 33
"For any editable field, include a context-sensitive tooltip with rationale/clinical logic from NHG. Block pathways from saving if required steps or notification channels are missing. Allow only 'Save Draft', 'Request Review', and 'Publish' as states. Notify all practice users of published updates; highlight any NHG-to-local deviations in-app and in audit."

### Prompt 34
"Interfaces must always default to a safe, NHG-backed pathway and clearly indicate any local or patient-specific deviations. The pathway builder must be visual, step-based, never a blank canvas. All steps and customizations must be fully auditable, reversible, and show operational impact prior to publishing."