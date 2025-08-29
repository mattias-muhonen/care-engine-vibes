import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { 
  X, 
  History, 
  RotateCcw, 
  AlertTriangle, 
  Clock, 
  User,
  Search,
  Filter
} from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import { 
  changeHistoryManager, 
  ChangeLogEntry, 
  ChangeHistoryFilter 
} from '../../utils/changeHistory'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'

interface ChangeHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

function ChangeHistoryModal({ isOpen, onClose }: ChangeHistoryModalProps) {
  const { user } = useUser()
  const [changes, setChanges] = useState<ChangeLogEntry[]>([])
  const [filter, setFilter] = useState<ChangeHistoryFilter>({})
  const [searchText, setSearchText] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [undoingChangeId, setUndoingChangeId] = useState<string | null>(null)
  const [statistics, setStatistics] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
      loadChanges()
      loadStatistics()
    }
  }, [isOpen, filter, searchText])

  const loadChanges = () => {
    const filterWithSearch = { ...filter, searchText: searchText || undefined }
    const changesData = changeHistoryManager.getChangeHistory(filterWithSearch)
    setChanges(changesData)
  }

  const loadStatistics = () => {
    const stats = changeHistoryManager.getChangeStatistics()
    setStatistics(stats)
  }

  const handleUndo = async (changeId: string, reason: string) => {
    setUndoingChangeId(changeId)
    try {
      await changeHistoryManager.undoChange(changeId, user.name, reason)
      loadChanges() // Refresh the list
    } catch (error) {
      console.error('Error undoing change:', error)
      alert('Failed to undo change: ' + (error as Error).message)
    } finally {
      setUndoingChangeId(null)
    }
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'pathway_override': return 'bg-blue-100 text-blue-800'
      case 'threshold_update': return 'bg-green-100 text-green-800'
      case 'configuration_change': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'success'
      case 'undone': return 'warning'
      case 'failed': return 'critical'
      default: return 'default'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <History className="w-6 h-6 text-gray-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  <FormattedMessage id="changeHistory.title" />
                </h2>
                <p className="text-sm text-gray-600">
                  <FormattedMessage id="changeHistory.subtitle" />
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
                <div className="text-sm text-gray-600">
                  <FormattedMessage id="changeHistory.stats.totalChanges" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.totalPatientsAffected}</div>
                <div className="text-sm text-gray-600">
                  <FormattedMessage id="changeHistory.stats.patientsAffected" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.byStatus.applied || 0}</div>
                <div className="text-sm text-gray-600">
                  <FormattedMessage id="changeHistory.stats.applied" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{statistics.byStatus.undone || 0}</div>
                <div className="text-sm text-gray-600">
                  <FormattedMessage id="changeHistory.stats.undone" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search changes..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              <FormattedMessage id="changeHistory.filters" />
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FormattedMessage id="changeHistory.filter.changeType" />
                </label>
                <select
                  value={filter.changeType || ''}
                  onChange={(e) => setFilter(prev => ({ ...prev, changeType: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All types</option>
                  <option value="pathway_override">Pathway Overrides</option>
                  <option value="threshold_update">Threshold Updates</option>
                  <option value="configuration_change">Configuration Changes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FormattedMessage id="changeHistory.filter.status" />
                </label>
                <select
                  value={filter.status || ''}
                  onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as any || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All statuses</option>
                  <option value="applied">Applied</option>
                  <option value="undone">Undone</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FormattedMessage id="changeHistory.filter.dateFrom" />
                </label>
                <input
                  type="date"
                  value={filter.dateFrom || ''}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Changes List */}
        <div className="p-6">
          <div className="space-y-4">
            {changes.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  <FormattedMessage id="changeHistory.noChanges" />
                </p>
              </div>
            ) : (
              changes.map((change) => (
                <div
                  key={change.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {change.changeName}
                        </h3>
                        <Badge 
                          variant={getStatusColor(change.status)}
                          className="text-xs"
                        >
                          <FormattedMessage id={`changeHistory.status.${change.status}`} />
                        </Badge>
                        <span className={`text-xs px-2 py-1 rounded-full ${getChangeTypeColor(change.changeType)}`}>
                          <FormattedMessage id={`changeHistory.type.${change.changeType}`} />
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {change.changeDescription}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{change.userName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(change.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className={`w-3 h-3 ${getRiskColor(change.impactData.riskAssessment.level)}`} />
                          <span className={getRiskColor(change.impactData.riskAssessment.level)}>
                            <FormattedMessage id={`changeHistory.risk.${change.impactData.riskAssessment.level}`} />
                          </span>
                        </div>
                        <span>{change.impactData.affectedPatients.total} patients affected</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {change.canUndo && change.status === 'applied' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const reason = prompt('Please provide a reason for undoing this change:')
                            if (reason) {
                              handleUndo(change.id, reason)
                            }
                          }}
                          disabled={undoingChangeId === change.id}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          {undoingChangeId === change.id ? (
                            <FormattedMessage id="changeHistory.undoing" />
                          ) : (
                            <FormattedMessage id="changeHistory.undo" />
                          )}
                        </Button>
                      )}
                      {change.status === 'undone' && change.undoneBy && (
                        <div className="text-xs text-gray-500">
                          <div>Undone by: {change.undoneBy}</div>
                          <div>{new Date(change.undoneAt!).toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Justification */}
                  <div className="bg-gray-50 rounded p-3 mt-3">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      <FormattedMessage id="changeHistory.justification" />:
                    </div>
                    <p className="text-sm text-gray-700">
                      {change.justification}
                    </p>
                    {change.undoneReason && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          <FormattedMessage id="changeHistory.undoReason" />:
                        </div>
                        <p className="text-sm text-gray-700">
                          {change.undoneReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <FormattedMessage 
                id="changeHistory.showing" 
                values={{ count: changes.length }} 
              />
            </div>
            <Button variant="outline" onClick={onClose}>
              <FormattedMessage id="common.close" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangeHistoryModal