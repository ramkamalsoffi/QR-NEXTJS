'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { Menu } from 'lucide-react'
import QueryProvider from '@/providers/QueryProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <QueryProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Mobile menu button - Hamburger Style */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 group"
          aria-label="Open menu"
        >
          <div className="flex flex-col gap-1.5">
            <span className="w-6 h-0.5 bg-white rounded-full transition-all group-hover:bg-purple-100"></span>
            <span className="w-6 h-0.5 bg-white rounded-full transition-all group-hover:bg-purple-100"></span>
            <span className="w-6 h-0.5 bg-white rounded-full transition-all group-hover:bg-purple-100"></span>
          </div>
        </button>

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="lg:ml-64 min-h-screen p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </QueryProvider>
  )
}

