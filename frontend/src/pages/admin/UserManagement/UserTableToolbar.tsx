import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const UserTableToolbar = ({ onCreate }: { onCreate: () => void }) => {
  return (
    <div className="ml-auto flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onCreate}>
        <Plus />
        Create User
      </Button>
    </div>
  )
}

export default UserTableToolbar
