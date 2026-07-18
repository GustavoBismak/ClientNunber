'use client'

import { LogOut } from 'lucide-react'

export function LogoutButton() {
  return (
    <button 
      type="submit"
      onClick={(e) => {
        if (!window.confirm('Tem certeza que deseja sair do sistema?')) {
          e.preventDefault()
        }
      }}
      className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors group"
      title="Sair do sistema"
    >
      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
    </button>
  )
}
