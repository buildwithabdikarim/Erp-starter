import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { getSession } from '@/lib/auth-utils'

export default async function SignUpPage() {
  const session = await getSession()
  if (session?.user) redirect('/')
  return <AuthForm mode="sign-up" />
}
