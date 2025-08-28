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

## Acceptance Criteria - Milestone 1 ✅

- [x] App runs locally with npm/yarn dev
- [x] Routes are configured and accessible
- [x] Global layout renders with navigation
- [x] Basic atomic components are available
- [x] Dutch localization is set up
- [x] Project structure follows atomic design principles

## Next Steps

The next milestones will implement:
1. Mock data and utilities
2. Dashboard with cohort table and filters
3. Patient detail views
4. Mass actions workflow
5. Audit logging
6. Final polish and accessibility refinements