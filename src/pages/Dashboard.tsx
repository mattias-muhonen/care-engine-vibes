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
      <TableCell>
        {patient.lastVisit ? (
          <div className="space-y-1">
            <div>{formatDutchDate(patient.lastVisit)}</div>
            <div className="text-xs text-muted-foreground">
              {daysSinceLastVisit} dagen geleden
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Onbekend</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          {patient.flags.slice(0, 2).map((flag) => (
            <Badge key={flag.id} variant="outline" className="text-xs">
              {flag.type === 'high_hba1c' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {flag.type === 'overdue_hba1c' && <Clock className="h-3 w-3 mr-1" />}
              {flag.type === 'overdue_visit' && <Calendar className="h-3 w-3 mr-1" />}
              {flag.message.slice(0, 20)}...
            </Badge>
          ))}
          {patient.flags.length > 2 && (
            <Badge variant="outline">+{patient.flags.length - 2}</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          <Eye className="h-4 w-4 mr-1" />
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="medical-card group hover:scale-105">
          <CardHeader className="medical-card-header flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Totaal Patiënten</CardTitle>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {riskCounts.total}
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-2">Actieve diabetes patiënten</p>
          </CardContent>
        </Card>

        <Card className="medical-card group hover:scale-105">
          <CardHeader className="medical-card-header flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Hoog Risico</CardTitle>
            <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              {riskCounts.high}
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-2">Directe actie vereist</p>
          </CardContent>
        </Card>

        <Card className="medical-card group hover:scale-105">
          <CardHeader className="medical-card-header flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Gemiddeld Risico</CardTitle>
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {riskCounts.medium}
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-2">Monitoring nodig</p>
          </CardContent>
        </Card>

        <Card className="medical-card group hover:scale-105">
          <CardHeader className="medical-card-header flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Laag Risico</CardTitle>
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              {riskCounts.low}
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-2">Routine controle</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="medical-card">
        <CardHeader className="medical-card-header">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">Filters en zoeken</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="🔍 Zoek op naam of BSN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 text-base border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[240px] h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📊 Alle risiconiveaus</SelectItem>
                <SelectItem value="high">🔴 Hoog risico</SelectItem>
                <SelectItem value="medium">🟡 Gemiddeld risico</SelectItem>
                <SelectItem value="low">🟢 Laag risico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPatients.length > 0 && (
        <Card className="medical-card border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-blue-50">
          <CardContent className="py-6">
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
      <Card className="medical-card">
        <CardHeader className="medical-card-header">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold">Patiënten overzicht</div>
                <div className="text-sm font-medium text-primary">
                  {filteredPatients.length} van {mockPatients.length} patiënten
                </div>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="text-base">
            📊 Gesorteerd op risico niveau en urgentie voor optimale zorgcoördinatie
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-b-xl">
            <Table>
              <TableHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-border/30">
                <TableRow>
                  <TableHead className="w-12 font-semibold text-slate-700">
                    <Checkbox
                      checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">👤 Patiënt</TableHead>
                  <TableHead className="font-semibold text-slate-700">⚠️ Risico</TableHead>
                  <TableHead className="font-semibold text-slate-700">🩸 HbA1c</TableHead>
                  <TableHead className="font-semibold text-slate-700">📅 Laatste bezoek</TableHead>
                  <TableHead className="font-semibold text-slate-700">🔔 Waarschuwingen</TableHead>
                  <TableHead className="font-semibold text-slate-700">⚙️ Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                    isSelected={selectedPatients.includes(patient.id)}
                    onSelect={(checked) => handleSelectPatient(patient.id, checked)}
                    onViewDetails={() => handleViewPatient(patient)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
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