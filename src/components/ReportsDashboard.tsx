'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import {
  Download, FileText, FileSpreadsheet, Filter,
  Calendar, TrendingUp, Clock, Users, Award, ArrowDownUp
} from 'lucide-react'
import {
  startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths,
  format, parseISO, isWithinInterval, getDay, getHours
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── Types ──────────────────────────────────────────────────────────────────────

type Attendance = {
  id: string
  created_at: string
  observation: string | null
  categories: { name: string; icon: string } | null
  profiles: { name: string } | null
}

type DateFilter = 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'last_month' | 'custom'

// ── Constants ──────────────────────────────────────────────────────────────────

const CHART_COLORS = [
  '#9333ea', '#a855f7', '#7c3aed', '#6d28d9', '#c084fc',
  '#8b5cf6', '#581c87', '#d8b4fe', '#a78bfa', '#7e22ce',
  '#6366f1', '#818cf8', '#4f46e5', '#4338ca', '#e9d5ff', '#ddd6fe'
]

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: 'Hoje', value: 'today' },
  { label: 'Ontem', value: 'yesterday' },
  { label: 'Últimos 7 dias', value: '7days' },
  { label: 'Últimos 30 dias', value: '30days' },
  { label: 'Este mês', value: 'this_month' },
  { label: 'Mês anterior', value: 'last_month' },
  { label: 'Personalizado', value: 'custom' },
]

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// ── Helper Functions ───────────────────────────────────────────────────────────

