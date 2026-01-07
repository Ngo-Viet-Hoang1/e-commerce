import ProductCard from '@/components/common/product-card/ProductCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

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
    price: 399999999,
    rating: 5,
  },
  {
    id: 2,
    title: 'Eclax Cone',
    image:
      'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?q=60&w=600&auto=format&fit=crop',
    price: 399999999,
    rating: 4,
  },
  {
    id: 3,
    title: 'Eclax Cage Pack',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=60&w=600&auto=format&fit=crop',
    price: 499999999,
    rating: 5,
  },
]

const BestSeller = () => {
  return (
    <section className="space-y-8 py-12">
      <header className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-balance sm:text-4xl">
          Best Sellers
        </h2>
        <p className="text-muted-foreground mx-auto max-w-[160ch] text-balance">
          Top-performing products that consistently deliver quality, durability,
          and customer satisfaction.
        </p>
      </header>

      <Carousel>
        <CarouselContent>
          {products.map((p) => (
            <CarouselItem
              key={p.id}
              className="basis-full pl-2 sm:basis-1/2 md:pl-4 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard
                key={p.id}
                imageUrl={p.image}
                productName={p.title}
                sku={String(p.id)}
                minPrice={p.price}
                maxPrice={p.price * 1.2}
                minSalePrice={p.price * 0.8}
                rating={p.rating}
                tagText="Best Seller"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden lg:flex" />
        <CarouselNext className="hidden lg:flex" />
      </Carousel>
    </section>
  )
}

export default BestSeller
