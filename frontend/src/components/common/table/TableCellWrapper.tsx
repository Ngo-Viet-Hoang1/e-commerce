import { cn } from '@/lib/utils'

type Align = 'left' | 'center' | 'right'

export function TableCellAlign({
  align = 'left',
  children,
  className,
}: {
  align?: Align
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex h-full items-center',
        align === 'left' && 'justify-start text-left',
        align === 'center' && 'justify-center text-center',
        align === 'right' && 'justify-end text-right',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function TableIconCell({
  children,
  muted,
  className,
  onClick,
}: {
  children: React.ReactNode
  muted?: boolean
  className?: string
  onClick?: () => void
}) {
  return (
    <span
      className={cn(
        'flex items-center justify-center gap-2',
        muted && 'text-muted-foreground',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </span>
  )
}

export function TableTextCell({
  children,
  muted,
  small,
  truncate = true,
  className,
}: {
  children: React.ReactNode
  muted?: boolean
  small?: boolean
  truncate?: boolean
  className?: string
}) {
  return (
    <span
      title={typeof children === 'string' ? children : undefined}
      className={cn(
        truncate && 'truncate',
        small && 'text-sm',
        muted && 'text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}
