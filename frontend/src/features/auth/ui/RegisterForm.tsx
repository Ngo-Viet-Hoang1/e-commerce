import AuthService from '../api/auth.service'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from '@/shared/ui/field'
import { cn } from '@/shared/utils'
import { registerInputsSchema, type RegisterInputs } from '@/shared/types/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Spinner } from '@/shared/ui/spinner'
import FormField from '@/shared/ui/FormField'

const RegisterForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerInputsSchema),
    reValidateMode: 'onChange',
  })

  const password = watch('password')

  useEffect(() => {
    const { confirmPassword } = touchedFields
    if (confirmPassword) {
      trigger('confirmPassword')
    }
  }, [password, trigger, touchedFields])

  const onSubmit: SubmitHandler<RegisterInputs> = async ({
    username,
    email,
    password,
  }) => {
    try {
      const res = await AuthService.register({ email, password, username })
      if (res?.success) {
        toast.success('Registration successful! Please log in.')
        navigate('/auth/login')
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error(String(error.message))
      } else {
        toast.error('Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <FieldSet disabled={isSubmitting}>
              <FieldGroup className="gap-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Create your account</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to create your account
                  </p>
                </div>
                <FormField
                  id="name"
                  label="Username"
                  type="text"
                  placeholder="John Doe"
                  register={register('username')}
                  description="This will be your public display name."
                  error={errors.username?.message}
                />
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  register={register('email')}
                  description="We'll use this to contact you."
                  error={errors.email?.message}
                />
                <FormField
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="***********"
                  register={register('password')}
                  description="Password must be at least 8 characters"
                  error={errors.password?.message}
                />
                <FormField
                  id="confirm-password"
                  label="Confirm Password"
                  type="password"
                  placeholder="***********"
                  register={register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner />}Create Account
                  </Button>
                </Field>
                <FieldDescription className="text-center">
                  Already have an account? <Link to="/auth/login">Sign in</Link>
                </FieldDescription>
              </FieldGroup>
            </FieldSet>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{' '}
        <Link to="#">Terms of Service</Link> and{' '}
        <Link to="#">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}

export default RegisterForm
