import { useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { AlertTriangle, Shield, ShieldOff, Download, Trash2, User, Clock, Activity, Search } from 'lucide-react'
import { AuditLogger, SettingsStorage, AuditEntry, AppSettings } from '../../utils/storage'
import { formatDate } from '../../utils/formatDate'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'
import Toast from '../atoms/Toast'

function Audit() {
  const intl = useIntl()
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [settings, setSettings] = useState<AppSettings>(SettingsStorage.getDefaultSettings())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActionType, setSelectedActionType] = useState<string>('all')
  const [showKillSwitchConfirmation, setShowKillSwitchConfirmation] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setAuditEntries(AuditLogger.getAllEntries())
    setSettings(SettingsStorage.getSettings())
  }

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = searchQuery === '' || 
      entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(entry.details).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedActionType === 'all' || entry.actionType === selectedActionType

    return matchesSearch && matchesType
  })

  const actionTypes = Array.from(new Set(auditEntries.map(entry => entry.actionType)))

  const handleKillSwitchToggle = () => {
    if (settings.killSwitchActive) {
      // Deactivating - no confirmation needed
      const newState = SettingsStorage.toggleKillSwitch()
      setSettings(prev => ({ ...prev, killSwitchActive: newState }))
      setToast({
        message: intl.formatMessage({ id: 'audit.killSwitch.deactivated' }),
        type: 'success'
      })
    } else {
      // Activating - show confirmation
      setShowKillSwitchConfirmation(true)
    }
  }

  const confirmKillSwitchActivation = () => {
    const newState = SettingsStorage.toggleKillSwitch()
    setSettings(prev => ({ ...prev, killSwitchActive: newState }))
    setShowKillSwitchConfirmation(false)
    setToast({
      message: intl.formatMessage({ id: 'audit.killSwitch.activated' }),
      type: 'info'
    })
    loadData() // Reload to show the audit entry for kill switch activation
  }

  const exportAuditLog = () => {
    const dataStr = JSON.stringify(auditEntries, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `audit-log-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    setToast({
      message: intl.formatMessage({ id: 'audit.export.success' }),
      type: 'success'
    })
  }

  const clearAuditLog = () => {
    AuditLogger.clearEntries()
    loadData()
    setToast({
      message: intl.formatMessage({ id: 'audit.clear.success' }),
      type: 'info'
    })
  }

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'mass_action_executed':
      case 'mass_action_approved':
        return <Activity className="w-4 h-4" />
      case 'kill_switch_toggled':
        return settings.killSwitchActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />
      case 'patient_flagged':
        return <AlertTriangle className="w-4 h-4" />
      case 'language_changed':
        return <User className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getActionTypeBadgeColor = (actionType: string): 'default' | 'success' | 'warning' | 'critical' => {
    switch (actionType) {
      case 'mass_action_executed':
      case 'mass_action_approved':
        return 'success'
      case 'kill_switch_toggled':
        return settings.killSwitchActive ? 'critical' : 'success'
      case 'patient_flagged':
        return 'warning'
      case 'system_initialized':
        return 'success'
      default:
        return 'default'
    }
  }

  const formatActionDetails = (entry: AuditEntry) => {
    const { details } = entry

    switch (entry.actionType) {
      case 'mass_action_executed':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div><FormattedMessage id="audit.details.cohort" />: {details.cohortId}</div>
            <div><FormattedMessage id="audit.details.patients" />: {details.affectedPatients}</div>
            <div><FormattedMessage id="audit.details.actionType" />: {details.actionType}</div>
            {details.message && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <FormattedMessage id="audit.details.message" />: "{details.message}..."
              </div>
            )}
          </div>
        )
      case 'kill_switch_toggled':
        return (
          <div className="text-sm text-gray-600">
            <div><FormattedMessage id="audit.details.action" />: {details.action}</div>
            <div><FormattedMessage id="audit.details.status" />: {details.newState ? 'Geactiveerd' : 'Gedeactiveerd'}</div>
          </div>
        )
      case 'language_changed':
        return (
          <div className="text-sm text-gray-600">
            <div><FormattedMessage id="audit.details.from" />: {details.from}</div>
            <div><FormattedMessage id="audit.details.to" />: {details.to}</div>
          </div>
        )
      case 'patient_flagged':
        return (
          <div className="text-sm text-gray-600">
            <div><FormattedMessage id="audit.details.patient" />: {details.patientName || details.patientId}</div>
            <div><FormattedMessage id="audit.details.reason" />: {details.reason}</div>
            {details.priority && (
              <div><FormattedMessage id="audit.details.priority" />: {details.priority}</div>
            )}
          </div>
        )
      default:
        return (
          <div className="text-sm text-gray-600">
            {Object.entries(details).map(([key, value]) => (
              <div key={key}>{key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}</div>
            ))}
          </div>
        )
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          <FormattedMessage id="audit.title" />
        </h1>
        <p className="text-gray-600">
          <FormattedMessage id="audit.description" />
        </p>
      </div>

      {/* Governance Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          <FormattedMessage id="audit.governance.title" />
        </h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {settings.killSwitchActive ? (
              <ShieldOff className="w-6 h-6 text-red-600" />
            ) : (
              <Shield className="w-6 h-6 text-green-600" />
            )}
            <div>
              <div className="font-medium text-gray-900">
                <FormattedMessage id="audit.killSwitch.title" />
              </div>
              <div className="text-sm text-gray-600">
                {settings.killSwitchActive ? (
                  <FormattedMessage id="audit.killSwitch.status.active" />
                ) : (
                  <FormattedMessage id="audit.killSwitch.status.inactive" />
                )}
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleKillSwitchToggle}
            variant={settings.killSwitchActive ? 'secondary' : 'primary'}
            className={settings.killSwitchActive ? '' : 'bg-red-600 hover:bg-red-700 text-white'}
          >
            {settings.killSwitchActive ? (
              <FormattedMessage id="audit.killSwitch.deactivate" />
            ) : (
              <FormattedMessage id="audit.killSwitch.activate" />
            )}
          </Button>
        </div>
        
        {settings.killSwitchActive && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <div className="text-sm text-red-800">
                <FormattedMessage id="audit.killSwitch.warning" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            <FormattedMessage 
              id="audit.log.title"
              values={{ count: filteredEntries.length }}
            />
          </h2>
          
          <div className="flex space-x-2">
            <Button onClick={exportAuditLog} variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              <FormattedMessage id="audit.export.button" />
            </Button>
            <Button onClick={clearAuditLog} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              <FormattedMessage id="audit.clear.button" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={intl.formatMessage({ id: 'audit.search.placeholder' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">
              {intl.formatMessage({ id: 'audit.filter.allTypes' })}
            </option>
            {actionTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Audit Entries */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <div>
                <FormattedMessage id="audit.empty.title" />
              </div>
              <div className="text-sm mt-1">
                <FormattedMessage id="audit.empty.description" />
              </div>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getActionTypeIcon(entry.actionType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant={getActionTypeBadgeColor(entry.actionType)}>
                          {entry.actionType}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          <User className="w-3 h-3 inline mr-1" />
                          {entry.user}
                        </span>
                        <span className="text-sm text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                      
                      {formatActionDetails(entry)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Kill Switch Confirmation Dialog */}
      {showKillSwitchConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                <FormattedMessage id="audit.killSwitch.confirm.title" />
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              <FormattedMessage id="audit.killSwitch.confirm.message" />
            </p>
            
            <div className="flex space-x-3">
              <Button
                onClick={confirmKillSwitchActivation}
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <FormattedMessage id="audit.killSwitch.confirm.activate" />
              </Button>
              <Button
                onClick={() => setShowKillSwitchConfirmation(false)}
                variant="secondary"
                className="flex-1"
              >
                <FormattedMessage id="audit.killSwitch.confirm.cancel" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default Audit