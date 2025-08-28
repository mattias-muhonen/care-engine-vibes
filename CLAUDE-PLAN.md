# Implementation Plan - Dutch GP Care Automation Engine POC

## 🎯 **Project Overview**
Creating a Proof of Concept for a care-automation engine that helps Dutch general practices identify and manage Type 2 diabetes patients falling outside NHG (Dutch GP guidelines) thresholds.

### **Technologies**
The POC will be a simple SPA web application built with React, React-router, Tailwind and Radix-ui.

### **Target Users**
- **POH-S** (Praktijkondersteuner Huisarts Somatiek) - Chronic Care Nurse
- **GP** (General Practitioner) - Medical approval authority
- **Practice Manager** - Oversight and configuration management

## 🏗️ **Phase 1: Foundation & Architecture**

### **Core Features (P0 - Must Have)**
1. **Dashboard Overview**
   - Risk-prioritized diabetes patient cohort
   - Color-coded urgency levels
   - Real-time data status indicators

2. **Action Queue**
   - Pending approvals for patient outreach
   - Appointment booking requests
   - Bulk approval/rejection capabilities

3. **Patient Details**
   - Lab results (HbA1c, glucose, cholesterol)
   - Visit history timeline
   - Suggested next actions

4. **Audit & Governance**
   - Full action traceability
   - User attribution logs
   - Emergency kill switch

### **Enhanced Features (P1 - Should Have)**
5. **Configuration Studio**
   - NHG threshold editor
   - Message template customization
   - Pathway workflow editor

6. **Reports & Analytics**
   - Practice performance metrics
   - Patient outcome tracking
   - Compliance reporting

## 🛠️ **Technical Implementation Strategy**

### **Technology Stack Alignment**
- ✅ **React 19 + TypeScript** - Complex medical UI with type safety
- ✅ **shadcn/ui** - Accessible components for healthcare compliance
- ✅ **Tailwind CSS** - Rapid Dutch-localized styling
- ✅ **Lucide Icons** - Medical and healthcare iconography
- ✅ **React Router** - Multi-view dashboard navigation

### **Application Structure**
```
src/
├── pages/
│   ├── Dashboard/           # Main cohort overview
│   ├── ActionQueue/         # Pending approvals
│   ├── PatientDetails/      # Individual patient view
│   ├── Configuration/       # Threshold & pathway editor
│   ├── AuditLog/           # Compliance & tracking
│   └── Reports/            # Analytics dashboard
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── medical/            # Medical-specific components
│   └── charts/             # Data visualization
├── lib/
│   ├── mockData.ts         # Patient & lab data
│   ├── riskAlgorithm.ts    # NHG-based scoring
│   └── dutch.ts            # Localization utilities
└── types/
    ├── patient.ts          # Medical data types
    ├── actions.ts          # Workflow types
    └── audit.ts            # Compliance types
```

## 📊 **Mock Data Strategy**

### **Patient Records** (20-30 fictional patients)
```typescript
interface Patient {
  id: string
  name: string
  bsn: string          // Dutch social security number
  dateOfBirth: Date
  address: DutchAddress
  riskLevel: 'high' | 'medium' | 'low'
  diabetesType: 'type2'
  lastVisit: Date
  nextDue: Date
  labResults: LabResult[]
  flags: PatientFlag[]
}
```

### **Lab Results** (NHG-compliant thresholds)
```typescript
interface LabResult {
  date: Date
  hba1c: number        // mmol/mol (NHG: <53 good, 53-63 acceptable, >64 action needed)
  glucose: number      // mmol/L
  cholesterol: number  // mmol/L
  bloodPressure: { systolic: number; diastolic: number }
  bmi: number
}
```

### **Risk Prioritization Algorithm**
- **High Risk**: HbA1c >70 mmol/mol + overdue >6 months
- **Medium Risk**: HbA1c 64-70 mmol/mol OR overdue 3-6 months  
- **Low Risk**: HbA1c 53-64 mmol/mol + overdue <3 months

## 🗓️ **Implementation Roadmap**

### **Week 1: Foundation Setup**
- [x] Analyze requirements from SPEC.md
- [x] Create implementation plan
- [ ] Restructure app for medical dashboard
- [ ] Create mock patient data with Dutch personas
- [ ] Set up basic routing structure

### **Week 2: Core Dashboard**
- [ ] Build patient cohort overview grid
- [ ] Implement risk-based color coding
- [ ] Add filtering and search capabilities
- [ ] Create patient detail modal

### **Week 3: Action Workflow**
- [ ] Build action queue interface
- [ ] Implement approval/rejection workflow
- [ ] Add bulk operations functionality
- [ ] Create message templates (Dutch)

### **Week 4: Configuration & Governance**
- [ ] Build threshold configuration interface
- [ ] Implement audit logging system
- [ ] Add kill switch functionality
- [ ] Create role-based access controls

### **Week 5: Polish & Demo Preparation**
- [ ] Complete Dutch localization
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Demo scenario scripting

## 🌍 **Dutch Localization Requirements**

### **UI Language**
- All interface text in Dutch
- Medical terminology (POH-S, huisarts, etc.)
- Date formats (DD-MM-YYYY)
- Number formats (European decimal comma)

### **Medical Terms**
- **HbA1c**: Hemoglobine A1c
- **Diabeteszorg**: Diabetes care
- **NHG-richtlijnen**: Dutch GP guidelines
- **Terugkomen**: Recall appointments
- **Zorgverlening**: Healthcare delivery

### **Sample Dutch Interface Elements**
```
"Diabetescohort Overzicht" - Diabetes Cohort Overview
"Wachtende Acties" - Pending Actions
"Patiënt Details" - Patient Details
"Auditlogboek" - Audit Log
"Configuratie" - Configuration
"Goedkeuren" - Approve
"Afwijzen" - Reject
"Noodstop" - Emergency Stop
```

## 📈 **Success Metrics for POC**

### **Functional Goals**
- POH-S can triage 50+ patients in <5 minutes
- Zero actions without explicit human approval
- 100% audit trail coverage
- <3s dashboard load time

### **Business Impact Demonstration**
- 30% time reduction in cohort triage simulation
- Clear pathway for 20% recall rate improvement
- Demonstrated NHG guideline compliance
- Scalability to 4,000 patients per practice

## 🔒 **Security & Compliance Considerations**

### **Data Privacy (GDPR/NEN7510)**
- No real PHI in POC (fictional data only)
- Consent status checks in workflow
- Role-based access patterns
- Audit trail immutability

### **Medical Safety**
- Human-in-the-loop for all actions
- Emergency pause functionality
- Clear action attribution
- NHG guideline references

## 🎯 **Demo Scenario Script**

### **POH-S Martine's Workflow**
1. **Login** → Dashboard shows 23 flagged diabetes patients
2. **Review** → High-risk patient: Jan de Vries (HbA1c 78, overdue 8 months)
3. **Action** → Approve SMS reminder + book lab appointment  
4. **Bulk** → Select 12 medium-risk patients for recall letters
5. **Audit** → Review sent messages and booked appointments
6. **Config** → Adjust HbA1c threshold from 64 to 58 mmol/mol

This POC will demonstrate the core value proposition: **reducing administrative overhead while maintaining clinical safety and compliance for Dutch general practices**.