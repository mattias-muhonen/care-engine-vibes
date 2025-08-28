import { Languages } from 'lucide-react'
import { useLocale, getLocaleDisplayName, getLocaleFlag } from '../../contexts/LocaleContext'
import { logUserAction } from '../../utils/storage'
import Button from './Button'

function LanguageToggle() {
  const { locale, toggleLocale } = useLocale()

  const handleToggle = () => {
    const newLocale = locale === 'nl' ? 'en' : 'nl'
    toggleLocale()
    
    logUserAction('language_changed', {
      fromLocale: locale,
      toLocale: newLocale,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="gap-2"
      title={`Switch to ${locale === 'nl' ? 'English' : 'Nederlands'}`}
    >
      <Languages className="w-4 h-4" />
      <span className="text-sm">
        {getLocaleFlag(locale)} {getLocaleDisplayName(locale)}
      </span>
    </Button>
  )
}

export default LanguageToggle