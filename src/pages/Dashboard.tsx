import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Users, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Filter, 
  Search, 
  Eye,
  Calendar,
  CheckCircle2
} from "lucide-react"
import { mockPatients } from "@/lib/mockData"
import { dutch, formatDutchDate, formatDutchNumber, getAgeFromBirthDate, getDaysBetween } from "@/lib/dutch"
import type { Patient, RiskLevel } from "@/types/patient"

interface PatientRowProps {
  patient: Patient
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onViewDetails: () => void
}

function PatientRow({ patient, isSelected, onSelect, onViewDetails }: PatientRowProps) {
  const age = getAgeFromBirthDate(patient.dateOfBirth)
  const latestLab = patient.labResults[0]
  const daysSinceLastVisit = patient.lastVisit ? getDaysBetween(patient.lastVisit) : null

  const getRiskBadgeColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'high': return 'risk-high'
      case 'medium': return 'risk-medium'
      case 'low': return 'risk-low'
    }
  }

  const getHbA1cStatus = (hba1c: number) => {
    if (hba1c < 53) return { color: 'text-emerald-600 font-semibold', status: 'Goed' }
    if (hba1c <= 63) return { color: 'text-amber-600 font-semibold', status: 'Acceptabel' }
    return { color: 'text-red-600 font-semibold', status: 'Actie nodig' }
  }

  const hba1cStatus = latestLab ? getHbA1cStatus(latestLab.hba1c) : null

  return (
    <TableRow className="table-row-hover border-b border-border/30">
      <TableCell>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={onSelect}
        />
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-semibold">{patient.firstName} {patient.lastName}</div>
            <div className="text-sm text-muted-foreground">{age} jaar • BSN: {patient.bsn.slice(-4)}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`status-indicator ${getRiskBadgeColor(patient.riskLevel)}`}>
          {dutch.riskLevels[patient.riskLevel]}
        </Badge>
      </TableCell>
      <TableCell>
        {latestLab ? (
          <div className="space-y-1">
            <div className={`font-semibold ${hba1cStatus?.color}`}>
              {latestLab.hba1c} mmol/mol
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDutchDate(latestLab.date)}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Geen data</span>
        )}
      </TableCell>
      <TableCell className="table-cell-padding">
        {patient.lastVisit ? (
          <div className="space-y-1">
            <div className="font-medium text-base" aria-label={`Laatste bezoek: ${formatDutchDate(patient.lastVisit)}`}>
              {formatDutchDate(patient.lastVisit)}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="sr-only">Dat is </span>{daysSinceLastVisit} dagen geleden
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground" aria-label="Laatste bezoek onbekend">Onbekend</span>
        )}
      </TableCell>
      <TableCell className="table-cell-padding">
        <div className="flex flex-wrap gap-2" role="list" aria-label="Waarschuwingen">
          {patient.flags.slice(0, 2).map((flag) => (
            <Badge 
              key={flag.id} 
              variant="outline" 
              className="text-sm px-3 py-1 inline-flex items-center gap-2" 
              role="listitem"
              aria-label={`Waarschuwing: ${flag.message}`}
            >
              {flag.type === 'high_hba1c' && <AlertTriangle className="h-3 w-3 icon-spacing-small" aria-hidden="true" />}
              {flag.type === 'overdue_hba1c' && <Clock className="h-3 w-3 icon-spacing-small" aria-hidden="true" />}
              {flag.type === 'overdue_visit' && <Calendar className="h-3 w-3 icon-spacing-small" aria-hidden="true" />}
              <span className="truncate">{flag.message.slice(0, 25)}{flag.message.length > 25 ? '...' : ''}</span>
            </Badge>
          ))}
          {patient.flags.length > 2 && (
            <Badge 
              variant="outline" 
              className="text-sm px-3 py-1" 
              role="listitem"
              aria-label={`En nog ${patient.flags.length - 2} waarschuwingen`}
            >
              +{patient.flags.length - 2}
            </Badge>
          )}
          {patient.flags.length === 0 && (
            <span className="text-sm text-muted-foreground" aria-label="Geen waarschuwingen">-</span>
          )}
        </div>
      </TableCell>
      <TableCell className="table-cell-padding">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewDetails}
          className="clickable-target btn-medical-secondary h-auto min-w-[100px]"
          aria-label={`Bekijk details van patiënt ${patient.firstName} ${patient.lastName}`}
        >
          <Eye className="h-4 w-4 icon-spacing" aria-hidden="true" />
          {dutch.view}
        </Button>
      </TableCell>
    </TableRow>
  )
}

