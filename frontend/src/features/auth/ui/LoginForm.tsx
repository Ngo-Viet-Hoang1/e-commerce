import AuthService from '../api/auth.service'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
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
import { useAuthStore } from '@/features/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Spinner } from '@/shared/ui/spinner'
import FormField from '@/shared/ui/FormField'

const LoginForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const { setAccessToken, setMe } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/'
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const submitLoginForm: SubmitHandler<LoginInputs> = async ({
    email,
    password,
  }) => {
    try {
      const { success, data, message } = await AuthService.login({
        email,
        password,
      })

      if (success && data?.accessToken) {
        setAccessToken(data.accessToken)

        const meResponse = await AuthService.getMe()
        if (meResponse.success && meResponse.data?.me) {
          setMe(meResponse.data.me)
        }

        toast.success(message ?? 'Đăng nhập thành công!')
        navigate(from, { replace: true })
      }
    } catch {
      toast.error(
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin tài khoản.',
      )
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit(submitLoginForm)} className="p-6 md:p-8">
            <FieldSet disabled={isSubmitting}>
              <FieldGroup className="gap-5">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Chào mừng trở lại</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Đăng nhập tài khoản mua sắm của bạn
                  </p>
                </div>

                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  register={register('email')}
                  error={errors.email?.message}
                />
                <Field>
                  <div className="flex items-center justify-between">
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
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="mr-2" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                </Field>
                <FieldDescription className="text-center">
                  Chưa có tài khoản?{' '}
                  <Link
                    to="/auth/register"
                    className="text-primary font-medium hover:underline"
                  >
                    Đăng ký ngay
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </FieldSet>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=800&q=80"
              alt="E-commerce shopping"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3]"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="text-muted-foreground px-6 text-center text-xs">
        Bằng việc tiếp tục, bạn đồng ý với{' '}
        <a href="#" className="underline">
          Điều khoản dịch vụ
        </a>{' '}
        và{' '}
        <a href="#" className="underline">
          Chính sách bảo mật
        </a>{' '}
        của chúng tôi.
      </FieldDescription>
    </div>
  )
}

export default LoginForm
