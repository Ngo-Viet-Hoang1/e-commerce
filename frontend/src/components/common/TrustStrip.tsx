import { RotateCcw, Shield, Star, Truck } from 'lucide-react'

import { cn } from '@/lib/utils'

interface TrustItem {
  icon: React.ReactNode
  title: string
  description?: string
}

interface TrustStripProps {
  items?: TrustItem[]
  className?: string
}

const DEFAULT_ITEMS: TrustItem[] = [
  {
    icon: <Truck className="size-5" />,
    title: 'Free Shipping',
    description: 'On orders over $50',
  },
  {
    icon: <RotateCcw className="size-5" />,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: <Shield className="size-5" />,
    title: 'Secure Payment',
    description: '100% protected',
  },
  {
    icon: <Star className="size-5" />,
    title: '4.9/5 Rating',
    description: 'From 10,000+ reviews',
  },
]

const TrustStrip = ({ items = DEFAULT_ITEMS, className }: TrustStripProps) => {
  return (
    <section className={cn('bg-muted/30 border-y py-6', className)}>
      <div className="container">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                {item.icon}
              </div>
              <div>
                <p className="leading-tight font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { TrustStrip }
