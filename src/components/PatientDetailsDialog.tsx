// React import not required directly in this file (JSX runtime)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, Users } from "lucide-react"
import { CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { dutch, formatDutchDate, formatDutchNumber, getAgeFromBirthDate } from "@/lib/dutch"
import type { Patient } from "@/types/patient"

interface PatientDetailsDialogProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PatientDetailsDialog({ patient, open, onOpenChange }: PatientDetailsDialogProps) {
  if (!patient) return null

  const age = getAgeFromBirthDate(patient.dateOfBirth)
  const latestLab = patient.labResults[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Center the dialog content using flex utilities */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* rely on DialogContent's built-in centering; set width/padding only */}
        <DialogContent className="w-full max-w-4xl max-h-[80vh] overflow-y-auto p-6 pt-8 relative">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 pr-10">
              <Users className="h-5 w-5" />
              <span>{patient.firstName} {patient.lastName}</span>
            </DialogTitle>
            <DialogDescription>
              {dutch.patientDetails} • {age} jaar • BSN: {patient.bsn}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Info */}
            <Card className="bg-white border-border">
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
            <Card className="bg-white border-border">
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
              <Card className="bg-white border-border">
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
            <Card className="bg-white border-border">
              <CardHeader>
                <CardTitle className="text-lg">Waarschuwingen</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.flags.length > 0 ? (
                  <div className="space-y-2">
                    {patient.flags.map((flag) => (
                      <div key={flag.id} className="flex items-start space-x-2 p-3 border rounded">
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
      </div>
    </Dialog>
  )
}
