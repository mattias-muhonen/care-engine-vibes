import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { ArrowUpDown, Users, AlertTriangle, Clock, Filter } from 'lucide-react'
import { Cohort, Patient } from '../../utils/patientFilters'
import { formatDate } from '../../utils/formatDate'
import Badge from '../atoms/Badge'
import Button from '../atoms/Button'
import Input from '../atoms/Input'
import Select from '../atoms/Select'

interface CohortTableProps {
  cohorts: Cohort[]
  patients: Patient[]
  onOpenCohort: (cohortId: string) => void
}

type SortField = 'name' | 'priority' | 'patientCount' | 'lastUpdated'
type SortDirection = 'asc' | 'desc'

function CohortTable({ cohorts, onOpenCohort }: CohortTableProps) {
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
    { value: '', label: 'Alle condities' },
    { value: 'diabetes_t2', label: 'Diabetes Type 2' },
    { value: 'all', label: 'Alle condities' }
  ]

  const priorityOptions = [
    { value: '', label: 'Alle prioriteiten' },
    { value: 'high', label: 'Hoog' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Laag' }
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
            <span className="text-sm text-gray-600">{filteredCohorts.length} cohorten</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Zoek cohorten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Select
            placeholder="Conditie filter"
            options={conditionOptions}
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
          />
          <Select
            placeholder="Prioriteit filter"
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
            Reset filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <SortButton field="name">Cohort naam</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="priority">Prioriteit</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="patientCount">Patiënten</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                Conditie
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="lastUpdated">Laatst bijgewerkt</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                Acties
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
                  {cohort.filter.condition === 'diabetes_t2' ? 'Diabetes T2' : 'Alle'}
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
                    Details
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
          <h3 className="text-sm font-medium text-gray-900 mb-2">Geen cohorten gevonden</h3>
          <p className="text-sm text-gray-500">
            Probeer de filters aan te passen om meer resultaten te zien.
          </p>
        </div>
      )}
    </div>
  )
}

export default CohortTable