import { GalleryVerticalEnd } from 'lucide-react'

import AdminAuthService from '@/api/services/admin/auth.admin.service'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { loginSchema, type LoginInputs } from '@/schema/auth.schema'
import { useAdminAuthStore } from '@/store/zustand/useAuthStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Spinner } from '../ui/spinner'
import FormField from './FormField'

const AdminLoginForm = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => {
  const setMe = useAdminAuthStore((state) => state.setMe)
  const setAccessToken = useAdminAuthStore((state) => state.setAccessToken)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    reValidateMode: 'onChange',
  })

  const handleSubmitForm: SubmitHandler<LoginInputs> = async (credentials) => {
    try {
      const { success, data, message } =
        await AdminAuthService.login(credentials)
      if (success && data?.accessToken) {
        setAccessToken(data.accessToken)
        if (success && data?.accessToken) {
          toast.success(message ?? 'Login successful!')
          const { success, data } = await AdminAuthService.getMe()
          if (success && data?.me) {
            setMe(data.me)
          } else {
            toast.error('Failed to fetch admin details after login.')
          }
          navigate('/admin/dashboard')
        }
      }
    } catch {
      toast.error(
        'Admin login failed. Please check your credentials and try again.',
      )
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <FieldSet disabled={isSubmitting}>
          <FieldGroup className="gap-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex size-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">Acme Inc.</span>
              </a>
              <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
              <FieldDescription>
                Sign in to your admin account to continue
              </FieldDescription>
            </div>
            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="johndoe@gmail.com"
              register={register('email')}
              error={errors.email?.message}
            />

            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="***********"
                {...register('password')}
              />
            </Field>
            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner />}Login
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}

export default AdminLoginForm
