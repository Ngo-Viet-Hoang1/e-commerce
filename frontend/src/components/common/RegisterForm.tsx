import AuthService from '@/api/services/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Spinner } from '../ui/spinner'
import FormField from './FormField'

export interface SignUpInputs {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const RegisterForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInputs>()

  const onSubmit: SubmitHandler<SignUpInputs> = async ({
    username,
    email,
    password,
    confirmPassword,
  }) => {
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match')
    }

    if (!email || !password)
      return toast.error('Email and password are required')

    try {
      const res = await AuthService.register(email, password, username)
      if (res?.data?.success) {
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
              <FieldGroup className="gap-3">
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
                  register={register('username', {
                    required: 'Username is required',
                  })}
                  description="This will be your public display name."
                  error={errors.username?.message}
                />
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  register={register('email', {
                    required: 'Email is required',
                  })}
                  description="We'll use this to contact you."
                  error={errors.email?.message}
                />
                <Field>
                  <Field className="grid grid-cols-2 gap-4">
                    <FormField
                      id="password"
                      label="Password"
                      type="password"
                      placeholder="***********"
                      register={register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message:
                            'Password must be at least 8 characters long',
                        },
                      })}
                      error={errors.password?.message}
                    />
                    <FormField
                      id="confirm-password"
                      label="Confirm Password"
                      type="password"
                      placeholder="***********"
                      register={register('confirmPassword', {
                        required: 'Confirm Password is required',
                        validate: (value) =>
                          value === watch('password') ||
                          'Passwords do not match',
                      })}
                      error={errors.confirmPassword?.message}
                    />
                  </Field>
                </Field>
                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner />}Create Account
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
                </Button>
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
