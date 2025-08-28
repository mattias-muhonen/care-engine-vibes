import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { ArrowUpDown, Users, AlertTriangle, Clock, Filter } from 'lucide-react'
import { Cohort, Patient } from '../../utils/patientFilters'
import { formatDate } from '../../utils/formatDate'
import Badge from '../atoms/Badge'
import Button from '../atoms/Button'
import Input from '../atoms/Input'
import TranslatableSelect from '../atoms/TranslatableSelect'

interface CohortTableProps {
  cohorts: Cohort[]
  patients: Patient[]
  onOpenCohort: (cohortId: string) => void
}

type SortField = 'name' | 'priority' | 'patientCount' | 'lastUpdated'
type SortDirection = 'asc' | 'desc'

function CohortTable({ cohorts, onOpenCohort }: CohortTableProps) {
  const intl = useIntl()
  const [sortField, setSortField] = useState<SortField>('priority')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCondition, setFilterCondition] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'critical'
      case 'medium': return 'warning'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getPriorityOrder = (priority: string) => {
    switch (priority) {
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 0
    }
  }

  // Filter and sort cohorts
  const filteredCohorts = cohorts
    .filter(cohort => {
      const matchesSearch = !searchTerm || 
        cohort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cohort.reason.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCondition = !filterCondition || 
        cohort.filter.condition === filterCondition
      
      const matchesPriority = !filterPriority || 
        cohort.priority === filterPriority

      return matchesSearch && matchesCondition && matchesPriority
    })
    .sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'priority':
          aValue = getPriorityOrder(a.priority)
          bValue = getPriorityOrder(b.priority)
          break
        case 'patientCount':
          aValue = a.patientIds.length
          bValue = b.patientIds.length
          break
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated).getTime()
          bValue = new Date(b.lastUpdated).getTime()
          break
        default:
          return 0
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const conditionOptions = [
    { value: '', labelId: 'cohorts.conditions.all' },
    { value: 'diabetes_t2', labelId: 'cohorts.conditions.diabetes_t2' },
    { value: 'all', labelId: 'cohorts.conditions.all' }
  ]

  const priorityOptions = [
    { value: '', labelId: 'cohorts.priorities.all' },
    { value: 'high', labelId: 'cohorts.priorities.high' },
    { value: 'medium', labelId: 'cohorts.priorities.medium' },
    { value: 'low', labelId: 'cohorts.priorities.low' }
  ]

  const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
    >
      {children}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            <FormattedMessage id="dashboard.cohorts.title" defaultMessage="Patient Cohorten" />
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              <FormattedMessage 
                id="cohorts.filters.resultsCount" 
                values={{ count: filteredCohorts.length }} 
              />
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder={intl.formatMessage({ id: 'cohorts.filters.searchPlaceholder' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <TranslatableSelect
            placeholder={intl.formatMessage({ id: 'cohorts.filters.conditionPlaceholder' })}
            options={conditionOptions}
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
          />
          <TranslatableSelect
            placeholder={intl.formatMessage({ id: 'cohorts.filters.priorityPlaceholder' })}
            options={priorityOptions}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setFilterCondition('')
              setFilterPriority('')
            }}
          >
            <FormattedMessage id="cohorts.filters.resetFilters" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <SortButton field="name">
                  <FormattedMessage id="cohorts.columns.name" />
                </SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="priority">
                  <FormattedMessage id="cohorts.columns.priority" />
                </SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="patientCount">
                  <FormattedMessage id="cohorts.columns.patients" />
                </SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <FormattedMessage id="cohorts.columns.condition" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="lastUpdated">
                  <FormattedMessage id="cohorts.columns.lastUpdated" />
                </SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <FormattedMessage id="cohorts.columns.actions" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCohorts.map((cohort) => (
              <tr 
                key={cohort.cohortId} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onOpenCohort(cohort.cohortId)}
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {cohort.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {cohort.reason}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getPriorityVariant(cohort.priority)}>
                    {cohort.priority}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {cohort.patientIds.length}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <FormattedMessage 
                    id={cohort.filter.condition === 'diabetes_t2' ? 'cohorts.condition.diabetes_t2' : 'cohorts.condition.all'} 
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatDate(cohort.lastUpdated)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenCohort(cohort.cohortId)
                    }}
                  >
                    <FormattedMessage id="cohorts.actions.details" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCohorts.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            <FormattedMessage id="cohorts.empty.title" />
          </h3>
          <p className="text-sm text-gray-500">
            <FormattedMessage id="cohorts.empty.description" />
          </p>
        </div>
      )}
    </div>
  )
}

export default CohortTable