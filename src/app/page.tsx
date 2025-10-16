import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirecionar da raiz para a página principal do dashboard
  redirect('/dashboard')
}
