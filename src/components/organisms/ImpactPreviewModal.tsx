import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { X, Users, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import { PathwayTemplate } from '../../types/pathway'
import { LocalOverride } from '../../utils/pathwayOverrides'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'

export interface ImpactPreviewData {
  changeType: 'pathway_override' | 'configuration_change' | 'threshold_update'
  changeName: string
  changeDescription: string
  affectedPatients: {
    total: number
    byRiskLevel: Record<string, number>
    byPathway: Record<string, number>
  }
  cohortImpact: {
    cohortSizeChanges: Array<{
      cohortId: string
      cohortName: string
      currentSize: number
      newSize: number
      change: number
    }>
  }
  workloadImpact: {
    immediateActions: number
    weeklyActions: number
    monthlyActions: number
    estimatedHours: number
  }
  dueDateChanges: {
    accelerated: number // Steps moved earlier
    delayed: number // Steps moved later
    newSteps: number // Completely new steps
    removedSteps: number // Steps being removed
  }
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical'
    factors: string[]
    warnings: string[]
  }
}

interface ImpactPreviewModalProps {
  isOpen: boolean
  impactData: ImpactPreviewData
  originalItem: PathwayTemplate | LocalOverride | any // The item being changed
  proposedChanges: any // The proposed changes
  onConfirm: (justification: string) => Promise<void>
  onCancel: () => void
}

function ImpactPreviewModal({ 
  isOpen, 
  impactData, 
  onConfirm, 
  onCancel 
}: ImpactPreviewModalProps) {
  const { user } = useUser()
  const [justification, setJustification] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  if (!isOpen) return null

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-5 h-5" />
      case 'high': return <AlertTriangle className="w-5 h-5" />
      case 'medium': return <Clock className="w-5 h-5" />
      case 'low': return <CheckCircle className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const handleConfirm = async () => {
    if (!justification.trim()) return

    setIsProcessing(true)
    try {
      await onConfirm(justification)
    } catch (error) {
      console.error('Error applying changes:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                <FormattedMessage id="impactPreview.title" />
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {impactData.changeName}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Risk Assessment */}
          <div className={`border rounded-lg p-4 ${getRiskColor(impactData.riskAssessment.level)}`}>
            <div className="flex items-start space-x-3">
              {getRiskIcon(impactData.riskAssessment.level)}
              <div className="flex-1">
                <h3 className="font-medium mb-2">
                  <FormattedMessage 
                    id={`impactPreview.riskLevel.${impactData.riskAssessment.level}`} 
                  />
                </h3>
                <p className="text-sm mb-3">
                  {impactData.changeDescription}
                </p>
                
                {impactData.riskAssessment.warnings.length > 0 && (
                  <div className="space-y-1">
                    {impactData.riskAssessment.warnings.map((warning, index) => (
                      <div key={index} className="text-sm flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Impact Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">
                  <FormattedMessage id="impactPreview.affectedPatients" />
                </h4>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {impactData.affectedPatients.total}
              </div>
              <div className="text-sm text-blue-700">
                <FormattedMessage id="impactPreview.patients" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">
                  <FormattedMessage id="impactPreview.immediateActions" />
                </h4>
              </div>
              <div className="text-2xl font-bold text-green-900 mb-1">
                {impactData.workloadImpact.immediateActions}
              </div>
              <div className="text-sm text-green-700">
                <FormattedMessage id="impactPreview.actionsToday" />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">
                  <FormattedMessage id="impactPreview.workloadHours" />
                </h4>
              </div>
              <div className="text-2xl font-bold text-yellow-900 mb-1">
                {impactData.workloadImpact.estimatedHours}
              </div>
              <div className="text-sm text-yellow-700">
                <FormattedMessage id="impactPreview.hoursPerWeek" />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">
                  <FormattedMessage id="impactPreview.dueDateChanges" />
                </h4>
              </div>
              <div className="text-2xl font-bold text-purple-900 mb-1">
                {impactData.dueDateChanges.accelerated + impactData.dueDateChanges.delayed}
              </div>
              <div className="text-sm text-purple-700">
                <FormattedMessage id="impactPreview.stepsAffected" />
              </div>
            </div>
          </div>

          {/* Detailed Impact Analysis */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-gray-900">
                <FormattedMessage id="impactPreview.detailedAnalysis" />
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <FormattedMessage id="impactPreview.hideDetails" />
                ) : (
                  <FormattedMessage id="impactPreview.showDetails" />
                )}
              </Button>
            </div>

            {showDetails && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Risk Distribution */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    <FormattedMessage id="impactPreview.patientRiskDistribution" />
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(impactData.affectedPatients.byRiskLevel).map(([risk, count]) => (
                      <div key={risk} className="flex items-center justify-between">
                        <Badge variant={risk === 'critical' ? 'critical' : risk === 'high' ? 'warning' : 'default'}>
                          <FormattedMessage id={`riskLevel.${risk}`} />
                        </Badge>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cohort Size Changes */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    <FormattedMessage id="impactPreview.cohortSizeChanges" />
                  </h4>
                  <div className="space-y-2">
                    {impactData.cohortImpact.cohortSizeChanges.map((cohort, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{cohort.cohortName}</span>
                        <div className="flex items-center space-x-2">
                          <span>{cohort.currentSize}</span>
                          <span>→</span>
                          <span className={cohort.change > 0 ? 'text-green-600' : cohort.change < 0 ? 'text-red-600' : 'text-gray-600'}>
                            {cohort.newSize}
                          </span>
                          <span className={`text-xs ${cohort.change > 0 ? 'text-green-600' : cohort.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            ({cohort.change > 0 ? '+' : ''}{cohort.change})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workload Distribution */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    <FormattedMessage id="impactPreview.workloadDistribution" />
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span><FormattedMessage id="impactPreview.thisWeek" /></span>
                      <span className="font-medium">{impactData.workloadImpact.weeklyActions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span><FormattedMessage id="impactPreview.thisMonth" /></span>
                      <span className="font-medium">{impactData.workloadImpact.monthlyActions}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Changes */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    <FormattedMessage id="impactPreview.timelineChanges" />
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">
                        <FormattedMessage id="impactPreview.acceleratedSteps" />
                      </span>
                      <span className="font-medium">{impactData.dueDateChanges.accelerated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-600">
                        <FormattedMessage id="impactPreview.delayedSteps" />
                      </span>
                      <span className="font-medium">{impactData.dueDateChanges.delayed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">
                        <FormattedMessage id="impactPreview.newSteps" />
                      </span>
                      <span className="font-medium">{impactData.dueDateChanges.newSteps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">
                        <FormattedMessage id="impactPreview.removedSteps" />
                      </span>
                      <span className="font-medium">{impactData.dueDateChanges.removedSteps}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Justification */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FormattedMessage id="impactPreview.justification" />
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Please provide clinical or operational justification for these changes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {impactData.riskAssessment.level === 'high' || impactData.riskAssessment.level === 'critical' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      <FormattedMessage id="impactPreview.highRiskWarning" />
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      <FormattedMessage id="impactPreview.reviewRequired" />
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <FormattedMessage 
                id="impactPreview.changeWillBeLogged" 
                values={{ user: user.name, timestamp: new Date().toLocaleString() }}
              />
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onCancel}>
                <FormattedMessage id="common.cancel" />
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={!justification.trim() || isProcessing}
              >
                {isProcessing ? (
                  <FormattedMessage id="impactPreview.applying" />
                ) : (
                  <FormattedMessage id="impactPreview.confirmAndApply" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImpactPreviewModal