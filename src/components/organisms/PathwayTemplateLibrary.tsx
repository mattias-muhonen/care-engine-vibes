import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { 
  FileText, 
  Lock, 
  Edit3, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  Settings,
  Zap,
  Shield
} from 'lucide-react'
import { useLocale } from '../../contexts/LocaleContext'
import { useUser, getUserRolePermissions } from '../../contexts/UserContext'
import { PathwayTemplate } from '../../types/pathway'
import { LocalOverride, LocalOverrideStorage } from '../../utils/pathwayOverrides'
import { nhgDeviationAnalyzer } from '../../utils/nhgDeviationAnalysis'
import { validatePathwayTemplate } from '../../utils/pathwayValidation'
import pathwayTemplatesData from '../../mocks/pathwayTemplates.json'
import PathwayOverrideEditor from './PathwayOverrideEditor'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'

interface PathwayTemplateLibraryProps {
  onSelectTemplate?: (template: PathwayTemplate) => void
}

function PathwayTemplateLibrary(_props: PathwayTemplateLibraryProps) {
  const { locale } = useLocale()
  const { user } = useUser()
  const permissions = getUserRolePermissions(user.role)
  const [selectedTemplate, setSelectedTemplate] = useState<PathwayTemplate | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'detail' | 'edit'>('grid')
  const [localOverrides, setLocalOverrides] = useState<LocalOverride[]>([])
  const [editingOverride, setEditingOverride] = useState<LocalOverride | null>(null)

  const templates = pathwayTemplatesData as unknown as PathwayTemplate[]

  useEffect(() => {
    // Load local overrides from storage
    setLocalOverrides(LocalOverrideStorage.getOverrides())
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }


  const handleViewTemplate = (template: PathwayTemplate) => {
    setSelectedTemplate(template)
    setViewMode('detail')
  }

  const handleCloseDetail = () => {
    setSelectedTemplate(null)
    setEditingOverride(null)
    setViewMode('grid')
  }

  const handleCreateOverride = (template: PathwayTemplate) => {
    setSelectedTemplate(template)
    setEditingOverride(null)
    setViewMode('edit')
  }

  const handleEditOverride = (template: PathwayTemplate) => {
    const existingOverride = localOverrides.find(o => o.originalTemplateId === template.id)
    setSelectedTemplate(template)
    setEditingOverride(existingOverride || null)
    setViewMode('edit')
  }

  const handleSaveOverride = (override: LocalOverride) => {
    setLocalOverrides(prev => {
      const existing = prev.findIndex(o => o.id === override.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = override
        return updated
      } else {
        return [...prev, override]
      }
    })
    handleCloseDetail()
  }


  const renderTemplateGrid = () => (
    <div className="space-y-6">
      {/* Safety-First Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">
              <FormattedMessage id="pathwayLibrary.safetyFirst" />
            </h3>
            <p className="text-sm text-green-800">
              <FormattedMessage id="pathwayLibrary.nhgDefaults" />
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            <FormattedMessage id="pathwayLibrary.title" />
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            <FormattedMessage id="pathwayLibrary.subtitle" />
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="success" className="flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            {templates.filter(t => t.isNHGDefault && !localOverrides.some(o => o.originalTemplateId === t.id)).length} NHG Compliant
          </Badge>
          <Badge variant="warning" className="flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {localOverrides.length} Modified
          </Badge>
          <Badge variant="default" className="flex items-center">
            <FileText className="w-3 h-3 mr-1" />
            {templates.length} Total
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const hasOverride = localOverrides.some(o => o.originalTemplateId === template.id)
          const override = localOverrides.find(o => o.originalTemplateId === template.id)
          
          // Analyze deviations and validation for this override
          let deviations = []
          let overallRisk = 'safe'
          
          if (override) {
            deviations = nhgDeviationAnalyzer.analyzeDeviations(template, override)
            validatePathwayTemplate(template, override) // For side effects, not storing result
            
            const criticalCount = deviations.filter(d => d.riskLevel === 'critical').length
            const highCount = deviations.filter(d => d.riskLevel === 'high').length
            
            if (criticalCount > 0) overallRisk = 'critical'
            else if (highCount > 0) overallRisk = 'high'
            else if (deviations.length > 0) overallRisk = 'medium'
          }
          
          return (
            <div
              key={template.id}
              className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-all ${
                overallRisk === 'critical' ? 'border-red-400 bg-red-50' :
                overallRisk === 'high' ? 'border-orange-400 bg-orange-50' :
                overallRisk === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                hasOverride ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {template.name[locale]}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {template.condition} • v{template.version}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  {/* NHG Default Badge - Always show prominently */}
                  {template.isNHGDefault && !hasOverride && (
                    <Badge variant="success" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      NHG Compliant
                    </Badge>
                  )}
                  
                  {/* Deviation Risk Indicators */}
                  {hasOverride && overallRisk === 'critical' && (
                    <Badge variant="critical" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Critical Risk
                    </Badge>
                  )}
                  {hasOverride && overallRisk === 'high' && (
                    <Badge variant="warning" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      High Risk
                    </Badge>
                  )}
                  {hasOverride && overallRisk === 'medium' && (
                    <Badge variant="warning" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Modified
                    </Badge>
                  )}
                  {hasOverride && overallRisk === 'safe' && (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Low Risk Override
                    </Badge>
                  )}
                  
                  {hasOverride && (
                    <Badge variant="default" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      <FormattedMessage id="pathwayLibrary.localOverride" />
                    </Badge>
                  )}
                  {override?.pendingApproval && (
                    <Badge variant="critical" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      <FormattedMessage id="pathwayLibrary.pendingApproval" />
                    </Badge>
                  )}
                </div>
              </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {template.description[locale]}
            </p>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {template.summary.totalSteps}
                </div>
                <div className="text-xs text-gray-500">
                  <FormattedMessage id="pathwayLibrary.steps" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {template.summary.avgDuration}
                </div>
                <div className="text-xs text-gray-500">
                  <FormattedMessage id="pathwayLibrary.duration" />
                </div>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(template.summary.priority)}`}>
                  <FormattedMessage id={`pathwayLibrary.priority.${template.summary.priority}`} />
                </div>
              </div>
            </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <FormattedMessage id="pathwayLibrary.createdBy" values={{ creator: template.createdBy }} />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewTemplate(template)}>
                    <Eye className="w-3 h-3 mr-1" />
                    <FormattedMessage id="pathwayLibrary.view" />
                  </Button>
                  {permissions.canConfigureThresholds && (
                    <>
                      {hasOverride ? (
                        <Button variant="outline" size="sm" onClick={() => handleEditOverride(template)}>
                          <Edit3 className="w-3 h-3 mr-1" />
                          <FormattedMessage id="pathwayLibrary.editOverride" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleCreateOverride(template)}>
                          <Zap className="w-3 h-3 mr-1" />
                          <FormattedMessage id="pathwayLibrary.createOverride" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderTemplateDetail = () => {
    if (!selectedTemplate) return null

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleCloseDetail}>
            ← <FormattedMessage id="pathwayLibrary.backToLibrary" />
          </Button>
          <div className="flex items-center space-x-2">
            {permissions.canConfigureThresholds && !selectedTemplate.isNHGDefault && (
              <Button variant="outline">
                <Edit3 className="w-4 h-4 mr-2" />
                <FormattedMessage id="pathwayLibrary.edit" />
              </Button>
            )}
            <Button variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              <FormattedMessage id="pathwayLibrary.duplicate" />
            </Button>
          </div>
        </div>

        {/* Template Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getConditionIcon(selectedTemplate.condition)}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedTemplate.name[locale]}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedTemplate.description[locale]}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {selectedTemplate.isNHGDefault && (
                <Badge variant="default">
                  <Lock className="w-3 h-3 mr-1" />
                  NHG Default v{selectedTemplate.version}
                </Badge>
              )}
              {selectedTemplate.isModified && (
                <Badge variant="warning">
                  <Edit3 className="w-3 h-3 mr-1" />
                  <FormattedMessage id="pathwayLibrary.locallyModified" />
                </Badge>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{selectedTemplate.summary.totalSteps}</div>
              <div className="text-sm text-gray-600"><FormattedMessage id="pathwayLibrary.totalSteps" /></div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{selectedTemplate.summary.avgDuration}</div>
              <div className="text-sm text-gray-600"><FormattedMessage id="pathwayLibrary.avgDuration" /></div>
            </div>
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedTemplate.summary.priority)}`}>
                <FormattedMessage id={`pathwayLibrary.priority.${selectedTemplate.summary.priority}`} />
              </div>
              <div className="text-sm text-gray-600 mt-1"><FormattedMessage id="pathwayLibrary.priority.label" /></div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{Object.keys(selectedTemplate.thresholds).length}</div>
              <div className="text-sm text-gray-600"><FormattedMessage id="pathwayLibrary.thresholds" /></div>
            </div>
          </div>

          {/* Thresholds */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              <FormattedMessage id="pathwayLibrary.clinicalThresholds" />
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(selectedTemplate.thresholds).map(([key, value]) => (
                <div key={key} className="p-3 border border-gray-200 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 capitalize">{key}</div>
                  <div className="text-lg font-semibold text-gray-700">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pathway Steps */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FormattedMessage id="pathwayLibrary.pathwaySteps" />
          </h3>
          <div className="space-y-4">
            {selectedTemplate.steps.map((step, index) => (
              <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{step.name[locale]}</h4>
                      <p className="text-sm text-gray-500">{step.trigger[locale]}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {step.automated && (
                      <Badge variant="success" className="text-xs">
                        <Settings className="w-3 h-3 mr-1" />
                        <FormattedMessage id="pathwayLibrary.automated" />
                      </Badge>
                    )}
                    <Badge variant={step.enabled ? 'success' : 'default'} className="text-xs">
                      {step.enabled ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      <FormattedMessage id={step.enabled ? 'pathwayLibrary.active' : 'pathwayLibrary.inactive'} />
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">
                      <FormattedMessage id="pathwayLibrary.action" />:
                    </span>
                    <span className="ml-2 text-gray-900">{step.action[locale]}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      <FormattedMessage id="pathwayLibrary.delay" />:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {step.delay === 0 ? (
                        <FormattedMessage id="pathwayLibrary.immediate" />
                      ) : step.delay === 1 ? (
                        <FormattedMessage id="pathwayLibrary.nextDay" />
                      ) : (
                        <FormattedMessage id="pathwayLibrary.days" values={{ count: step.delay }} />
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
  }

  return (
    <div>
      {viewMode === 'grid' && renderTemplateGrid()}
      {viewMode === 'detail' && renderTemplateDetail()}
      {viewMode === 'edit' && selectedTemplate && (
        <PathwayOverrideEditor
          originalTemplate={selectedTemplate}
          existingOverride={editingOverride}
          onClose={handleCloseDetail}
          onSave={handleSaveOverride}
        />
      )}
    </div>
  )
}

export default PathwayTemplateLibrary