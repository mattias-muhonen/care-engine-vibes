import { FormattedMessage } from 'react-intl'

function MassActions() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        <FormattedMessage id="massActions.title" />
      </h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">
          <FormattedMessage id="massActions.placeholder" />
        </p>
      </div>
    </div>
  )
}

export default MassActions