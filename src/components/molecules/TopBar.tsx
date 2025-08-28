import { ChevronDown, Building2, User } from 'lucide-react'

function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <Building2 className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            Huisartsenpraktijk Rotterdam Zuid
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            Martine van der Berg (POH-S)
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </header>
  )
}

export default TopBar