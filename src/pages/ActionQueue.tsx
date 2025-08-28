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
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  Filter,
  Play,
  Pause,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  FileText,
  UserCheck,
  Eye
} from "lucide-react"
import { mockActions, mockBulkActions, mockPatients } from "@/lib/mockData"
import { dutch, formatDutchDateTime } from "@/lib/dutch"
import type { ActionItem, BulkAction, ActionStatus, ActionType } from "@/types/actions"

interface ActionRowProps {
  action: ActionItem
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onViewDetails: () => void
  onApprove: () => void
  onReject: () => void
}

function ActionRow({ action, isSelected, onSelect, onViewDetails, onApprove, onReject }: ActionRowProps) {
  const patient = mockPatients.find(p => p.id === action.patientId)
  
  const getStatusBadge = (status: ActionStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200"><Clock className="h-3 w-3 mr-1" />In afwachting</Badge>
      case 'approved':
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><CheckCircle2 className="h-3 w-3 mr-1" />Goedgekeurd</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-200"><XCircle className="h-3 w-3 mr-1" />Afgewezen</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Voltooid</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Mislukt</Badge>
      case 'cancelled':
        return <Badge variant="secondary"><Pause className="h-3 w-3 mr-1" />Geannuleerd</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'sms_reminder': return <MessageSquare className="h-4 w-4" />
      case 'email_reminder': return <Mail className="h-4 w-4" />
      case 'phone_call': return <Phone className="h-4 w-4" />
      case 'letter': return <FileText className="h-4 w-4" />
      case 'book_appointment': return <Calendar className="h-4 w-4" />
      case 'escalate_to_gp': return <UserCheck className="h-4 w-4" />
      default: return <ClipboardCheck className="h-4 w-4" />
    }
  }
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-500 hover:bg-red-600">Urgent</Badge>
      case 'high':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Hoog</Badge>
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>
      case 'low':
        return <Badge variant="outline">Laag</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {getActionIcon(action.type)}
          <div>
            <div className="font-medium">{action.title}</div>
            <div className="text-sm text-muted-foreground">{action.description}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{patient?.firstName} {patient?.lastName}</div>
        <div className="text-sm text-muted-foreground">{patient?.bsn}</div>
      </TableCell>
      <TableCell>{getPriorityBadge(action.priority)}</TableCell>
      <TableCell>{getStatusBadge(action.status)}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDutchDateTime(action.createdAt)}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
          {action.status === 'pending' && (
            <>
              <Button size="sm" onClick={onApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Goedkeuren
              </Button>
              <Button variant="outline" size="sm" onClick={onReject} className="text-red-600 border-red-200 hover:bg-red-50">
                <XCircle className="h-3 w-3 mr-1" />
                Afwijzen
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

interface ActionDetailsDialogProps {
  action: ActionItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ActionDetailsDialog({ action, open, onOpenChange }: ActionDetailsDialogProps) {
  if (!action) return null
  
  const patient = mockPatients.find(p => p.id === action.patientId)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ClipboardCheck className="h-5 w-5" />
            <span>Actie Details</span>
          </DialogTitle>
          <DialogDescription>
            {action.title} voor {patient?.firstName} {patient?.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Action Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actie Informatie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span>
                  <div>{dutch.actionTypes[action.type]}</div>
                </div>
                <div>
                  <span className="font-medium">Prioriteit:</span>
                  <div>{action.priority === 'high' ? 'Hoog' : action.priority === 'medium' ? 'Medium' : 'Laag'}</div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div>{dutch.actionStatus[action.status]}</div>
                </div>
                <div>
                  <span className="font-medium">Geschatte duur:</span>
                  <div>{action.estimatedDuration || 0} minuten</div>
                </div>
                <div>
                  <span className="font-medium">Kosten:</span>
                  <div>€{action.cost?.toFixed(2) || '0.00'}</div>
                </div>
                <div>
                  <span className="font-medium">Aangemaakt:</span>
                  <div>{formatDutchDateTime(action.createdAt)}</div>
                </div>
              </div>
              <div>
                <span className="font-medium">Beschrijving:</span>
                <div className="mt-1 p-2 bg-muted rounded">{action.description}</div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Info */}
          {patient && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patiënt Informatie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Naam:</span>
                    <div>{patient.firstName} {patient.lastName}</div>
                  </div>
                  <div>
                    <span className="font-medium">BSN:</span>
                    <div>{patient.bsn}</div>
                  </div>
                  <div>
                    <span className="font-medium">Telefoon:</span>
                    <div>{patient.phone}</div>
                  </div>
                  <div>
                    <span className="font-medium">E-mail:</span>
                    <div>{patient.email || 'Niet beschikbaar'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Execution Results */}
          {action.executionResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uitvoering Resultaat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  {action.executionResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={action.executionResult.success ? 'text-green-600' : 'text-red-600'}>
                    {action.executionResult.message}
                  </span>
                </div>
                {action.executedAt && (
                  <div className="text-sm text-muted-foreground">
                    Uitgevoerd op: {formatDutchDateTime(action.executedAt)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface BulkActionCardProps {
  bulkAction: BulkAction
  onApprove: () => void
  onReject: () => void
}

function BulkActionCard({ bulkAction, onApprove, onReject }: BulkActionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'border-orange-200 bg-orange-50'
      case 'approved': return 'border-green-200 bg-green-50'
      case 'executing': return 'border-blue-200 bg-blue-50'
      case 'completed': return 'border-green-200 bg-green-50'
      case 'failed': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <Card className={`${getStatusColor(bulkAction.status)} border-2`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{bulkAction.name}</CardTitle>
          <Badge variant={bulkAction.status === 'pending_approval' ? 'outline' : 'secondary'}>
            {bulkAction.status === 'pending_approval' ? 'Wacht op goedkeuring' : 
             bulkAction.status === 'approved' ? 'Goedgekeurd' :
             bulkAction.status === 'executing' ? 'Wordt uitgevoerd' :
             bulkAction.status === 'completed' ? 'Voltooid' :
             bulkAction.status === 'failed' ? 'Mislukt' : bulkAction.status}
          </Badge>
        </div>
        <CardDescription>{bulkAction.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Totaal patiënten: <strong>{bulkAction.summary?.total || bulkAction.patientIds.length}</strong></span>
            <span>Type: <strong>{dutch.actionTypes[bulkAction.actionType]}</strong></span>
          </div>
          
          {bulkAction.summary && (
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="text-center p-2 bg-background rounded">
                <div className="font-semibold text-green-600">{bulkAction.summary.successful}</div>
                <div className="text-xs">Succesvol</div>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <div className="font-semibold text-red-600">{bulkAction.summary.failed}</div>
                <div className="text-xs">Mislukt</div>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <div className="font-semibold text-orange-600">{bulkAction.summary.pending}</div>
                <div className="text-xs">In afwachting</div>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <div className="font-semibold">{bulkAction.summary.total}</div>
                <div className="text-xs">Totaal</div>
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Aangemaakt: {formatDutchDateTime(bulkAction.createdAt)}
          </div>
          
          {bulkAction.status === 'pending_approval' && (
            <div className="flex space-x-2">
              <Button size="sm" onClick={onApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Goedkeuren
              </Button>
              <Button variant="outline" size="sm" onClick={onReject} className="text-red-600 border-red-200">
                <XCircle className="h-3 w-3 mr-1" />
                Afwijzen
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ActionQueue() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const filteredActions = useMemo(() => {
    return mockActions.filter(action => {
      const patient = mockPatients.find(p => p.id === action.patientId)
      const matchesSearch = searchTerm === "" || 
        action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === "all" || action.status === statusFilter
      const matchesType = typeFilter === "all" || action.type === typeFilter
      
      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchTerm, statusFilter, typeFilter])

  const actionStats = useMemo(() => {
    const stats = { pending: 0, approved: 0, completed: 0, total: mockActions.length }
    mockActions.forEach(action => {
      if (action.status === 'pending') stats.pending++
      else if (action.status === 'approved') stats.approved++
      else if (action.status === 'completed') stats.completed++
    })
    return stats
  }, [])

  const handleSelectAction = (actionId: string, checked: boolean) => {
    if (checked) {
      setSelectedActions(prev => [...prev, actionId])
    } else {
      setSelectedActions(prev => prev.filter(id => id !== actionId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedActions(filteredActions.map(a => a.id))
    } else {
      setSelectedActions([])
    }
  }

  const handleViewAction = (action: ActionItem) => {
    setSelectedAction(action)
    setDetailsOpen(true)
  }

  const handleApproveAction = (actionId: string) => {
    // This would call an API to approve the action
    console.log(`Approving action: ${actionId}`)
  }

  const handleRejectAction = (actionId: string) => {
    // This would call an API to reject the action
    console.log(`Rejecting action: ${actionId}`)
  }

  const handleApproveBulkAction = (bulkActionId: string) => {
    console.log(`Approving bulk action: ${bulkActionId}`)
  }

  const handleRejectBulkAction = (bulkActionId: string) => {
    console.log(`Rejecting bulk action: ${bulkActionId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{dutch.actionQueue}</h1>
          <p className="text-muted-foreground">
            Overzicht van wachtende acties die goedkeuring vereisen
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Acties</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{actionStats.total}</div>
              <p className="text-xs text-muted-foreground">Alle acties in systeem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Afwachting</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{actionStats.pending}</div>
              <p className="text-xs text-muted-foreground">Wachten op goedkeuring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goedgekeurd</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{actionStats.approved}</div>
              <p className="text-xs text-muted-foreground">Klaar voor uitvoering</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voltooid</CardTitle>
              <Play className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{actionStats.completed}</div>
              <p className="text-xs text-muted-foreground">Succesvol uitgevoerd</p>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Bulk Acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockBulkActions.map(bulkAction => (
              <BulkActionCard
                key={bulkAction.id}
                bulkAction={bulkAction}
                onApprove={() => handleApproveBulkAction(bulkAction.id)}
                onReject={() => handleRejectBulkAction(bulkAction.id)}
              />
            ))}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters en zoeken</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoek op titel, beschrijving of patiënt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="pending">In afwachting</SelectItem>
                  <SelectItem value="approved">Goedgekeurd</SelectItem>
                  <SelectItem value="completed">Voltooid</SelectItem>
                  <SelectItem value="rejected">Afgewezen</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle types</SelectItem>
                  <SelectItem value="sms_reminder">SMS herinnering</SelectItem>
                  <SelectItem value="email_reminder">E-mail herinnering</SelectItem>
                  <SelectItem value="phone_call">Telefonisch contact</SelectItem>
                  <SelectItem value="book_appointment">Afspraak inplannen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Selection Actions */}
        {selectedActions.length > 0 && (
          <Card className="mb-6 border-primary">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{selectedActions.length} geselecteerd</Badge>
                  <span className="text-sm text-muted-foreground">
                    Bulk acties beschikbaar
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Bulk goedkeuren
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    Bulk afwijzen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Acties overzicht ({filteredActions.length})</CardTitle>
            <CardDescription>
              Gesorteerd op prioriteit en aanmaakdatum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedActions.length === filteredActions.length && filteredActions.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Actie</TableHead>
                  <TableHead>Patiënt</TableHead>
                  <TableHead>Prioriteit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aangemaakt</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions.map((action) => (
                  <ActionRow
                    key={action.id}
                    action={action}
                    isSelected={selectedActions.includes(action.id)}
                    onSelect={(checked) => handleSelectAction(action.id, checked)}
                    onViewDetails={() => handleViewAction(action)}
                    onApprove={() => handleApproveAction(action.id)}
                    onReject={() => handleRejectAction(action.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Action Details Dialog */}
        <ActionDetailsDialog
          action={selectedAction}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      </div>
    </div>
  )
}