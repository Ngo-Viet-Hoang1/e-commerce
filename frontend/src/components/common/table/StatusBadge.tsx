import { Badge } from '@/components/ui/badge'

type Status = 'active' | 'inactive' | 'deleted'

export function StatusBadge({ status }: { status: Status }) {
  if (status === 'deleted') {
    return <Badge variant="destructive">Deleted</Badge>
  }

  if (status === 'active') {
    return (
      <Badge className="bg-green-600 text-white hover:bg-green-600">
        Active
      </Badge>
    )
  }

  return (
    <Badge className="bg-yellow-500 text-white hover:bg-yellow-500">
      Inactive
    </Badge>
  )
}
