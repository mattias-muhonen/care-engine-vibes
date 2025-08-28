import { ReactNode } from 'react'
import TopBar from '../molecules/TopBar'
import LeftNavigation from '../molecules/LeftNavigation'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <LeftNavigation />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout