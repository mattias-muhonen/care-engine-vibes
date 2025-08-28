import { FormattedMessage } from 'react-intl'
import patientsData from '../../mocks/patients.json'
import cohortsData from '../../mocks/cohorts.json'
import { Patient, Cohort } from '../../utils/patientFilters'
import { formatDate, calculateAge } from '../../utils/formatDate'
import Badge from '../atoms/Badge'

function Dashboard() {
  const patients = patientsData as Patient[]
  const cohorts = cohortsData as Cohort[]

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'critical'
      case 'high': return 'warning' 
      case 'medium': return 'default'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        <FormattedMessage id="dashboard.title" />
      </h1>
      
      {/* Summary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Totaal patiënten</h3>
          <p className="text-3xl font-bold text-primary-600">{patients.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Actieve cohorten</h3>
          <p className="text-3xl font-bold text-primary-600">{cohorts.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hoog risico patiënten</h3>
          <p className="text-3xl font-bold text-status-critical">
            {patients.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').length}
          </p>
        </div>
      </div>

      {/* Patient list sample */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent patiënten</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patiënt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leeftijd
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Laatste contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risico niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toestemming
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.slice(0, 5).map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500">ID: {patient.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateAge(patient.dob)} jaar
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(patient.lastContact)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>
                      {patient.riskLevel}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={patient.consent.status === 'given' ? 'success' : 'critical'}>
                      {patient.consent.status === 'given' ? 'Gegeven' : 'Ingetrokken'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard