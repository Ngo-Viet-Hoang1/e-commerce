import { Truck } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Progress } from '@/components/ui/progress'

interface PromoBannerProps {
  threshold?: number
  currentAmount?: number
  className?: string
}

const PromoBanner = ({
  threshold = 75,
  currentAmount = 45,
  className,
}: PromoBannerProps) => {
  const progress = Math.min((currentAmount / threshold) * 100, 100)
  const remaining = threshold - currentAmount
  const hasQualified = remaining <= 0

  return (
    <div className={cn('w-full bg-emerald-600 text-emerald-50', className)}>
      <div className="container flex items-center justify-center gap-3">
        <Truck className="size-4 shrink-0" />
        {hasQualified ? (
          <p className="text-sm font-medium">
            🎉 You&apos;ve unlocked FREE shipping!
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-emerald-50">
              Spend{' '}
              <span className="font-semibold">${remaining.toFixed(2)}</span>{' '}
              more for <span className="font-semibold">FREE shipping</span>
            </p>
            <Progress
              value={progress}
              className="hidden h-1.5 w-24 bg-emerald-500 sm:block [&>div]:bg-white"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export { PromoBanner }
