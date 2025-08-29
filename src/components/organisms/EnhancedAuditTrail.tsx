import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  History,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  Undo2,
  Shield,
  FileText
} from 'lucide-react'
import { PathwayTemplate } from '../../types/pathway'
import { LocalOverride } from '../../utils/pathwayOverrides'
import { logUserAction } from '../../utils/storage'
import { nhgDeviationAnalyzer } from '../../utils/nhgDeviationAnalysis'
import { useUser } from '../../contexts/UserContext'
import { useLocale } from '../../contexts/LocaleContext'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'

interface AuditEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  templateId: string
  templateName: string
  changes: {
    field: string
    oldValue: any
    newValue: any
    stepId?: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    nhgCompliant: boolean
  }[]
  justification: string
  impact: {
    patientsAffected: number
    riskAssessment: string
    deviationsFromNHG: number
  }
  reversible: boolean
  reversed?: {
    timestamp: string
    by: string
    reason: string
  }
}

interface EnhancedAuditTrailProps {
  template?: PathwayTemplate
  override?: LocalOverride
  onRevertChange?: (auditId: string) => void
  showOnlyReversible?: boolean
}

function EnhancedAuditTrail({
  template,
  override,
  onRevertChange,
  showOnlyReversible = false
}: EnhancedAuditTrailProps) {
  const { user } = useUser()
  const { locale } = useLocale()
  
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [showReversedEntries, setShowReversedEntries] = useState(false)
  const [filter, setFilter] = useState<'all' | 'high-risk' | 'nhg-deviations'>('all')

  useEffect(() => {
    loadAuditEntries()
  }, [template])

  const loadAuditEntries = () => {
    // Mock audit logs for now - replace with actual getAuditLog when available
    const allAuditLogs: any[] = []
    
    // Transform audit logs into enhanced audit entries
    const enhancedEntries: AuditEntry[] = allAuditLogs
      .filter((log: any) => !template || log.templateId === template.id)
      .map((log: any) => ({
        id: log.id,
        timestamp: log.timestamp,
        userId: log.userId,
        userName: log.userName || 'Unknown User',
        action: log.actionType,
        templateId: log.templateId || '',
        templateName: log.templateName || '',
        changes: parseChanges(log.details),
        justification: log.details?.justification || '',
        impact: calculateImpact(log.details),
        reversible: isReversible(log.actionType, log.details),
        reversed: log.reversed
      }))
      .sort((a: AuditEntry, b: AuditEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setAuditEntries(enhancedEntries)
  }

  const parseChanges = (details: any): AuditEntry['changes'] => {
    if (!details?.changes) return []
    
    return details.changes.map((change: any) => ({
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      stepId: change.stepId,
      riskLevel: assessChangeRisk(change),
      nhgCompliant: isChangeNHGCompliant(change)
    }))
  }

  const assessChangeRisk = (change: any): 'low' | 'medium' | 'high' | 'critical' => {
    // Critical: Disabling required steps
    if (change.field === 'enabled' && change.newValue === false && 
        ['annual_review', 'hba1c_monitoring', 'complications_screening'].includes(change.stepId)) {
      return 'critical'
    }
    
    // High: Significant timing changes
    if (change.field === 'delay' && Math.abs(change.newValue - change.oldValue) > 90) {
      return 'high'
    }
    
    // Medium: Moderate changes
    if (change.field === 'delay' && Math.abs(change.newValue - change.oldValue) > 30) {
      return 'medium'
    }
    
    return 'low'
  }

  const isChangeNHGCompliant = (change: any): boolean => {
    if (!template || !override) return true
    
    const deviations = nhgDeviationAnalyzer.analyzeDeviations(template, override)
    return !deviations.some(d => d.field === change.field || d.field === change.stepId)
  }

  const calculateImpact = (details: any) => ({
    patientsAffected: details?.impact?.patientsAffected || 0,
    riskAssessment: details?.impact?.riskAssessment || 'Low',
    deviationsFromNHG: details?.impact?.deviationsFromNHG || 0
  })

  const isReversible = (action: string, details: any): boolean => {
    // Most pathway changes are reversible within a timeframe
    const reversibleActions = [
      'pathway_override_created',
      'pathway_step_modified',
      'pathway_timing_changed',
      'pathway_step_disabled'
    ]
    
    return reversibleActions.includes(action) && !details?.reversed
  }

  const handleRevertChange = async (auditId: string, reason: string) => {
    const entry = auditEntries.find(e => e.id === auditId)
    if (!entry || !entry.reversible) return

    try {
      // Log the reversal action
      await logUserAction('audit_entry_reversed', {
        originalAuditId: auditId,
        revertedBy: user.id,
        revertReason: reason,
        timestamp: new Date().toISOString()
      })

      // Update the entry as reversed
      setAuditEntries(prev => prev.map(e => 
        e.id === auditId 
          ? {
              ...e,
              reversed: {
                timestamp: new Date().toISOString(),
                by: user.name,
                reason
              }
            }
          : e
      ))

      // Call parent handler if provided
      if (onRevertChange) {
        onRevertChange(auditId)
      }
    } catch (error) {
      console.error('Failed to revert change:', error)
    }
  }

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId)
    } else {
      newExpanded.add(entryId)
    }
    setExpandedEntries(newExpanded)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'pathway_override_created': return <FileText className="w-4 h-4" />
      case 'pathway_step_modified': return <Shield className="w-4 h-4" />
      case 'pathway_published': return <CheckCircle className="w-4 h-4" />
      default: return <History className="w-4 h-4" />
    }
  }

  const getActionColor = (entry: AuditEntry) => {
    if (entry.reversed) return 'text-gray-500'
    
    const hasHighRiskChanges = entry.changes.some(c => 
      c.riskLevel === 'critical' || c.riskLevel === 'high'
    )
    
    if (hasHighRiskChanges) return 'text-red-600'
    if (entry.changes.some(c => !c.nhgCompliant)) return 'text-orange-600'
    return 'text-green-600'
  }

  const filteredEntries = auditEntries.filter(entry => {
    if (entry.reversed && !showReversedEntries) return false
    
    if (showOnlyReversible && !entry.reversible) return false
    
    switch (filter) {
      case 'high-risk':
        return entry.changes.some(c => c.riskLevel === 'critical' || c.riskLevel === 'high')
      case 'nhg-deviations':
        return entry.changes.some(c => !c.nhgCompliant)
      default:
        return true
    }
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                <FormattedMessage id="audit.enhancedTrail" />
              </h3>
              <p className="text-sm text-gray-600">
                <FormattedMessage id="audit.reversibleChanges" />
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Changes</option>
              <option value="high-risk">High Risk Only</option>
              <option value="nhg-deviations">NHG Deviations</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReversedEntries(!showReversedEntries)}
            >
              {showReversedEntries ? <EyeOff /> : <Eye />}
              {showReversedEntries ? 'Hide' : 'Show'} Reversed
            </Button>
          </div>
        </div>
      </div>

      {/* Audit Entries */}
      <div className="p-6">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p><FormattedMessage id="audit.noEntries" /></p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`border rounded-lg p-4 ${
                  entry.reversed ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'
                }`}
              >
                {/* Entry Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getActionColor(entry)} bg-current/10`}>
                      {getActionIcon(entry.action)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          {entry.templateName}
                        </h4>
                        {entry.changes.some(c => c.riskLevel === 'critical') && (
                          <Badge variant="critical" size="sm">Critical</Badge>
                        )}
                        {entry.changes.some(c => c.riskLevel === 'high') && (
                          <Badge variant="warning" size="sm">High Risk</Badge>
                        )}
                        {entry.reversed && (
                          <Badge variant="default" size="sm">Reversed</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {entry.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(entry.timestamp).toLocaleString(locale)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {entry.reversible && !entry.reversed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const reason = prompt('Reason for reverting this change:')
                          if (reason) handleRevertChange(entry.id, reason)
                        }}
                      >
                        <Undo2 className="w-4 h-4 mr-1" />
                        Revert
                      </Button>
                    )}
                    
                    <button
                      onClick={() => toggleExpanded(entry.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedEntries.has(entry.id) ? <ChevronDown /> : <ChevronRight />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedEntries.has(entry.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Changes */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Changes Made</h5>
                        <div className="space-y-2">
                          {entry.changes.map((change, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="flex items-center gap-2">
                                <strong>{change.field}:</strong>
                                <span className="text-gray-600">{change.oldValue}</span>
                                <span>→</span>
                                <span className={
                                  change.nhgCompliant ? 'text-green-600' : 'text-orange-600'
                                }>{change.newValue}</span>
                                {!change.nhgCompliant && (
                                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Impact & Justification */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Impact & Justification</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Patients Affected: {entry.impact.patientsAffected}</div>
                          <div>Risk Assessment: {entry.impact.riskAssessment}</div>
                          <div>NHG Deviations: {entry.impact.deviationsFromNHG}</div>
                          {entry.justification && (
                            <div className="mt-2">
                              <strong>Justification:</strong>
                              <p className="mt-1 italic">{entry.justification}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reversal Info */}
                    {entry.reversed && (
                      <div className="mt-4 p-3 bg-gray-100 rounded">
                        <div className="text-sm text-gray-700">
                          <strong>Reversed:</strong> {new Date(entry.reversed.timestamp).toLocaleString(locale)}
                          by {entry.reversed.by}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <strong>Reason:</strong> {entry.reversed.reason}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedAuditTrail