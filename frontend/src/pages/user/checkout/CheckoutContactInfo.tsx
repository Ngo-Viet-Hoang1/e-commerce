import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface ContactFormData {
  email: string
  firstName: string
  lastName: string
  phone: string
}

interface CheckoutContactInfoProps {
  formData: ContactFormData
  onChange: (field: keyof ContactFormData, value: string) => void
}

export default function CheckoutContactInfo({
  formData,
  onChange,
}: CheckoutContactInfoProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="mt-2"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Họ</Label>
          <Input
            id="firstName"
            placeholder="Nguyễn Văn"
            value={formData.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className="mt-2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Tên</Label>
          <Input
            id="lastName"
            placeholder="An"
            value={formData.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Số điện thoại <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="0912345678"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="mt-2"
          required
        />
      </div>
    </div>
  )
}
