'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registerAttendance(categoryId: string, observation?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  const { error } = await supabase
    .from('attendances')
    .insert({
      category_id: categoryId,
      user_id: user.id,
      observation: observation || null
    })

  if (error) {
    console.error('Erro ao registrar atendimento:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/reports')
  return { success: true }
}
