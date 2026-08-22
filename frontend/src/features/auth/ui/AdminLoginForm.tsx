import { GalleryVerticalEnd } from 'lucide-react'

import AdminAuthService from '../api/auth.admin.service'
import { Button } from '@/shared/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/utils'
import { loginSchema, type LoginInputs } from '@/shared/types/auth.schema'
import { useAdminAuthStore } from '@/features/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Spinner } from '@/shared/ui/spinner'
import FormField from '@/shared/ui/FormField'

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
        // Set token so subsequent requests have Authorization header
        setAccessToken(data.accessToken)
        
        // Fetch user profile immediately
        const meRes = await AdminAuthService.getMe()
        if (meRes.success && meRes.data?.me) {
          setMe(meRes.data.me)
          toast.success(message ?? 'Đăng nhập trang quản trị thành công!')
          navigate('/admin/dashboard', { replace: true })
        } else {
          toast.error('Không thể tải thông tin tài khoản quản trị.')
        }
      }
    } catch {
      toast.error(
        'Đăng nhập quản trị thất bại. Vui lòng kiểm tra lại email và mật khẩu.',
      )
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <FieldSet disabled={isSubmitting}>
          <FieldGroup className="gap-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <h1 className="text-2xl font-bold">Cổng Quản Trị Hệ Thống</h1>
              <FieldDescription>
                Đăng nhập tài khoản Quản trị viên để tiếp tục
              </FieldDescription>
            </div>
            <FormField
              id="email"
              label="Email quản trị"
              type="email"
              placeholder="admin@example.com"
              register={register('email')}
              error={errors.email?.message}
            />

            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                {...register('password')}
              />
            </Field>
            <FieldDescription className="text-red-500">
              {errors.password?.message}
            </FieldDescription>

            <Field>
              <Button type="submit" size="lg" className="w-full cursor-pointer" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập quản trị'
                )}
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  )
}

export default AdminLoginForm
