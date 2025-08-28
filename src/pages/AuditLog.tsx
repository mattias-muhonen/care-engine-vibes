import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Shield, 
  Eye, 
  Download, 
  Search,
  Filter,
  User as UserIcon,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react"
import { mockUsers, mockPatients } from "@/lib/mockData"
import { dutch, formatDutchDateTime, formatDutchDate } from "@/lib/dutch"
import type { AuditEvent, User as AuditUser, AuditEventType, ComplianceReport } from "@/types/audit"

// Generate mock audit events
const generateMockAuditEvents = (): AuditEvent[] => {
  const eventTypes: AuditEventType[] = [
    'patient_viewed',
    'action_created',
    'action_approved',
    'action_rejected',
    'action_executed',
    'bulk_action_created',
    'bulk_action_approved',
    'configuration_changed',
    'user_login',
    'user_logout'
  ]

  const events: AuditEvent[] = []
  
  // Generate events for the last 30 days
  for (let i = 0; i < 150; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)]
    const patient = Math.random() > 0.5 ? mockPatients[Math.floor(Math.random() * mockPatients.length)] : undefined
    
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    
    events.push({
      id: `audit_${i + 1}`,
      timestamp,
      eventType,
      userId: user.id,
      userRole: user.role,
      patientId: patient?.id,
      description: getEventDescription(eventType, user, patient),
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        sessionId: `session_${Math.random().toString(36).substr(2, 9)}`
      },
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
      success: Math.random() > 0.05, // 95% success rate
      errorMessage: Math.random() > 0.95 ? 'Netwerk timeout fout' : undefined
    })
  }
  
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

const getEventDescription = (eventType: AuditEventType, user: AuditUser, patient?: typeof mockPatients[0]): string => {
  switch (eventType) {
    case 'patient_viewed':
      return `${user.name} heeft patiënt ${patient?.firstName} ${patient?.lastName} bekeken`
    case 'action_created':
      return `${user.name} heeft een actie aangemaakt voor ${patient?.firstName} ${patient?.lastName}`
    case 'action_approved':
      return `${user.name} heeft een actie goedgekeurd voor ${patient?.firstName} ${patient?.lastName}`
    case 'action_rejected':
      return `${user.name} heeft een actie afgewezen voor ${patient?.firstName} ${patient?.lastName}`
    case 'action_executed':
      return `Systeem heeft actie uitgevoerd voor ${patient?.firstName} ${patient?.lastName}`
    case 'bulk_action_created':
      return `${user.name} heeft een bulk actie aangemaakt`
    case 'bulk_action_approved':
      return `${user.name} heeft een bulk actie goedgekeurd`
    case 'configuration_changed':
      return `${user.name} heeft systeemconfiguratie gewijzigd`
    case 'user_login':
      return `${user.name} heeft ingelogd`
    case 'user_logout':
      return `${user.name} heeft uitgelogd`
    default:
      return `${user.name} heeft een ${eventType} actie uitgevoerd`
  }
}

const mockAuditEvents = generateMockAuditEvents()

// Generate mock compliance report
const generateMockComplianceReport = (): ComplianceReport => {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  return {
    id: 'report_' + Date.now(),
    generatedAt: now,
    generatedBy: 'user_1',
    period: {
      startDate: thirtyDaysAgo,
      endDate: now
    },
    totalPatients: mockPatients.length,
    patientsTriaged: Math.floor(mockPatients.length * 0.8),
    actionsExecuted: 147,
    nhgComplianceRate: 94.2,
    actionsByType: {
      sms_reminder: 45,
      email_reminder: 38,
      phone_call: 28,
      letter: 22,
      book_appointment: 14,
      escalate_to_gp: 0
    },
    riskDistribution: {
      high: mockPatients.filter(p => p.riskLevel === 'high').length,
      medium: mockPatients.filter(p => p.riskLevel === 'medium').length,
      low: mockPatients.filter(p => p.riskLevel === 'low').length
    },
    averageResponseTime: 2.3,
    userEngagement: {
      'POH-S': 142,
      'GP': 38,
      'Practice_Manager': 12,
      'System': 0
    },
    auditTrailCompleteness: 100,
    consentCompliance: 97.8,
    dataRetentionCompliance: true
  }
}

