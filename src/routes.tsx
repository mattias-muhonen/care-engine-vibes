import { Routes, Route } from 'react-router-dom'
import Layout from './components/organisms/Layout'
import Dashboard from './components/views/Dashboard'
import MassActions from './components/views/MassActions'
import Config from './components/views/Config'
import Audit from './components/views/Audit'
import AdministrativeMetrics from './components/views/AdministrativeMetrics'

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mass-actions" element={<MassActions />} />
        <Route path="/config" element={<Config />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/administrative-metrics" element={<AdministrativeMetrics />} />
      </Routes>
    </Layout>
  )
}

export default AppRoutes