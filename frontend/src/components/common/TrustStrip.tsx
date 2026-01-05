import { cn } from '@/lib/utils'
import { RotateCcw, Shield, Star, Truck } from 'lucide-react'

interface TrustItem {
  icon: React.ReactNode
  title: string
  description?: string
  colorClass?: string
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
    colorClass:
      'bg-blue-50 text-blue-600 ring-blue-100 hover:bg-blue-100 hover:ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-900/50',
  },
  {
    icon: <RotateCcw className="size-5" />,
    title: 'Easy Returns',
    description: '30-day return policy',
    colorClass:
      'bg-green-50 text-green-600 ring-green-100 hover:bg-green-100 hover:ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-900/50',
  },
  {
    icon: <Shield className="size-5" />,
    title: 'Secure Payment',
    description: '100% protected',
    colorClass:
      'bg-purple-50 text-purple-600 ring-purple-100 hover:bg-purple-100 hover:ring-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:ring-purple-900/50',
  },
  {
    icon: <Star className="size-5" />,
    title: '4.9/5 Rating',
    description: 'From 10,000+ reviews',
    colorClass:
      'bg-amber-50 text-amber-600 ring-amber-100 hover:bg-amber-100 hover:ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-900/50',
  },
]

const TrustStrip = ({ items = DEFAULT_ITEMS, className }: TrustStripProps) => {
  return (
    <section
      className={cn(
        'border-y bg-slate-50/50 py-8 dark:bg-slate-900/50',
        className,
      )}
    >
      <div className="container">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="group flex items-center gap-4 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div
                className={cn(
                  'flex size-12 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 transition-all duration-200 group-hover:shadow-md',
                  item.colorClass ??
                    'bg-primary/10 text-primary ring-primary/10 hover:bg-primary/15 hover:ring-primary/20',
                )}
              >
                {item.icon}
              </div>

              {/* Text content */}
              <div className="min-w-0 flex-1">
                <p className="text-foreground leading-tight font-semibold">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-muted-foreground mt-0.5 text-sm">
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
