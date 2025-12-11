import type { UseFormRegisterReturn } from 'react-hook-form'
import { Field, FieldDescription, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import type { HTMLInputTypeAttribute } from 'react'

interface FormFieldProps {
  id: string
  label: string
  type: HTMLInputTypeAttribute
  placeholder?: string
  register: UseFormRegisterReturn
  description?: string
  error?: string
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  placeholder,
  register,
  description,
  error,
}) => {
  return (
    <Field className="gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} type={type} placeholder={placeholder} {...register} />
      {error ? (
        <FieldDescription className="text-red-400">{error}</FieldDescription>
      ) : (
        <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  )
}

export default FormField
