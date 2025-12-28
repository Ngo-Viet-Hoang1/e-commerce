import { Star } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

interface Product {
  id: number
  title: string
  image: string
  price: number
  rating: number
}

const products: Product[] = [
  {
    id: 1,
    title: 'Eclax Semispherical',
    image:
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=60&w=600&auto=format&fit=crop',
    price: 399,
    rating: 5,
  },
  {
    id: 2,
    title: 'Eclax Cone',
    image:
      'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?q=60&w=600&auto=format&fit=crop',
    price: 399,
    rating: 4,
  },
  {
    id: 3,
    title: 'Eclax Cage Pack',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=60&w=600&auto=format&fit=crop',
    price: 399,
    rating: 5,
  },
]

const ProductCard = () => {
  return (
    <section className="space-y-8 py-12">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold text-balance sm:text-4xl">
          Popular Products
        </h2>
        <p className="text-muted-foreground max-w-[60ch] text-balance">
          This beloved product has become a favorite among our customers for its
          exceptional features and unparalleled performance
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {products.map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden transition-all hover:shadow-lg"
          >
            <CardContent className="space-y-4 pt-6">
              <div className="overflow-hidden rounded-md">
                <img
                  src={product.image}
                  alt={product.title}
                  width={400}
                  height={400}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="space-y-2">
                <CardTitle className="line-clamp-1 text-lg font-semibold text-balance sm:text-xl">
                  {product.title}
                </CardTitle>

                <div
                  className="flex items-center gap-0.5"
                  aria-label={`${product.rating} out of 5 stars`}
                  role="img"
                >
                  {Array.from({ length: product.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="fill-foreground text-foreground size-4 sm:size-5"
                    />
                  ))}
                </div>

                <p className="text-lg font-semibold sm:text-xl">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default ProductCard
