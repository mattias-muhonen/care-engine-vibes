import { useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Settings, AlertTriangle, Users, TrendingUp, Save, RotateCcw } from 'lucide-react'
import { SettingsStorage, AppSettings } from '../../utils/storage'
import patientsData from '../../mocks/patients.json'
import { Patient } from '../../utils/patientFilters'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'
import Toast from '../atoms/Toast'

interface PathwayStep {
  id: string
  name: string
  trigger: string
  action: string
  delay: number
  enabled: boolean
}

function Config() {
  const intl = useIntl()
  const [settings, setSettings] = useState<AppSettings>(SettingsStorage.getDefaultSettings())
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings)
  const [activeTab, setActiveTab] = useState<'thresholds' | 'pathways' | 'governance'>('thresholds')
  const [hasChanges, setHasChanges] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const patients = patientsData as Patient[]

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(tempSettings)
    setHasChanges(changed)
  }, [settings, tempSettings])

  const loadSettings = () => {
    const currentSettings = SettingsStorage.getSettings()
    setSettings(currentSettings)
    setTempSettings(currentSettings)
  }

  const saveSettings = () => {
    SettingsStorage.saveSettings(tempSettings)
    setSettings(tempSettings)
    setHasChanges(false)
    setToast({
      message: intl.formatMessage({ id: 'config.settings.saved' }),
      type: 'success'
    })
  }

  const resetSettings = () => {
    const defaultSettings = SettingsStorage.getDefaultSettings()
    setTempSettings(defaultSettings)
  }

  const calculateImpact = () => {
    const affectedPatients = patients.filter(patient => {
      if (!patient.vitals || patient.vitals.length === 0) return false
      const latestVitals = patient.vitals[patient.vitals.length - 1]
      return latestVitals.hba1c > tempSettings.hba1cThreshold
    })
    
    return {
      totalPatients: patients.length,
      affectedPatients: affectedPatients.length,
      percentage: Math.round((affectedPatients.length / patients.length) * 100)
    }
  }

  const impact = calculateImpact()

  const getPathwaySteps = (): PathwayStep[] => [
    {
      id: 'initial_outreach',
      name: intl.formatMessage({ id: 'config.pathway.initialOutreach.name' }),
      trigger: intl.formatMessage({ id: 'config.pathway.initialOutreach.trigger' }),
      action: intl.formatMessage({ id: 'config.pathway.initialOutreach.action' }),
      delay: 0,
      enabled: true
    },
    {
      id: 'followup_call',
      name: intl.formatMessage({ id: 'config.pathway.followupCall.name' }),
      trigger: intl.formatMessage({ id: 'config.pathway.followupCall.trigger' }),
      action: intl.formatMessage({ id: 'config.pathway.followupCall.action' }),
      delay: 7,
      enabled: true
    },
    {
      id: 'book_appointment',
      name: intl.formatMessage({ id: 'config.pathway.bookAppointment.name' }),
      trigger: intl.formatMessage({ id: 'config.pathway.bookAppointment.trigger' }),
      action: intl.formatMessage({ id: 'config.pathway.bookAppointment.action' }),
      delay: 1,
      enabled: tempSettings.autoBookingEnabled
    }
  ]

  const renderThresholds = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <FormattedMessage id="config.thresholds.title" />
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FormattedMessage id="config.thresholds.hba1c" />
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="50"
                max="90"
                step="1"
                value={tempSettings.hba1cThreshold}
                onChange={(e) => setTempSettings(prev => ({ ...prev, hba1cThreshold: parseInt(e.target.value) || 70 }))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">mmol/mol</span>
              <Badge variant="default" className="ml-2">
                <FormattedMessage id="config.thresholds.nhgDefault" />: 70 mmol/mol
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <FormattedMessage id="config.thresholds.hba1cDescription" />
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FormattedMessage id="config.thresholds.maxDailyActions" />
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                max="50"
                step="1"
                value={tempSettings.maxDailyActions}
                onChange={(e) => setTempSettings(prev => ({ ...prev, maxDailyActions: parseInt(e.target.value) || 10 }))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">
                <FormattedMessage id="config.thresholds.actionsPerDay" />
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <FormattedMessage id="config.thresholds.maxDailyActionsDescription" />
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={tempSettings.autoBookingEnabled}
                onChange={(e) => setTempSettings(prev => ({ ...prev, autoBookingEnabled: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                <FormattedMessage id="config.thresholds.autoBooking" />
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              <FormattedMessage id="config.thresholds.autoBookingDescription" />
            </p>
          </div>
        </div>
      </div>

      {/* Impact Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
          <h4 className="text-sm font-medium text-blue-900">
            <FormattedMessage id="config.impact.title" />
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">{impact.affectedPatients}</div>
            <div className="text-sm text-blue-700">
              <FormattedMessage id="config.impact.affectedPatients" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">{impact.percentage}%</div>
            <div className="text-sm text-blue-700">
              <FormattedMessage id="config.impact.percentage" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">{impact.totalPatients}</div>
            <div className="text-sm text-blue-700">
              <FormattedMessage id="config.impact.totalPatients" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPathways = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <FormattedMessage id="config.pathways.title" />
        </h3>
        
        <div className="space-y-4">
          {getPathwaySteps().map((step, index) => (
            <div key={step.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                    <p className="text-xs text-gray-500">{step.trigger}</p>
                  </div>
                </div>
                <Badge variant={step.enabled ? 'success' : 'default'}>
                  {step.enabled ? (
                    <FormattedMessage id="config.pathway.status.active" />
                  ) : (
                    <FormattedMessage id="config.pathway.status.disabled" />
                  )}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">
                    <FormattedMessage id="config.pathway.action" />:
                  </span>
                  <span className="ml-2 font-medium text-gray-900">{step.action}</span>
                </div>
                <div>
                  <span className="text-gray-500">
                    <FormattedMessage id="config.pathway.delay" />:
                  </span>
                  <span className="ml-2 font-medium text-gray-900">
                    {step.delay === 0 ? (
                      <FormattedMessage id="config.pathway.immediate" />
                    ) : (
                      <FormattedMessage id="config.pathway.days" values={{ count: step.delay }} />
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderGovernance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <FormattedMessage id="config.governance.title" />
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              {settings.killSwitchActive ? (
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              ) : (
                <Settings className="w-6 h-6 text-green-600 mr-3" />
              )}
              <div>
                <div className="font-medium text-gray-900">
                  <FormattedMessage id="config.governance.killSwitch" />
                </div>
                <div className="text-sm text-gray-500">
                  {settings.killSwitchActive ? (
                    <FormattedMessage id="config.governance.killSwitchActive" />
                  ) : (
                    <FormattedMessage id="config.governance.killSwitchInactive" />
                  )}
                </div>
              </div>
            </div>
            <Badge variant={settings.killSwitchActive ? 'critical' : 'success'}>
              {settings.killSwitchActive ? (
                <FormattedMessage id="config.governance.status.active" />
              ) : (
                <FormattedMessage id="config.governance.status.normal" />
              )}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">
                <FormattedMessage id="config.governance.auditRetention" />
              </div>
              <div className="text-sm text-gray-600">
                <FormattedMessage id="config.governance.auditRetentionDescription" />
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">
                <FormattedMessage id="config.governance.dataPrivacy" />
              </div>
              <div className="text-sm text-gray-600">
                <FormattedMessage id="config.governance.dataPrivacyDescription" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <FormattedMessage id="config.title" />
          </h1>
          <p className="text-gray-600 mt-1">
            <FormattedMessage id="config.description" />
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={resetSettings}>
              <RotateCcw className="w-4 h-4 mr-2" />
              <FormattedMessage id="config.reset" />
            </Button>
            <Button onClick={saveSettings} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              <FormattedMessage id="config.save" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'thresholds', labelId: 'config.tabs.thresholds', icon: TrendingUp },
            { key: 'pathways', labelId: 'config.tabs.pathways', icon: Users },
            { key: 'governance', labelId: 'config.tabs.governance', icon: Settings }
          ].map(({ key, labelId, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              <FormattedMessage id={labelId} />
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'thresholds' && renderThresholds()}
      {activeTab === 'pathways' && renderPathways()}
      {activeTab === 'governance' && renderGovernance()}

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

export default Config