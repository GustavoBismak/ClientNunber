'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { registerAttendance } from '@/app/actions'

type Category = {
  id: string
  name: string
  icon: string
}

export function QuickRegistrationGrid({ categories }: { categories: Category[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRegister = async (category: Category) => {
    if (loadingId) return
    setLoadingId(category.id)

    try {
      // Registrar no banco (chamada para server action)
      const result = await registerAttendance(category.id)

      if (result.error) {
        toast.error(`Erro: ${result.error}`)
      } else {
        // Notificação de sucesso elegante
        toast.success(`1 cliente que queria ${category.name} foi adicionado.`, {
          description: 'Registro salvo com sucesso.',
          className: 'bg-purple-950 text-white border-purple-800'
        })
      }
    } catch (err) {
      toast.error('Erro de conexão ao registrar.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 w-full">
      {categories.map((cat) => {
        // Renderiza o ícone dinamicamente a partir da string salva no banco
        // @ts-ignore
        const Icon = LucideIcons[cat.icon] || LucideIcons.HelpCircle

        return (
          <button
            key={cat.id}
            onClick={() => handleRegister(cat)}
            disabled={loadingId !== null}
            className={`group relative h-32 md:h-40 flex flex-col items-center justify-center gap-4 
                       bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md
                       border border-black/5 dark:border-white/5 hover:border-purple-500/50 dark:hover:border-purple-500/50
                       rounded-2xl transition-all duration-300 
                       hover:bg-purple-50/50 dark:hover:bg-purple-950/40 
                       hover:shadow-[0_0_30px_-5px_rgba(147,51,234,0.15)] dark:hover:shadow-[0_0_30px_-5px_rgba(147,51,234,0.3)]
                       active:scale-95 overflow-hidden shadow-sm dark:shadow-none
                       ${loadingId === cat.id ? 'opacity-70 cursor-wait' : ''}`}
          >
            {/* Efeito visual no hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 dark:group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-500" />
            
            {loadingId === cat.id ? (
              <LucideIcons.Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
            ) : (
              <Icon 
                className="w-8 h-8 text-zinc-400 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 group-hover:scale-110 transform" 
                strokeWidth={1.5}
              />
            )}
            
            <span className="font-medium text-sm text-zinc-600 dark:text-gray-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-300 text-center px-4">
              {cat.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
