# Dutch GP Care Automation Engine - POC

A React-based proof of concept for automating care workflows for Dutch general practice, focusing on Type 2 diabetes patient monitoring according to NHG guidelines.

## Features

- Dashboard with patient cohort overview
- Mass actions for bulk patient outreach
- Configuration management for clinical thresholds
- Complete audit logging and governance controls
- Dutch localization with react-intl
- Accessible design (AAA color contrast)
- Responsive layout for desktop and tablet

## Technology Stack

- React 18 with TypeScript
- React Router for navigation
- React Intl for localization
- Tailwind CSS for styling
- Radix UI for accessible components
- Lucide React for icons
- Vite for development and building

## Development

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) to view the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
  components/
    atoms/          # Basic UI elements (Button, Input, Badge)
    molecules/      # Composed components (TopBar, Navigation)
    organisms/      # Complex components (Layout, Tables, Forms)
    views/          # Page components (Dashboard, MassActions, etc.)
  i18n/             # Localization files
  mocks/            # Mock data (JSON files)
  utils/            # Utility functions
  routes.tsx        # Application routing
  App.tsx           # Root application component
```

## Implementation Status

### ✅ Milestone 1: Project Skeleton
- [x] App runs locally with npm/yarn dev
- [x] Routes are configured and accessible  
- [x] Global layout renders with navigation
- [x] Basic atomic components are available
- [x] Dutch localization is set up
- [x] Project structure follows atomic design principles

### ✅ Milestone 2: Mock Data & Utilities
- [x] JSON mock files: patients.json, cohorts.json, audit.json
- [x] Date formatting and utility functions
- [x] Patient filtering and cohort utilities
- [x] Storage utilities for audit logging and settings

### ✅ Milestone 3: Dashboard and Cohort Table
- [x] Dashboard with overview tiles showing patient metrics
- [x] Filterable cohort table with condition and priority filters
- [x] Cohort detail side panel with patient list
- [x] Search functionality for cohorts and patients

### ✅ Milestone 4: PatientDetail Read-only & Vitals Timeline
- [x] Comprehensive patient demographics display
- [x] Consent status tracking and visualization
- [x] Vitals timeline with color-coded HbA1c values
- [x] Care pathway status and clinical notes display

### ✅ Milestone 5: Mass Actions Flow
- [x] Multi-step mass action workflow (select cohort → configure → preview → confirm)
- [x] Message templating with patient name placeholders
- [x] Mock appointment slot selection
- [x] Confirmation dialogs and success notifications
- [x] Complete audit logging for mass actions

### ✅ Milestone 6: AuditLog Viewer & Governance Controls
- [x] Comprehensive audit log viewer with search and filtering
- [x] Kill-switch governance control with confirmation dialog
- [x] Export and clear audit log functionality
- [x] Detailed audit entry formatting for different action types
- [x] Toast notifications for user feedback

### ✅ Milestone 7: Final Polish & Accessibility
- [x] Complete Dutch/English localization (130+ translation keys)
- [x] AAA color contrast compliance
- [x] Screen reader friendly semantics
- [x] Responsive design for desktop and tablet
- [x] Consistent component styling and interactions
- [x] Language toggle with audit logging

## Core Features Implemented

### Dashboard
- Patient cohort overview with key metrics
- Interactive tiles showing total patients, active cohorts, high-risk patients
- Real-time filtering and search across cohorts
- Direct navigation to cohort and patient details

### Patient Management
- Complete patient demographic and clinical data display
- HbA1c timeline visualization with risk-based color coding
- Consent status tracking and care pathway monitoring
- Clinical notes and appointment history

### Mass Actions Workflow
- Bulk patient outreach with message templating
- Appointment scheduling with available time slot selection
- Preview and confirmation system with affected patient counts
- Comprehensive audit trail for all mass actions

### Audit & Governance
- Complete system activity logging with timestamps and user attribution
- Kill-switch functionality to disable all automation
- Searchable and filterable audit entries
- Export functionality for compliance and reporting
- Governance controls with confirmation workflows

### Internationalization
- Full Dutch localization as primary language
- English translation support
- Dynamic language switching with persistent preferences
- Cultural adaptations (BSN vs NHS numbers, Dutch date formats)

## Quality Assurance

### Accessibility
- AAA color contrast ratios throughout the application
- Screen reader compatible with proper ARIA labels
- Keyboard navigation support for all interactive elements
- Semantic HTML structure for assistive technologies

### Technical Standards
- TypeScript for type safety and better developer experience
- Atomic design pattern for maintainable component architecture
- Consistent styling with Tailwind CSS utility classes
- React best practices with hooks and functional components

## Demo Flow

1. **Start at Dashboard**: View patient cohorts and key metrics
2. **Explore Cohorts**: Click on a cohort to see patient details and filtering options
3. **Patient Details**: Click on a patient to view comprehensive clinical information
4. **Mass Actions**: Navigate to Mass Actions to simulate bulk patient outreach
5. **Governance**: Use the Audit page to monitor system activity and test the kill-switch
6. **Language Toggle**: Switch between Dutch and English to test localization

## Production Readiness

This POC demonstrates production-ready patterns for:
- **Security**: No hardcoded credentials, secure storage patterns, audit logging
- **Scalability**: Component architecture supports easy feature additions
- **Maintainability**: Clear separation of concerns, typed interfaces, documented components
- **Accessibility**: WCAG AAA compliance for inclusive design
- **Internationalization**: Proper i18n setup for multi-market deployment