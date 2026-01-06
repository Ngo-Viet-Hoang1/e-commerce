import ProductCard from '@/components/common/product-card/ProductCard'

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

const TodayBestDeal = () => {
  const displayedProducts = products.slice(0, MAX_ITEMS)

  return (
    <section className="w-full py-12">
      <h2 className="mb-8 text-center text-2xl font-bold text-balance md:text-3xl">
        Today's Best Deals For You!
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            sku={`sku-${product.id}`}
            imageUrl={product.image}
            productName={product.title}
            minPrice={product.price}
            maxPrice={product.originalPrice}
            rating={product.rating}
            tagText="Best Deal"
          />
        ))}
      </div>
    </section>
  )
}

export default TodayBestDeal