function getDateRange(filter: DateFilter, customStart?: string, customEnd?: string) {
  const now = new Date()
  switch (filter) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'yesterday':
      return { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) }
    case '7days':
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) }
    case '30days':
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) }
    case 'this_month':
      return { start: startOfMonth(now), end: endOfDay(now) }
    case 'last_month':
      return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) }
    case 'custom':
      return {
        start: customStart ? startOfDay(parseISO(customStart)) : startOfDay(subDays(now, 29)),
        end: customEnd ? endOfDay(parseISO(customEnd)) : endOfDay(now),
      }
    default:
      return { start: startOfDay(now), end: endOfDay(now) }
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ReportsDashboard({ data }: { data: Attendance[] }) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // ── Derived Data ─────────────────────────────────────────────────────────────

  const allCategories = useMemo(() => {
    const cats = new Set<string>()
    data.forEach(a => { if (a.categories?.name) cats.add(a.categories.name) })
    return Array.from(cats).sort()
  }, [data])

  const allUsers = useMemo(() => {
    const users = new Set<string>()
    data.forEach(a => { if (a.profiles?.name) users.add(a.profiles.name) })
    return Array.from(users).sort()
  }, [data])

  const filteredData = useMemo(() => {
    const { start, end } = getDateRange(dateFilter, customStart, customEnd)
    return data.filter(a => {
      const date = parseISO(a.created_at)
      if (!isWithinInterval(date, { start, end })) return false
      if (categoryFilter !== 'all' && a.categories?.name !== categoryFilter) return false
      if (userFilter !== 'all' && a.profiles?.name !== userFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesCategory = a.categories?.name?.toLowerCase().includes(q)
        const matchesObs = a.observation?.toLowerCase().includes(q)
        const matchesUser = a.profiles?.name?.toLowerCase().includes(q)
        if (!matchesCategory && !matchesObs && !matchesUser) return false
      }
      return true
    })
  }, [data, dateFilter, customStart, customEnd, categoryFilter, userFilter, searchQuery])

  // ── Stats ────────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = filteredData.length

    // Contagem por categoria
    const byCat: Record<string, number> = {}
    filteredData.forEach(a => {
      const name = a.categories?.name || 'Sem categoria'
      byCat[name] = (byCat[name] || 0) + 1
    })

    // Ranking
    const ranking = Object.entries(byCat)
      .map(([name, count]) => ({ name, count, pct: total > 0 ? ((count / total) * 100).toFixed(1) : '0' }))
      .sort((a, b) => b.count - a.count)

    // Contagem por dia da semana
    const byWeekday: Record<number, number> = {}
    filteredData.forEach(a => {
      const day = getDay(parseISO(a.created_at))
      byWeekday[day] = (byWeekday[day] || 0) + 1
    })
    const weekdayData = WEEKDAY_NAMES.map((name, i) => ({ name, count: byWeekday[i] || 0 }))

    // Contagem por hora
    const byHour: Record<number, number> = {}
    filteredData.forEach(a => {
      const hour = getHours(parseISO(a.created_at))
      byHour[hour] = (byHour[hour] || 0) + 1
    })
    const hourData = Array.from({ length: 24 }, (_, i) => ({
      name: `${String(i).padStart(2, '0')}h`,
      count: byHour[i] || 0,
    })).filter(h => h.count > 0 || (parseInt(h.name) >= 7 && parseInt(h.name) <= 19))

    // Contagem por usuário
    const byUser: Record<string, number> = {}
    filteredData.forEach(a => {
      const name = a.profiles?.name || 'Sem usuário'
      byUser[name] = (byUser[name] || 0) + 1
    })
    const userRanking = Object.entries(byUser)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Contagem por dia (para gráfico de linha)
    const byDate: Record<string, number> = {}
    filteredData.forEach(a => {
      const day = format(parseISO(a.created_at), 'dd/MM', { locale: ptBR })
      byDate[day] = (byDate[day] || 0) + 1
    })
    const dailyData = Object.entries(byDate)
      .map(([name, count]) => ({ name, count }))

    // Mais frequente e menos frequente
    const mostFrequent = ranking.length > 0 ? ranking[0] : null
    const leastFrequent = ranking.length > 0 ? ranking[ranking.length - 1] : null

    // Dia mais movimentado
    const busiestDay = weekdayData.reduce((a, b) => a.count > b.count ? a : b, { name: '-', count: 0 })
    const busiestHour = hourData.reduce((a, b) => a.count > b.count ? a : b, { name: '-', count: 0 })

    return {
      total,
      ranking,
      weekdayData,
      hourData,
      userRanking,
      dailyData,
      mostFrequent,
      leastFrequent,
      busiestDay,
      busiestHour,
    }
  }, [filteredData])

  // ── Export Functions ──────────────────────────────────────────────────────────

  const exportCSV = () => {
    const header = 'Data,Hora,Categoria,Usuário,Observação\n'
    const rows = filteredData.map(a => {
      const d = parseISO(a.created_at)
      return `${format(d, 'dd/MM/yyyy')},${format(d, 'HH:mm')},${a.categories?.name || ''},${a.profiles?.name || ''},${(a.observation || '').replace(/,/g, ';')}`
    }).join('\n')
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const exportExcel = async () => {
    const XLSX = await import('xlsx')
    const rows = filteredData.map(a => {
      const d = parseISO(a.created_at)
      return {
        Data: format(d, 'dd/MM/yyyy'),
        Hora: format(d, 'HH:mm'),
        Categoria: a.categories?.name || '',
        Usuário: a.profiles?.name || '',
        Observação: a.observation || '',
      }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório')
    XLSX.writeFile(wb, `relatorio_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Client Nunber - Relatório de Atendimentos', 14, 22)
    doc.setFontSize(10)
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30)
    doc.text(`Total de atendimentos: ${stats.total}`, 14, 36)

    autoTable(doc, {
      startY: 44,
      head: [['Data', 'Hora', 'Categoria', 'Usuário', 'Observação']],
      body: filteredData.map(a => {
        const d = parseISO(a.created_at)
        return [
          format(d, 'dd/MM/yyyy'),
          format(d, 'HH:mm'),
          a.categories?.name || '',
          a.profiles?.name || '',
          a.observation || '',
        ]
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [147, 51, 234] },
    })

    doc.save(`relatorio_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ── Filters Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white/80 dark:bg-[#0a0a0a]/80 border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none backdrop-blur-md rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold">Filtros</h3>
        </div>

        {/* Date filter pills */}
        <div className="flex flex-wrap gap-2">
          {DATE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${dateFilter === f.value
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                  : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {dateFilter === 'custom' && (
          <div className="flex gap-4 items-center">
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <span className="text-gray-500">até</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        )}

        {/* Category & User & Search */}
        <div className="flex flex-wrap gap-4">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none min-w-[200px]"
          >
            <option value="all" className="bg-white dark:bg-zinc-950">Todas categorias</option>
            {allCategories.map(c => <option key={c} value={c} className="bg-white dark:bg-zinc-950">{c}</option>)}
          </select>

          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none min-w-[200px]"
          >
            <option value="all" className="bg-white dark:bg-zinc-950">Todos usuários</option>
            {allUsers.map(u => <option key={u} value={u} className="bg-white dark:bg-zinc-950">{u}</option>)}
          </select>

          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 flex-1 min-w-[200px]"
          />
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-6 h-6" />} label="Total de Atendimentos" value={stats.total.toString()} />
        <StatCard icon={<Award className="w-6 h-6" />} label="Mais Frequente" value={stats.mostFrequent?.name || '-'} sub={stats.mostFrequent ? `${stats.mostFrequent.count}x (${stats.mostFrequent.pct}%)` : ''} />
        <StatCard icon={<Calendar className="w-6 h-6" />} label="Dia Mais Movimentado" value={stats.busiestDay.name} sub={`${stats.busiestDay.count} atendimentos`} />
        <StatCard icon={<Clock className="w-6 h-6" />} label="Horário de Pico" value={stats.busiestHour.name} sub={`${stats.busiestHour.count} atendimentos`} />
      </div>

      {/* ── Export Buttons ───────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button onClick={exportPDF} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600/20 border border-red-500/20 text-red-400 hover:bg-red-600/30 transition-all text-sm font-medium">
          <FileText className="w-4 h-4" /> Exportar PDF
        </button>
        <button onClick={exportExcel} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600/20 border border-green-500/20 text-green-400 hover:bg-green-600/30 transition-all text-sm font-medium">
          <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
        </button>
        <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600/20 border border-blue-500/20 text-blue-400 hover:bg-blue-600/30 transition-all text-sm font-medium">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking por Categoria */}
        <ChartCard title="Ranking por Categoria">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stats.ranking} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-white/5" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={11} width={140} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Bar dataKey="count" name="Atendimentos" radius={[0, 8, 8, 0]}>
                {stats.ranking.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pizza */}
        <ChartCard title="Distribuição por Categoria">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={stats.ranking}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={2}
                label={(entry: any) => `${entry.name} (${(entry.percent * 100).toFixed(1)}%)`}
                labelLine={false}
              >
                {stats.ranking.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Por Dia da Semana */}
        <ChartCard title="Atendimentos por Dia da Semana">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weekdayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-white/5" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }} />
              <Bar dataKey="count" name="Atendimentos" fill="#9333ea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Por Hora */}
        <ChartCard title="Atendimentos por Horário">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.hourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-white/5" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }} />
              <Line type="monotone" dataKey="count" name="Atendimentos" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Evolução Diária */}
        {stats.dailyData.length > 1 && (
          <ChartCard title="Evolução Diária" full>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-white/5" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }} />
                <Line type="monotone" dataKey="count" name="Atendimentos" stroke="#7c3aed" strokeWidth={3} dot={{ fill: '#7c3aed', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Ranking por Colaborador */}
        {stats.userRanking.length > 0 && (
          <ChartCard title="Ranking por Colaborador" full={stats.dailyData.length <= 1}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.userRanking}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-white/5" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }} />
                <Bar dataKey="count" name="Atendimentos" fill="#6d28d9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* ── Data Table ──────────────────────────────────────────────────────── */}
      <div className="bg-white/80 dark:bg-[#0a0a0a]/80 border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none backdrop-blur-md rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ArrowDownUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold">Histórico Completo</h3>
          </div>
          <span className="text-sm text-zinc-500 dark:text-gray-500">{filteredData.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="text-left py-3 px-4 text-zinc-500 dark:text-gray-400 font-medium">Data</th>
                <th className="text-left py-3 px-4 text-zinc-500 dark:text-gray-400 font-medium">Hora</th>
                <th className="text-left py-3 px-4 text-zinc-500 dark:text-gray-400 font-medium">Categoria</th>
                <th className="text-left py-3 px-4 text-zinc-500 dark:text-gray-400 font-medium">Usuário</th>
                <th className="text-left py-3 px-4 text-zinc-500 dark:text-gray-400 font-medium">Observação</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-zinc-400 dark:text-gray-500">
                    Nenhum atendimento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredData.slice(0, 100).map(a => {
                  const d = parseISO(a.created_at)
                  return (
                    <tr key={a.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-zinc-700 dark:text-gray-300">{format(d, 'dd/MM/yyyy')}</td>
                      <td className="py-3 px-4 text-zinc-700 dark:text-gray-300">{format(d, 'HH:mm')}</td>
                      <td className="py-3 px-4 text-zinc-900 dark:text-white font-medium">{a.categories?.name || '-'}</td>
                      <td className="py-3 px-4 text-zinc-700 dark:text-gray-300">{a.profiles?.name || '-'}</td>
                      <td className="py-3 px-4 text-zinc-400 dark:text-gray-500">{a.observation || '-'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          {filteredData.length > 100 && (
            <p className="text-center text-gray-500 text-sm mt-4">Mostrando os primeiros 100 de {filteredData.length} registros. Exporte para ver todos.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white/80 dark:bg-[#0a0a0a]/80 border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none backdrop-blur-md rounded-2xl p-6 flex flex-col gap-3 transition-colors duration-300">
      <div className="text-purple-600 dark:text-purple-400">{icon}</div>
      <p className="text-xs text-zinc-400 dark:text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white truncate">{value}</p>
      {sub && <p className="text-xs text-zinc-500 dark:text-gray-400">{sub}</p>}
    </div>
  )
}

function ChartCard({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`bg-white/80 dark:bg-[#0a0a0a]/80 border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none backdrop-blur-md rounded-2xl p-6 transition-colors duration-300 ${full ? 'lg:col-span-2' : ''}`}>
      <h3 className="text-base font-semibold mb-6 text-zinc-800 dark:text-gray-200">{title}</h3>
      {children}
    </div>
  )
}
