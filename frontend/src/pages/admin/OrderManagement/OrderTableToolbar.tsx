import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

const OrderTableToolbar = () => {
  return (
    <div className="ml-auto flex items-center gap-2">
      <Button variant="outline" size="sm">
        <FileDown />
        Export
      </Button>
    </div>
  )
}

export default OrderTableToolbar
