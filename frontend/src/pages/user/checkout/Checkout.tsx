import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  CreditCard,
  Eye,
  EyeOff,
  Gift,
  Lock,
  Shield,
  Tag,
  Truck,
} from 'lucide-react'

export default function Checkout() {
  const [step, setStep] = useState(1)
  const [showCvv, setShowCvv] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    email: '',
    firstName: '',
    lastName: '',
    phone: '',

    // Shipping Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',

    // Payment
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',

    // Options
    saveInfo: false,
    sameAsBilling: true,
    newsletter: false,
    promoCode: '',
  })

  const [orderSummary] = useState({
    items: [
      {
        id: 1,
        name: 'Premium Wireless Headphones',
        variant: 'Midnight Black',
        price: 299.99,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=60',
      },
      {
        id: 2,
        name: 'Leather Laptop Sleeve',
        variant: 'Brown, 13-inch',
        price: 89.99,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&auto=format&fit=crop&q=60',
      },
    ],
    shipping: 15.99,
    tax: 27.54,
    discount: 0,
    promoDiscount: 0,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCardNumberChange = (value: string) => {
    // Format card number with spaces
    const formatted = value
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
    handleInputChange('cardNumber', formatted)
  }

  const handleExpiryChange = (value: string) => {
    // Format expiry as MM/YY
    const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')
    handleInputChange('expiryDate', formatted)
  }

  const subtotal = orderSummary.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const total =
    subtotal +
    orderSummary.shipping +
    orderSummary.tax -
    orderSummary.discount -
    orderSummary.promoDiscount

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  return (
    <div className="bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-balance">
            Secure Checkout
          </h1>
          <p className="text-muted-foreground">
            Complete your purchase in just a few steps
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    stepNumber <= step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`mx-4 h-1 w-16 rounded transition-colors ${
                      stepNumber < step ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">
                  {step === 1 && 'Contact Information'}
                  {step === 2 && 'Shipping Address'}
                  {step === 3 && 'Payment Details'}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "We'll use this to send you order updates"}
                  {step === 2 && 'Where should we deliver your order?'}
                  {step === 3 &&
                    'Your payment information is secure and encrypted'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Contact Information */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-kL9x23P">Email address</Label>
                      <Input
                        id="email-kL9x23P"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        className="mt-2"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName-mN7z84Q">First name</Label>
                        <Input
                          id="firstName-mN7z84Q"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange('firstName', e.target.value)
                          }
                          className="mt-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName-pL8w45T">Last name</Label>
                        <Input
                          id="lastName-pL8w45T"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange('lastName', e.target.value)
                          }
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone-rM6n82S">
                        Phone number (optional)
                      </Label>
                      <Input
                        id="phone-rM6n82S"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange('phone', e.target.value)
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Shipping Address */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address-qP4z17X">Street address</Label>
                      <Input
                        id="address-qP4z17X"
                        placeholder="123 Main Street"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange('address', e.target.value)
                        }
                        className="mt-2"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city-sT5y91B">City</Label>
                        <Input
                          id="city-sT5y91B"
                          placeholder="New York"
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange('city', e.target.value)
                          }
                          className="mt-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state-wX3k85M">State</Label>
                        <Input
                          id="state-wX3k85M"
                          placeholder="NY"
                          value={formData.state}
                          onChange={(e) =>
                            handleInputChange('state', e.target.value)
                          }
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode-vZ9q46N">ZIP code</Label>
                        <Input
                          id="zipCode-vZ9q46N"
                          placeholder="10001"
                          value={formData.zipCode}
                          onChange={(e) =>
                            handleInputChange('zipCode', e.target.value)
                          }
                          className="mt-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country-bH7l52P">Country</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) =>
                            handleInputChange('country', value)
                          }
                        >
                          <SelectTrigger
                            id="country-bH7l52P"
                            className="mt-2 w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div className="space-y-6">
                    {/* Payment Method */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">
                        Payment method
                      </Label>
                      <RadioGroup defaultValue="card" className="space-y-3">
                        <div className="flex items-center space-x-3 rounded-lg border p-4">
                          <RadioGroupItem
                            value="card"
                            id="card-payment-cN9m74K"
                          />
                          <CreditCard className="text-muted-foreground size-5" />
                          <Label
                            htmlFor="card-payment-cN9m74K"
                            className="flex-1 cursor-pointer"
                          >
                            Credit or debit card
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber-dK5p83L">Card number</Label>
                        <Input
                          id="cardNumber-dK5p83L"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) =>
                            handleCardNumberChange(e.target.value)
                          }
                          maxLength={19}
                          className="mt-2"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate-fJ6r29M">Expiry</Label>
                          <Input
                            id="expiryDate-fJ6r29M"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            maxLength={5}
                            className="mt-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv-gH8s34N">CVV</Label>
                          <div className="relative">
                            <Input
                              id="cvv-gH8s34N"
                              type={showCvv ? 'text' : 'password'}
                              placeholder="123"
                              value={formData.cvv}
                              onChange={(e) =>
                                handleInputChange('cvv', e.target.value)
                              }
                              maxLength={4}
                              className="mt-2 pe-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute end-0 top-1/2 h-full -translate-y-1/2 cursor-pointer hover:bg-transparent"
                              onClick={() => setShowCvv(!showCvv)}
                            >
                              {showCvv ? (
                                <EyeOff className="text-muted-foreground size-4" />
                              ) : (
                                <Eye className="text-muted-foreground size-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardName-hI9t45O">Name on card</Label>
                          <Input
                            id="cardName-hI9t45O"
                            placeholder="John Doe"
                            value={formData.cardName}
                            onChange={(e) =>
                              handleInputChange('cardName', e.target.value)
                            }
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveInfo-jK0u56P"
                          checked={formData.saveInfo}
                          onCheckedChange={(checked) =>
                            handleInputChange('saveInfo', checked as boolean)
                          }
                        />
                        <Label htmlFor="saveInfo-jK0u56P" className="text-sm">
                          Save payment information for future purchases
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>

                  {step < 3 ? (
                    <Button onClick={nextStep} className="cursor-pointer">
                      Continue
                    </Button>
                  ) : (
                    <Button className="flex cursor-pointer items-center gap-2">
                      <Lock className="size-4" />
                      Complete Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-balance">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-4">
                  {orderSummary.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <Badge
                          variant="secondary"
                          className="absolute -end-2 -top-2 size-6 rounded-full p-0 text-xs"
                        >
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium">
                          {item.name}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {item.variant}
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          ${item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Promo Code */}
                <div className="space-y-2">
                  <Label htmlFor="promoCode-kL1m67Q" className="text-sm">
                    Promo code
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoCode-kL1m67Q"
                      placeholder="Enter code"
                      value={formData.promoCode}
                      onChange={(e) =>
                        handleInputChange('promoCode', e.target.value)
                      }
                    />
                    <Button variant="outline" className="cursor-pointer">
                      Apply
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Truck className="size-3" />
                      Shipping
                    </span>
                    <span>${orderSummary.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${orderSummary.tax.toFixed(2)}</span>
                  </div>
                  {orderSummary.promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="size-3" />
                        Promo discount
                      </span>
                      <span>-${orderSummary.promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {/* Trust Indicators */}
                <div className="space-y-3 pt-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Shield className="size-4 text-green-600" />
                    <span>SSL encrypted checkout</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Truck className="size-4 text-blue-600" />
                    <span>Free shipping on orders over $75</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Gift className="size-4 text-purple-600" />
                    <span>30-day return policy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