interface PatientDetailsDialogProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PatientDetailsDialog({ patient, open, onOpenChange }: PatientDetailsDialogProps) {
  if (!patient) return null

  const age = getAgeFromBirthDate(patient.dateOfBirth)
  const latestLab = patient.labResults[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{patient.firstName} {patient.lastName}</span>
          </DialogTitle>
          <DialogDescription>
            {dutch.patientDetails} • {age} jaar • BSN: {patient.bsn}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patiëntgegevens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Geboortedatum:</span>
                  <div>{formatDutchDate(patient.dateOfBirth)}</div>
                </div>
                <div>
                  <span className="font-medium">Geslacht:</span>
                  <div>{patient.gender === 'M' ? 'Man' : 'Vrouw'}</div>
                </div>
                <div>
                  <span className="font-medium">Telefoon:</span>
                  <div>{patient.phone}</div>
                </div>
                <div>
                  <span className="font-medium">E-mail:</span>
                  <div>{patient.email || 'Niet beschikbaar'}</div>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Adres:</span>
                  <div>{patient.address.street} {patient.address.houseNumber}</div>
                  <div>{patient.address.postalCode} {patient.address.city}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medische informatie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Diabetes type:</span>
                  <div>Type 2</div>
                </div>
                <div>
                  <span className="font-medium">Diagnosedatum:</span>
                  <div>{formatDutchDate(patient.diagnosisDate)}</div>
                </div>
                <div>
                  <span className="font-medium">Risico niveau:</span>
                  <Badge className={patient.riskLevel === 'high' ? 'bg-red-500' : patient.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'}>
                    {dutch.riskLevels[patient.riskLevel]}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Hoofdbehandelaar:</span>
                  <div>{patient.primaryProvider === 'GP' ? 'Huisarts' : 'POH-S'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Latest Lab Results */}
          {latestLab && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Laatste laboratoriumuitslagen</CardTitle>
                <CardDescription>{formatDutchDate(latestLab.date)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>HbA1c:</span>
                    <span className={`font-semibold ${latestLab.hba1c > 64 ? 'text-red-600' : latestLab.hba1c > 53 ? 'text-orange-600' : 'text-green-600'}`}>
                      {latestLab.hba1c} mmol/mol
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Glucose:</span>
                    <span className="font-semibold">{formatDutchNumber(latestLab.glucose)} mmol/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cholesterol:</span>
                    <span className="font-semibold">{formatDutchNumber(latestLab.cholesterol)} mmol/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BMI:</span>
                    <span className="font-semibold">{formatDutchNumber(latestLab.bmi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bloeddruk:</span>
                    <span className="font-semibold">{latestLab.bloodPressure.systolic}/{latestLab.bloodPressure.diastolic} mmHg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>eGFR:</span>
                    <span className="font-semibold">{latestLab.egfr} mL/min/1.73m²</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patient Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Waarschuwingen</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.flags.length > 0 ? (
                <div className="space-y-2">
                  {patient.flags.map((flag) => (
                    <div key={flag.id} className="flex items-start space-x-2 p-2 border rounded">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-500" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{flag.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDutchDate(flag.createdAt)}
                        </div>
                      </div>
                      <Badge variant={flag.severity === 'high' ? 'destructive' : 'secondary'}>
                        {dutch.riskLevels[flag.severity]}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Geen actieve waarschuwingen</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [selectedPatients, setSelectedPatients] = useState<string[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const filteredPatients = useMemo(() => {
    return mockPatients.filter(patient => {
      const matchesSearch = searchTerm === "" || 
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.bsn.includes(searchTerm)
      
      const matchesRisk = riskFilter === "all" || patient.riskLevel === riskFilter
      
      return matchesSearch && matchesRisk
    })
  }, [searchTerm, riskFilter])

  const riskCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0, total: mockPatients.length }
    mockPatients.forEach(patient => {
      counts[patient.riskLevel]++
    })
    return counts
  }, [])

  const handleSelectPatient = (patientId: string, checked: boolean) => {
    if (checked) {
      setSelectedPatients(prev => [...prev, patientId])
    } else {
      setSelectedPatients(prev => prev.filter(id => id !== patientId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPatients(filteredPatients.map(p => p.id))
    } else {
      setSelectedPatients([])
    }
  }

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setDetailsOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary/10 via-blue-50 to-indigo-50 px-6 py-3 rounded-2xl border border-primary/20 shadow-sm">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {dutch.cohortOverview}
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Overzicht van diabetes patiënten die buiten de NHG-richtlijnen vallen en actieve monitoring vereisen
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive">
        <Card className="medical-card group" role="region" aria-labelledby="total-patients-title">
          <CardHeader className="medical-card-header flex flex-row items-center justify-between space-y-0">
            <CardTitle id="total-patients-title" className="text-base font-semibold text-slate-700">
              Totaal Patiënten
            </CardTitle>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg" aria-hidden="true">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="medical-card-content">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" aria-label="{riskCounts.total} totaal patiënten">
              {riskCounts.total}
            </div>
            <p className="text-base text-muted-foreground font-medium mt-3">Actieve diabetes patiënten</p>
          </CardContent>
        </Card>

        <Card className="medical-card group" role="region" aria-labelledby="high-risk-title">
          <CardHeader className="medical-card-header flex flex-row items-center justify-between space-y-0">
            <CardTitle id="high-risk-title" className="text-base font-semibold text-slate-700">
              Hoog Risico
            </CardTitle>
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg" aria-hidden="true">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="medical-card-content">
            <div className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent" aria-label="{riskCounts.high} patiënten met hoog risico">
              {riskCounts.high}
            </div>
            <p className="text-base text-muted-foreground font-medium mt-3">Directe actie vereist</p>
          </CardContent>
        </Card>

        <Card className="medical-card group" role="region" aria-labelledby="medium-risk-title">
          <CardHeader className="medical-card-header flex flex-row items-center justify-between space-y-0">
            <CardTitle id="medium-risk-title" className="text-base font-semibold text-slate-700">
              Gemiddeld Risico
            </CardTitle>
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg" aria-hidden="true">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="medical-card-content">
            <div className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent" aria-label="{riskCounts.medium} patiënten met gemiddeld risico">
              {riskCounts.medium}
            </div>
            <p className="text-base text-muted-foreground font-medium mt-3">Monitoring nodig</p>
          </CardContent>
        </Card>

        <Card className="medical-card group" role="region" aria-labelledby="low-risk-title">
          <CardHeader className="medical-card-header flex flex-row items-center justify-between space-y-0">
            <CardTitle id="low-risk-title" className="text-base font-semibold text-slate-700">
              Laag Risico
            </CardTitle>
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg" aria-hidden="true">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="medical-card-content">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent" aria-label="{riskCounts.low} patiënten met laag risico">
              {riskCounts.low}
            </div>
            <p className="text-base text-muted-foreground font-medium mt-3">Routine controle</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="medical-card" role="search" aria-labelledby="search-filters-title">
        <CardHeader className="medical-card-header">
          <CardTitle id="search-filters-title" className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg" aria-hidden="true">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Filters en zoeken</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="medical-card-content">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <label htmlFor="patient-search" className="sr-only">
                Zoek patiënten op naam of BSN
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="patient-search"
                  type="search"
                  placeholder="Zoek op naam of BSN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-12 text-base" 
                  aria-describedby="search-help"
                  autoComplete="off"
                />
              </div>
              <div id="search-help" className="text-sm text-muted-foreground mt-2">
                Typ om te zoeken naar patiëntnaam of BSN nummer
              </div>
            </div>
            <div className="w-full lg:w-[280px]">
              <label htmlFor="risk-filter" className="sr-only">
                Filter patiënten op risiconiveau
              </label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger id="risk-filter" className="form-input h-auto p-0" aria-describedby="filter-help">
                  <SelectValue placeholder="Selecteer risiconiveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle risiconiveaus</SelectItem>
                  <SelectItem value="high">Hoog risico</SelectItem>
                  <SelectItem value="medium">Gemiddeld risico</SelectItem>
                  <SelectItem value="low">Laag risico</SelectItem>
                </SelectContent>
              </Select>
              <div id="filter-help" className="text-sm text-muted-foreground mt-2">
                Filter de lijst op risiconiveau
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPatients.length > 0 && (
        <Card className="medical-card border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-blue-50" role="toolbar" aria-labelledby="bulk-actions-title">
          <CardContent className="medical-card-content">
            <h3 id="bulk-actions-title" className="text-lg font-semibold mb-4 text-primary">
              Bulk acties voor {selectedPatients.length} geselecteerde patiënten
            </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{selectedPatients.length} geselecteerd</Badge>
                  <span className="text-sm text-muted-foreground">
                    Bulk acties beschikbaar
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    SMS herinneringen
                  </Button>
                  <Button variant="outline" size="sm">
                    Afspraken inplannen
                  </Button>
                  <Button size="sm">
                    Acties maken
                  </Button>
                </div>
              </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Table */}
      <Card className="medical-card" role="region" aria-labelledby="patient-table-title">
        <CardHeader className="medical-card-header">
          <CardTitle id="patient-table-title" className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg" aria-hidden="true">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold">Patiënten overzicht</div>
                <div className="text-base font-medium text-primary" aria-live="polite">
                  {filteredPatients.length} van {mockPatients.length} patiënten getoond
                </div>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Gesorteerd op risico niveau en urgentie voor optimale zorgcoördinatie
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table role="table" aria-labelledby="patient-table-title" aria-describedby="patient-table-description">
            <div id="patient-table-description" className="sr-only">
              Tabel met patiëntgegevens inclusief risiconiveau, HbA1c waarden en laatste bezoekdatum. Gebruik tab om door de rijen te navigeren.
            </div>
            <TableHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-border/30">
              <TableRow role="row">
                <TableHead className="table-cell-padding w-16 font-semibold text-slate-700">
                  <Checkbox
                    checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecteer alle patiënten"
                    className="clickable-target"
                  />
                </TableHead>
                <TableHead className="table-cell-padding font-semibold text-slate-700 min-w-[200px]">Patiënt</TableHead>
                <TableHead className="table-cell-padding font-semibold text-slate-700 min-w-[120px]">Risico</TableHead>
                <TableHead className="table-cell-padding font-semibold text-slate-700 min-w-[140px]">HbA1c</TableHead>
                <TableHead className="table-cell-padding font-semibold text-slate-700 min-w-[150px]">Laatste bezoek</TableHead>
                <TableHead className="table-cell-padding font-semibold text-slate-700 min-w-[160px]">Waarschuwingen</TableHead>
                <TableHead className="table-cell-padding font-semibold text-slate-700 min-w-[120px]">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center space-y-4">
                      <Users className="h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
                      <div>
                        <p className="text-lg font-medium">Geen patiënten gevonden</p>
                        <p>Probeer uw zoekopdracht of filters aan te passen</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                    isSelected={selectedPatients.includes(patient.id)}
                    onSelect={(checked) => handleSelectPatient(patient.id, checked)}
                    onViewDetails={() => handleViewPatient(patient)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Patient Details Dialog */}
      <PatientDetailsDialog
        patient={selectedPatient}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  )
}