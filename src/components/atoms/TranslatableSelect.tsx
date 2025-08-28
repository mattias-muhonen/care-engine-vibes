import { SelectHTMLAttributes, forwardRef } from 'react'
import { useIntl } from 'react-intl'
import { cn } from '../../utils/cn'
import { ChevronDown } from 'lucide-react'

interface TranslatableSelectOption {
  value: string
  labelId: string
}

interface TranslatableSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  options: TranslatableSelectOption[]
  placeholder?: string
  error?: string
}

const TranslatableSelect = forwardRef<HTMLSelectElement, TranslatableSelectProps>(
  ({ className, label, options, placeholder, error, ...props }, ref) => {
    const intl = useIntl()

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {intl.formatMessage({ id: option.labelId })}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

TranslatableSelect.displayName = 'TranslatableSelect'

export default TranslatableSelect