'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Package,
  Users,
  QrCode,
  LogOut,
  User,
  Mail,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Box,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['products'])

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuKey)
        ? prev.filter(key => key !== menuKey)
        : [...prev, menuKey]
    )
  }

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    {
      key: 'products',
      label: 'Products',
      icon: Package,
      subItems: [
        { href: '/admin/dashboard/products', label: 'All Products', icon: Package },
        { href: '/admin/dashboard/packages', label: 'Packages', icon: Box },
        { href: '/admin/dashboard/batches', label: 'Batches', icon: QrCode },
      ]
    },
    { href: '/admin/dashboard/customers', label: 'Customers', icon: Users },
    { href: '/admin/dashboard/qr-scan', label: 'QR Scan', icon: QrCode },
  ]

  const isActive = (href: string) => pathname === href
  const isParentActive = (subItems?: any[]) => {
    if (!subItems) return false
    return subItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 w-64 shadow-2xl border-r border-purple-700/50`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-700/50">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              QR Admin
            </h1>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-purple-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-purple-700/50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon

                // Handle items with sub-menu
                if ('subItems' in item && item.subItems) {
                  const isExpanded = expandedMenus.includes(item.key!)
                  const parentActive = isParentActive(item.subItems)

                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => toggleMenu(item.key!)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${parentActive
                            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                            : 'text-purple-200 hover:bg-purple-700/50 hover:text-white'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>

                      {/* Sub-menu */}
                      {isExpanded && (
                        <ul className="mt-1 ml-4 space-y-1">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon
                            const subActive = isActive(subItem.href)
                            return (
                              <li key={subItem.href}>
                                <Link
                                  href={subItem.href}
                                  onClick={() => setIsOpen(false)}
                                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${subActive
                                      ? 'bg-purple-600/80 text-white shadow-md'
                                      : 'text-purple-200 hover:bg-purple-700/30 hover:text-white'
                                    }`}
                                >
                                  <SubIcon size={18} />
                                  <span className="text-sm font-medium">{subItem.label}</span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                }

                // Handle regular menu items
                const active = isActive(item.href!)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href!}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                          : 'text-purple-200 hover:bg-purple-700/50 hover:text-white'
                        }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-purple-700/50">
            <div className="bg-purple-800/50 rounded-lg p-4 mb-3 border border-purple-700/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    Admin User
                  </p>
                  <p className="text-xs text-purple-300 truncate flex items-center gap-1">
                    <Mail size={12} />
                    admin@qrdemo.com
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                // Handle logout
                window.location.href = '/admin/login'
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 font-medium"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
