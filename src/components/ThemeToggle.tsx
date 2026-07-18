'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evita erros de hidratação garantindo que o componente só renderize no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 rounded-xl flex items-center justify-center
                 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10
                 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                 hover:bg-black/10 dark:hover:bg-white/10 hover:border-purple-500/30
                 transition-all duration-300 relative overflow-hidden active:scale-95"
      aria-label="Alternar tema"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Ícone da Lua para quando estiver no tema Light */}
        <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100" />
        {/* Ícone do Sol para quando estiver no tema Dark */}
        <Sun className="absolute w-5 h-5 rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0" />
      </div>
    </button>
  )
}
