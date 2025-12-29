import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface OrderItem {
  name: string
  image: string
  color: string
  size: string
  quantity: number
  price: number
  orderDate: string
}

const orders: OrderItem[] = [
  {
    name: 'Mist Black Triblend',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&dpr=2&q=80',
    color: 'White',
    size: 'Medium',
    quantity: 1,
    price: 120,
    orderDate: 'March 18, 2025',
  },
  {
    name: 'Trendy Black T-shirt',
    image:
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&dpr=2&q=80',
    color: 'Black',
    size: 'Medium',
    quantity: 1,
    price: 90,
    orderDate: 'March 13, 2025',
  },
]

const Orders = () => {
  const totalOrders = orders.length
  const totalAmount = orders.reduce((sum, order) => sum + order.price, 0)
  const lastOrder = orders.reduce((latest, order) => {
    const currentDate = new Date(order.orderDate)
    const latestDate = new Date(latest)
    return currentDate > latestDate ? order.orderDate : latest
  }, orders[0].orderDate)

  return (
    <div className="p-6">
      <Card className="mx-auto my-6 max-w-(--breakpoint-xl)">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:space-y-0 md:gap-x-6">
          <div>
            <CardTitle className="text-2xl">Order History</CardTitle>
            <CardDescription className="text-balance">
              View your past orders and their status
            </CardDescription>
          </div>
          <div className="text-muted-foreground text-end text-sm max-sm:text-start">
            <p>Total Orders: {totalOrders}</p>
            <p>Last Order: {lastOrder}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Item</TableHead>
                <TableHead className="text-end font-semibold">
                  Order Date
                </TableHead>
                <TableHead className="text-end font-semibold">
                  Quantity
                </TableHead>
                <TableHead className="text-end font-semibold">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, i) => (
                <TableRow key={i}>
                  <TableCell className="flex items-center gap-3">
                    <img
                      src={order.image}
                      alt={order.name}
                      className="size-16 rounded-md object-cover"
                    />
                    <div>
                      <p className="font-medium">{order.name}</p>
                      <p className="text-muted-foreground text-sm">{`Color: ${order.color} • Size: ${order.size}`}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-end">{order.orderDate}</TableCell>
                  <TableCell className="text-end">{order.quantity}</TableCell>
                  <TableCell className="text-end">
                    ${order.price.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-transparent">
              <TableRow className="font-semibold hover:bg-transparent">
                <TableCell colSpan={3}></TableCell>
                <TableCell className="text-end">{`$${totalAmount.toFixed(2)}`}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-4">
          <Button variant="default" className="cursor-pointer">
            View Order Details
          </Button>
          <Button variant="secondary" className="cursor-pointer">
            Download Invoice
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Orders
