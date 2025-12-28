import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Sample product data - Added originalPrice
const products = [
  {
    id: 1,
    title: 'Wireless Headphones',
    description: 'Premium noise-cancelling experience',
    price: 349.0,
    originalPrice: 399.0,
    rating: 5,
    reviews: 121,
    image: 'https://ui.shadcn.com/placeholder.svg',
  },
  {
    id: 2,
    title: 'Smart Watch',
    description: 'Health and fitness companion',
    price: 399.0,
    originalPrice: 449.0,
    rating: 5,
    reviews: 156,
    image: 'https://ui.shadcn.com/placeholder.svg',
  },
  {
    id: 3,
    title: 'Laptop Pro',
    description: 'Power and performance redefined',
    price: 1299.0,
    originalPrice: 1499.0,
    rating: 5,
    reviews: 89,
    image: 'https://ui.shadcn.com/placeholder.svg',
  },
  {
    id: 4,
    title: 'RGB Keyboard',
    description: 'Mechanical RGB backlit keyboard',
    price: 159.0,
    originalPrice: 199.0,
    rating: 5,
    reviews: 92,
    image: 'https://ui.shadcn.com/placeholder.svg',
  },
  {
    id: 5,
    title: 'Gaming Monitor',
    description: '144Hz refresh rate display',
    price: 699.0,
    originalPrice: 799.0,
    rating: 5,
    reviews: 78,
    image: 'https://ui.shadcn.com/placeholder.svg',
  },
  {
    id: 6,
    title: 'Smartphone Pro',
    description: 'Pro camera system, ProMotion',
    price: 999.0,
    originalPrice: 1099.0,
    rating: 5,
    reviews: 245,
    image: 'https://ui.shadcn.com/placeholder.svg',
  },
]

const MAX_ITEMS = 6

const ProductCard = () => {
  const displayedProducts = products.slice(0, MAX_ITEMS)

  return (
    <section className="w-full py-12">
      <h2 className="mb-8 text-center text-2xl font-bold text-balance md:text-3xl">
        Today's Best Deals For You!
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:gap-6 xl:grid-cols-6">
        {displayedProducts.map((product) => (
          <Card
            key={product.id}
            className="flex flex-col gap-4 overflow-hidden rounded-lg py-4 shadow-none transition-shadow duration-300 hover:shadow-md"
          >
            <CardContent className="flex flex-1 flex-col gap-4 px-4">
              {/* Image container - Heart button removed */}
              <div className="aspect-square overflow-hidden">
                {/* <img
                  src={product.image}
                  alt={product.title}
                  className='size-full rounded-md object-contain'
                  loading='lazy'
                  width={400}
                  height={400}
                /> */}
                <img
                  src="https://ui.shadcn.com/placeholder.svg"
                  alt="placeholder image"
                  className="rounded-md dark:brightness-[0.95] dark:invert"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <h3 className="mb-1 font-medium text-balance">
                  {product.title}
                </h3>
                <div className="mt-auto flex items-baseline gap-2">
                  <p className="font-semibold">${product.price.toFixed(2)}</p>
                  {product.originalPrice && (
                    <p className="text-muted-foreground text-sm line-through md:text-base xl:text-sm 2xl:text-base">
                      ${product.originalPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-3 md:px-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full cursor-pointer text-sm"
              >
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default ProductCard