const mockComplianceReport = generateMockComplianceReport()

interface AuditEventRowProps {
  event: AuditEvent
  onViewDetails: () => void
}

function AuditEventRow({ event, onViewDetails }: AuditEventRowProps) {
  const getEventIcon = (eventType: AuditEventType) => {
    switch (eventType) {
      case 'patient_viewed': return <Eye className="h-4 w-4" />
      case 'action_created': return <Activity className="h-4 w-4" />
      case 'action_approved': return <CheckCircle2 className="h-4 w-4" />
      case 'action_rejected': return <AlertTriangle className="h-4 w-4" />
      case 'user_login': return <UserIcon className="h-4 w-4" />
      case 'user_logout': return <UserIcon className="h-4 w-4" />
      case 'configuration_changed': return <Shield className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }
  
  const getEventColor = (eventType: AuditEventType, success: boolean) => {
    if (!success) return 'text-red-600'
    
    switch (eventType) {
      case 'action_approved': return 'text-green-600'
      case 'action_rejected': return 'text-orange-600'
      case 'configuration_changed': return 'text-blue-600'
      case 'user_login': return 'text-green-600'
      case 'user_logout': return 'text-gray-600'
      default: return 'text-foreground'
    }
  }

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className={`flex items-center space-x-2 ${getEventColor(event.eventType, event.success)}`}>
          {getEventIcon(event.eventType)}
          <span className="font-medium">
            {event.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{event.description}</div>
        {event.errorMessage && (
          <div className="text-sm text-red-600 mt-1">
            Fout: {event.errorMessage}
          </div>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{dutch.userRoles[event.userRole]}</Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDutchDateTime(event.timestamp)}
      </TableCell>
      <TableCell className="text-sm font-mono text-muted-foreground">
        {event.ipAddress}
      </TableCell>
      <TableCell>
        {event.success ? (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Succesvol
          </Badge>
        ) : (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Fout
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          <Eye className="h-3 w-3 mr-1" />
          Details
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function AuditLog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all")
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("7days")

  const filteredEvents = useMemo(() => {
    return mockAuditEvents.filter(event => {
      const matchesSearch = searchTerm === "" || 
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.userId.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesEventType = eventTypeFilter === "all" || event.eventType === eventTypeFilter
      const matchesUserRole = userRoleFilter === "all" || event.userRole === userRoleFilter
      
      let matchesDate = true
      if (dateFilter !== "all") {
        const now = new Date()
        const days = dateFilter === "1day" ? 1 : dateFilter === "7days" ? 7 : dateFilter === "30days" ? 30 : 0
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        matchesDate = event.timestamp >= cutoff
      }
      
      return matchesSearch && matchesEventType && matchesUserRole && matchesDate
    })
  }, [searchTerm, eventTypeFilter, userRoleFilter, dateFilter])

  const auditStats = useMemo(() => {
    const stats = { 
      total: mockAuditEvents.length, 
      today: 0, 
      errors: 0, 
      logins: 0 
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    mockAuditEvents.forEach(event => {
      if (event.timestamp >= today) stats.today++
      if (!event.success) stats.errors++
      if (event.eventType === 'user_login') stats.logins++
    })
    
    return stats
  }, [])

  const handleExportAuditLog = () => {
    console.log('Exporting audit log...')
    // This would trigger a CSV/PDF export
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{dutch.auditLog}</h1>
            <p className="text-muted-foreground">
              Volledig audittrail voor compliance en beveiliging
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportAuditLog}>
              <Download className="h-4 w-4 mr-2" />
              Exporteren
            </Button>
          </div>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Audit Events</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Rapport</TabsTrigger>
          </TabsList>

          {/* Audit Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totaal Events</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditStats.total}</div>
                  <p className="text-xs text-muted-foreground">Afgelopen 30 dagen</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vandaag</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{auditStats.today}</div>
                  <p className="text-xs text-muted-foreground">Events vandaag</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fouten</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{auditStats.errors}</div>
                  <p className="text-xs text-muted-foreground">Gefaalde acties</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Logins</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{auditStats.logins}</div>
                  <p className="text-xs text-muted-foreground">Gebruiker sessies</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Zoek in beschrijving..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle event types</SelectItem>
                      <SelectItem value="patient_viewed">Patiënt bekeken</SelectItem>
                      <SelectItem value="action_approved">Actie goedgekeurd</SelectItem>
                      <SelectItem value="action_rejected">Actie afgewezen</SelectItem>
                      <SelectItem value="user_login">Gebruiker login</SelectItem>
                      <SelectItem value="configuration_changed">Configuratie gewijzigd</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Gebruikersrol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle rollen</SelectItem>
                      <SelectItem value="GP">Huisarts</SelectItem>
                      <SelectItem value="POH-S">POH-S</SelectItem>
                      <SelectItem value="Practice_Manager">Praktijkmanager</SelectItem>
                      <SelectItem value="System">Systeem</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Periode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1day">Laatste 24 uur</SelectItem>
                      <SelectItem value="7days">Laatste 7 dagen</SelectItem>
                      <SelectItem value="30days">Laatste 30 dagen</SelectItem>
                      <SelectItem value="all">Alle tijd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Audit Events Table */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Events ({filteredEvents.length})</CardTitle>
                <CardDescription>
                  Chronologisch overzicht van alle systeemactiviteiten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Beschrijving</TableHead>
                      <TableHead>Gebruiker</TableHead>
                      <TableHead>Tijdstip</TableHead>
                      <TableHead>IP Adres</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.slice(0, 50).map((event) => (
                      <AuditEventRow
                        key={event.id}
                        event={event}
                        onViewDetails={() => console.log('View event details:', event.id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Report Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Compliance Overzicht</span>
                  </CardTitle>
                  <CardDescription>
                    Periode: {formatDutchDate(mockComplianceReport.period.startDate)} - {formatDutchDate(mockComplianceReport.period.endDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-accent/20 rounded">
                      <div className="text-2xl font-bold text-green-600">{mockComplianceReport.nhgComplianceRate}%</div>
                      <div className="text-sm text-muted-foreground">NHG Naleving</div>
                    </div>
                    <div className="text-center p-3 bg-accent/20 rounded">
                      <div className="text-2xl font-bold text-blue-600">{mockComplianceReport.auditTrailCompleteness}%</div>
                      <div className="text-sm text-muted-foreground">Audit Volledigheid</div>
                    </div>
                    <div className="text-center p-3 bg-accent/20 rounded">
                      <div className="text-2xl font-bold text-green-600">{mockComplianceReport.consentCompliance}%</div>
                      <div className="text-sm text-muted-foreground">Toestemming Naleving</div>
                    </div>
                    <div className="text-center p-3 bg-accent/20 rounded">
                      <div className="text-2xl font-bold text-purple-600">{mockComplianceReport.averageResponseTime}u</div>
                      <div className="text-sm text-muted-foreground">Gemiddelde Responstijd</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Patiënt Statistieken</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Totaal patiënten:</span>
                      <span className="font-semibold">{mockComplianceReport.totalPatients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Patiënten getrieerd:</span>
                      <span className="font-semibold">{mockComplianceReport.patientsTriaged}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Acties uitgevoerd:</span>
                      <span className="font-semibold">{mockComplianceReport.actionsExecuted}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Risico Verdeling</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-red-600">Hoog risico:</span>
                        <span className="font-semibold">{mockComplianceReport.riskDistribution.high}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-600">Medium risico:</span>
                        <span className="font-semibold">{mockComplianceReport.riskDistribution.medium}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Laag risico:</span>
                        <span className="font-semibold">{mockComplianceReport.riskDistribution.low}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Acties per Type</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(mockComplianceReport.actionsByType).map(([type, count]) => (
                    <div key={type} className="text-center p-3 bg-accent/20 rounded">
                      <div className="text-xl font-bold">{count}</div>
                      <div className="text-xs text-muted-foreground">
                        {dutch.actionTypes[type as keyof typeof dutch.actionTypes]}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Retention Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Data Bewaring Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-300">
                      Data Bewaring Conform Wetgeving
                    </span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    AVG Compliant
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Alle gegevens worden bewaard volgens Nederlandse privacywetgeving en NEN7510 standaarden.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}