import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface StatusOption<T extends string = string> {
  value: T
  label: string
  disabled: boolean
}

export interface StatusDropdownProps<T extends string = string> {
  currentStatus: T
  options: StatusOption<T>[]
  onStatusChange: (newStatus: T) => void
  getStatusColor: (status: T) => string
  getStatusLabel?: (status: T) => string
  disabled?: boolean
  badgeClassName?: string
}

export function StatusDropdown<T extends string = string>({
  currentStatus,
  options,
  onStatusChange,
  getStatusColor,
  getStatusLabel,
  disabled = false,
  badgeClassName = '',
}: StatusDropdownProps<T>) {
  const allDisabled = options.every(
    (opt) => opt.disabled || opt.value === currentStatus,
  )
  const isDisabled = disabled || allDisabled

  const displayLabel = getStatusLabel
    ? getStatusLabel(currentStatus)
    : currentStatus

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isDisabled}>
        <button
          className={`inline-flex items-center gap-1 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isDisabled}
        >
          <Badge
            variant="secondary"
            className={`px-2 py-1 ${getStatusColor(currentStatus)} ${!isDisabled ? 'hover:opacity-80' : ''} ${badgeClassName}`}
          >
            {displayLabel}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            disabled={option.disabled || option.value === currentStatus}
            onClick={() => onStatusChange(option.value)}
            className={option.value === currentStatus ? 'bg-accent' : ''}
          >
            <Badge
              variant="secondary"
              className={`${getStatusColor(option.value)} mr-2`}
            >
              {option.label}
            </Badge>
            {option.value === currentStatus && (
              <span className="text-muted-foreground text-xs">(current)</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
