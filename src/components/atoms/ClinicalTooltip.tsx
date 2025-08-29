import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { Info, AlertTriangle, Shield } from 'lucide-react'
import { useLocale } from '../../contexts/LocaleContext'

interface ClinicalTooltipProps {
  field: string
  nhgRationale?: string
  clinicalLogic?: string
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  isRequired?: boolean
  children: React.ReactNode
  className?: string
}

// NHG Clinical rationale database
const nhgClinicalRationale: Record<string, { 
  rationale: { en: string; nl: string }
  clinicalLogic: { en: string; nl: string }
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  isRequired: boolean 
}> = {
  'hba1c_target': {
    rationale: {
      en: 'HbA1c target of ≤53 mmol/mol (7%) for most adults with T2DM, based on NHG M01 guideline',
      nl: 'HbA1c streefwaarde van ≤53 mmol/mol (7%) voor de meeste volwassenen met T2DM, gebaseerd op NHG M01 richtlijn'
    },
    clinicalLogic: {
      en: 'Lower targets reduce microvascular complications. Higher targets (58 mmol/mol) may be appropriate for patients with limited life expectancy or high hypoglycemia risk.',
      nl: 'Lagere streefwaarden verminderen microvasculaire complicaties. Hogere streefwaarden (58 mmol/mol) kunnen geschikt zijn voor patiënten met beperkte levensverwachting of hoog hypoglykemierisico.'
    },
    riskLevel: 'high',
    isRequired: true
  },
  'bp_target_systolic': {
    rationale: {
      en: 'Systolic BP target <140 mmHg for most patients with hypertension, per NHG M84 guideline',
      nl: 'Systolische BD streefwaarde <140 mmHg voor de meeste patiënten met hypertensie, volgens NHG M84 richtlijn'
    },
    clinicalLogic: {
      en: 'Reduces cardiovascular events. Target <130 mmHg for high CVD risk patients. Avoid <120 mmHg due to increased adverse events.',
      nl: 'Vermindert cardiovasculaire events. Streefwaarde <130 mmHg voor patiënten met hoog CVD-risico. Vermijd <120 mmHg vanwege toename van bijwerkingen.'
    },
    riskLevel: 'high',
    isRequired: true
  },
  'visit_interval': {
    rationale: {
      en: 'Regular follow-up intervals ensure timely detection of complications and medication adjustments',
      nl: 'Regelmatige controle-intervallen zorgen voor tijdige detectie van complicaties en medicatieaanpassingen'
    },
    clinicalLogic: {
      en: 'T2DM patients: every 3 months if poor control, every 6 months if stable. Hypertension: every 3-6 months initially, then annually if controlled.',
      nl: 'T2DM patiënten: elke 3 maanden bij slechte regulatie, elke 6 maanden bij stabiele situatie. Hypertensie: elke 3-6 maanden initieel, dan jaarlijks bij goede regulatie.'
    },
    riskLevel: 'medium',
    isRequired: true
  },
  'annual_review': {
    rationale: {
      en: 'Annual comprehensive review is mandatory for chronic disease management per NHG guidelines',
      nl: 'Jaarlijkse uitgebreide controle is verplicht voor chronische ziektemanagement volgens NHG richtlijnen'
    },
    clinicalLogic: {
      en: 'Includes complications screening, medication review, lifestyle assessment, and care plan updates. Cannot be deferred without clinical justification.',
      nl: 'Omvat complicatiescreening, medicatiereview, leefstijlbeoordeling en zorgplanupdate. Kan niet worden uitgesteld zonder klinische onderbouwing.'
    },
    riskLevel: 'critical',
    isRequired: true
  },
  'lab_frequency': {
    rationale: {
      en: 'Laboratory monitoring frequency based on disease stability and medication adjustments',
      nl: 'Laboratoriumcontrole frequentie gebaseerd op ziektstabiliteit en medicatieaanpassingen'
    },
    clinicalLogic: {
      en: 'HbA1c every 3-6 months, lipids annually, kidney function every 6-12 months or as clinically indicated.',
      nl: 'HbA1c elke 3-6 maanden, lipiden jaarlijks, nierfunctie elke 6-12 maanden of zoals klinisch geïndiceerd.'
    },
    riskLevel: 'medium',
    isRequired: true
  },
  'notification_channel': {
    rationale: {
      en: 'Patient communication channels must be specified to ensure proper follow-up and safety notifications',
      nl: 'Patiëntcommunicatiekanalen moeten worden gespecificeerd om goede follow-up en veiligheidsmeldingen te waarborgen'
    },
    clinicalLogic: {
      en: 'At least one primary communication method required. SMS for urgent results, email for routine follow-up, phone for complex discussions.',
      nl: 'Minstens één primaire communicatiemethode vereist. SMS voor urgente uitslagen, e-mail voor routine follow-up, telefoon voor complexe gesprekken.'
    },
    riskLevel: 'high',
    isRequired: true
  }
}

