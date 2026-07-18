import { createClient } from '@/utils/supabase/server'
import { ReportsDashboard } from '@/components/ReportsDashboard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { logout } from '../login/actions'
import { LogOut } from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const supabase = await createClient()

  // Buscar usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Verificar se o usuário é admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Buscar todos os atendimentos com os nomes das categorias
  const { data: attendances, error: fetchError } = await supabase
    .from('attendances')
    .select(`
      id,
      created_at,
      observation,
      categories ( name, icon ),
      profiles ( name )
    `)
    .order('created_at', { ascending: false })

  console.log('--- RELATORIOS DEBUG ---')
  console.log('Erro de busca:', fetchError)
  console.log('Total buscado:', attendances?.length)
  console.log('Primeiro registro:', attendances?.[0])
  console.log('------------------------')

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-zinc-900 dark:text-white p-6 md:p-12 lg:p-24 transition-colors duration-300">
      {/* Background Effect with Store Image */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 dark:opacity-30 transition-opacity duration-500 scale-105"
          style={{ backgroundImage: "url('/images/mov-store.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa]/20 via-[#fafafa]/80 to-[#fafafa] dark:from-[#050505]/40 dark:via-[#050505]/85 dark:to-[#050505] transition-colors duration-500" />
        <div className="absolute top-[30%] -right-[20%] w-[50%] h-[50%] rounded-full bg-purple-500/5 dark:bg-purple-900/10 blur-[120px] transition-all duration-300" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12 border-b border-black/10 dark:border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-zinc-600 dark:text-gray-400 hover:text-zinc-950 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Painel Gerencial</h1>
            </div>
            <p className="text-zinc-500 dark:text-gray-400">Relatórios, gráficos e exportação de dados.</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={logout}>
              <LogoutButton />
            </form>
          </div>
        </header>

        {/* Format data to align with Attendance type contract */}
        {(() => {
          const formattedAttendances = (attendances || []).map((a: any) => ({
            id: a.id,
            created_at: a.created_at,
            observation: a.observation,
            categories: Array.isArray(a.categories) ? a.categories[0] : a.categories,
            profiles: Array.isArray(a.profiles) ? a.profiles[0] : a.profiles,
          }))

          return <ReportsDashboard data={formattedAttendances} />
        })()}
      </div>
    </main>
  )
}
