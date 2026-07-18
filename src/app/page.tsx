import { Users, BarChart3, LogOut } from "lucide-react"
import { createClient } from '@/utils/supabase/server'
import { QuickRegistrationGrid } from "@/components/QuickRegistrationGrid"
import { ThemeToggle } from "@/components/ThemeToggle"
import Link from 'next/link'
import { logout } from './login/actions'
import { LogoutButton } from '@/components/LogoutButton'

export default async function QuickRegistrationPage() {
  const supabase = await createClient()

  // Buscar usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.name || 'Recepção'

  // Buscar perfil para verificar permissões
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
    
  const isAdmin = profile?.role === 'admin'

  // Buscar categorias ativas do banco, ordenadas
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, icon')
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Erro ao buscar categorias:', error)
  }

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-zinc-900 dark:text-white flex flex-col p-6 md:p-12 lg:p-24 selection:bg-purple-500/30 transition-colors duration-300">
      
      {/* Abstract Background Elements with Store Image */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 dark:opacity-30 transition-opacity duration-500 scale-105"
          style={{ backgroundImage: "url('/images/mov-store.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa]/20 via-[#fafafa]/80 to-[#fafafa] dark:from-[#050505]/40 dark:via-[#050505]/85 dark:to-[#050505] transition-colors duration-500" />
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 dark:bg-purple-900/20 blur-[120px] transition-all duration-300" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[50%] rounded-full bg-purple-500/5 dark:bg-primary/10 blur-[100px] transition-all duration-300" />
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-16 md:mb-24">
          <div className="flex items-center gap-4">
            <img src="/images/logo.png" alt="MOV Logo" className="w-12 h-12 rounded-xl object-contain" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-gray-100">Client Nunber</h1>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold tracking-wider uppercase">Recepção</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/reports"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white hover:border-purple-500/30 hover:bg-purple-100 dark:hover:bg-purple-950/30 transition-all text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4" /> Relatórios
              </Link>
            )}
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-sm text-zinc-700 dark:text-gray-300 font-medium">{userName}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Logado</p>
            </div>
            <form action={logout}>
              <LogoutButton />
            </form>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-gray-400">
              Registro Rápido
            </h2>
            <p className="text-zinc-500 dark:text-gray-400 text-lg">
              Selecione o motivo do atendimento para registrar instantaneamente.
            </p>
          </div>

          {categories && categories.length > 0 ? (
            <QuickRegistrationGrid categories={categories} />
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center">
              <p className="text-red-400 mb-2">Nenhuma categoria encontrada no banco de dados.</p>
              <p className="text-sm text-gray-400">Verifique se você rodou o comando INSERT no SQL Editor do Supabase ou se as políticas (RLS) estão corretas.</p>
            </div>
          )}
        </div>
        
      </div>
    </main>
  )
}