function ClinicalTooltip({ 
  field, 
  nhgRationale, 
  clinicalLogic, 
  riskLevel, 
  isRequired, 
  children, 
  className = '' 
}: ClinicalTooltipProps) {
  const { locale } = useLocale()
  const [isVisible, setIsVisible] = useState(false)
  
  // Get rationale from database or props
  const fieldData = nhgClinicalRationale[field]
  const finalRationale = nhgRationale || fieldData?.rationale[locale] || ''
  const finalClinicalLogic = clinicalLogic || fieldData?.clinicalLogic[locale] || ''
  const finalRiskLevel = riskLevel || fieldData?.riskLevel || 'low'
  const finalIsRequired = isRequired !== undefined ? isRequired : fieldData?.isRequired || false

  const getRiskIcon = () => {
    switch (finalRiskLevel) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'medium': return <Shield className="w-4 h-4 text-yellow-600" />
      case 'low': return <Info className="w-4 h-4 text-blue-600" />
      default: return <Info className="w-4 h-4 text-gray-600" />
    }
  }

  const getRiskColor = () => {
    switch (finalRiskLevel) {
      case 'critical': return 'border-red-200 bg-red-50'
      case 'high': return 'border-orange-200 bg-orange-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  if (!finalRationale && !finalClinicalLogic) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        className="flex items-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        <div className="ml-2 flex items-center space-x-1">
          {getRiskIcon()}
          {finalIsRequired && (
            <span className="text-red-500 text-sm font-bold">*</span>
          )}
        </div>
      </div>

      {isVisible && (
        <div className={`absolute z-50 w-96 p-4 rounded-lg shadow-lg border ${getRiskColor()} transform -translate-x-1/2 left-1/2 top-full mt-2`}>
          {/* Arrow */}
          <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 border-l border-t ${getRiskColor()}`}></div>
          
          {/* Content */}
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center space-x-2">
              {getRiskIcon()}
              <span className="font-medium text-gray-900">
                <FormattedMessage id="clinicalTooltip.nhgGuidance" />
              </span>
              {finalIsRequired && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  <FormattedMessage id="clinicalTooltip.required" />
                </span>
              )}
            </div>

            {/* NHG Rationale */}
            {finalRationale && (
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">
                  <FormattedMessage id="clinicalTooltip.rationale" />
                </h4>
                <p className="text-sm text-gray-700">{finalRationale}</p>
              </div>
            )}

            {/* Clinical Logic */}
            {finalClinicalLogic && (
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">
                  <FormattedMessage id="clinicalTooltip.clinicalLogic" />
                </h4>
                <p className="text-sm text-gray-700">{finalClinicalLogic}</p>
              </div>
            )}

            {/* Risk Level */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  <FormattedMessage id="clinicalTooltip.riskLevel" />:
                </span>
                <span className={`font-medium ${
                  finalRiskLevel === 'critical' ? 'text-red-600' :
                  finalRiskLevel === 'high' ? 'text-orange-600' :
                  finalRiskLevel === 'medium' ? 'text-yellow-600' :
                  'text-blue-600'
                }`}>
                  <FormattedMessage id={`clinicalTooltip.risk.${finalRiskLevel}`} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClinicalTooltip