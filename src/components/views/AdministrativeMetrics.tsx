import { FormattedMessage, useIntl } from 'react-intl'
import { TrendingUp, Users, AlertTriangle, Clock, CheckCircle, Activity, Calendar, ShieldAlert, ThumbsUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import metricsData from '../../mocks/metrics.json'
import Tile from '../atoms/Tile'

interface Metric {
  name: string
  display: string
  type: 'count' | 'count_percentage' | 'number' | 'percentage' | 'hours' | 'score'
  value?: number
  count?: number
  percentage?: number
}

interface TrendData {
  name: string
  display: string
  type: 'timeseries' | 'timeseries_multi' | 'categorical'
  series?: Array<{ date: string; week: string; value: number }> | Array<{
    name: string
    label: string
    data: Array<{ date: string; week: string; value: number }>
  }>
  values?: Array<{ condition: string; count: number }>
}

function AdministrativeMetrics() {
  const intl = useIntl()
  const metrics = metricsData.metrics as Metric[]
  const trends = metricsData.trends as TrendData[]
  const operationalSnapshots = metricsData.operational_snapshots as Metric[]
  const valueAdd = metricsData.value_add as Metric[]

  const getMetricIcon = (metricName: string) => {
    if (metricName.includes('patients')) return Users
    if (metricName.includes('flagged') || metricName.includes('issues')) return AlertTriangle
    if (metricName.includes('time') || metricName.includes('overdue')) return Clock
    if (metricName.includes('closed') || metricName.includes('resolved')) return CheckCircle
    if (metricName.includes('automated') || metricName.includes('actions')) return Activity
    if (metricName.includes('approval')) return ShieldAlert
    if (metricName.includes('booking')) return Calendar
    if (metricName.includes('nps')) return ThumbsUp
    if (metricName.includes('saved')) return TrendingUp
    return Activity
  }

  const formatMetricValue = (metric: Metric): string => {
    switch (metric.type) {
      case 'count':
        return metric.value?.toLocaleString() || '0'
      case 'count_percentage':
        return `${metric.count?.toLocaleString() || '0'} (${metric.percentage || 0}%)`
      case 'number':
        return metric.value?.toString() || '0'
      case 'percentage':
        return `${metric.value || 0}%`
      case 'hours':
        return `${metric.value || 0}h`
      case 'score':
        return metric.value?.toString() || '0'
      default:
        return metric.value?.toString() || '0'
    }
  }

  const getStatusVariant = (metric: Metric): 'default' | 'warning' | 'critical' | 'success' => {
    if (metric.name === 'critical_incidents' && metric.value === 0) return 'success'
    if (metric.name.includes('unreviewed') || metric.name.includes('overdue') || metric.name.includes('errors')) {
      return metric.value === 0 ? 'success' : 'warning'
    }
    if (metric.name.includes('completion') || metric.name.includes('closed')) {
      const value = metric.type === 'count_percentage' ? metric.percentage : metric.value
      return (value || 0) >= 70 ? 'success' : 'warning'
    }
    return 'default'
  }

  const getTranslatedMetricTitle = (metric: Metric): string => {
    return intl.formatMessage({ id: `metrics.${metric.name}` })
  }

  const getTranslatedTrendTitle = (trend: TrendData): string => {
    return intl.formatMessage({ id: `trends.${trend.name}` })
  }

  const getTranslatedCondition = (condition: string): string => {
    const conditionKey = condition.toLowerCase().replace(/\s+/g, '_')
    return intl.formatMessage({ id: `conditions.${conditionKey}` })
  }

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

  const isMultiSeriesTrend = (trend: TrendData) => {
    return trend.type === 'timeseries_multi' && trend.series && Array.isArray(trend.series) && 
           trend.series.length > 0 && 'name' in trend.series[0] && 'label' in trend.series[0]
  }

  const renderTimeSeriesChart = (trend: TrendData) => {
    if (!trend.series) return null
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trend.series}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="week" className="text-sm" />
          <YAxis className="text-sm" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const renderMultiSeriesChart = (trend: TrendData) => {
    if (!isMultiSeriesTrend(trend) || !trend.series) return null
    
    const multiSeries = trend.series as Array<{
      name: string
      label: string
      data: Array<{ date: string; week: string; value: number }>
    }>
    
    // Transform multi-series data for recharts
    const transformedData = multiSeries[0]?.data.map((point, index) => {
      const dataPoint: any = { week: point.week }
      multiSeries.forEach(serie => {
        if (serie.data[index]) {
          dataPoint[serie.name] = serie.data[index].value
        }
      })
      return dataPoint
    }) || []

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="week" className="text-sm" />
          <YAxis className="text-sm" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          />
          <Legend />
          {multiSeries.map((serie, index) => (
            <Line 
              key={serie.name}
              type="monotone" 
              dataKey={serie.name} 
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              name={serie.label}
              dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const renderCategoricalChart = (trend: TrendData) => {
    if (!trend.values) return null

    const chartData = trend.values.map(item => ({
      name: getTranslatedCondition(item.condition),
      value: item.count
    }))

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" className="text-sm" />
          <YAxis className="text-sm" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          <FormattedMessage id="administrativeMetrics.title" />
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          <FormattedMessage 
            id="administrativeMetrics.timeWindow" 
            values={{ period: metricsData.time_window.replace('_', ' ').replace('to', 'to') }}
          />
        </p>
      </div>

      {/* Core Metrics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <FormattedMessage id="administrativeMetrics.coreMetrics" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const IconComponent = getMetricIcon(metric.name)
            return (
              <Tile
                key={metric.name}
                icon={IconComponent}
                title={getTranslatedMetricTitle(metric)}
                value={formatMetricValue(metric)}
                variant={getStatusVariant(metric)}
              />
            )
          })}
        </div>
      </section>

      {/* Operational Snapshots */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <FormattedMessage id="administrativeMetrics.operationalSnapshots" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {operationalSnapshots.map((metric) => {
            const IconComponent = getMetricIcon(metric.name)
            return (
              <Tile
                key={metric.name}
                icon={IconComponent}
                title={getTranslatedMetricTitle(metric)}
                value={formatMetricValue(metric)}
                variant={getStatusVariant(metric)}
              />
            )
          })}
        </div>
      </section>

      {/* Trends */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <FormattedMessage id="administrativeMetrics.trends" />
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trends.map((trend) => (
            <div key={trend.name} className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-4">{getTranslatedTrendTitle(trend)}</h3>
              {trend.type === 'timeseries' && renderTimeSeriesChart(trend)}
              {trend.type === 'timeseries_multi' && renderMultiSeriesChart(trend)}
              {trend.type === 'categorical' && renderCategoricalChart(trend)}
            </div>
          ))}
        </div>
      </section>

      {/* Value Add Metrics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <FormattedMessage id="administrativeMetrics.valueAdd" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {valueAdd.map((metric) => {
            const IconComponent = getMetricIcon(metric.name)
            return (
              <Tile
                key={metric.name}
                icon={IconComponent}
                title={getTranslatedMetricTitle(metric)}
                value={formatMetricValue(metric)}
                variant={getStatusVariant(metric)}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default AdministrativeMetrics