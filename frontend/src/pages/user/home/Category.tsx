import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    id: 1,
    name: 'Electronics',
    description: 'Laptops, phones, and gadgets',
    itemCount: 1248,
    image:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=60',
    trending: true,
  },
  {
    id: 2,
    name: 'Fashion',
    description: 'Clothing, shoes, and accessories',
    itemCount: 2156,
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=60',
    trending: false,
  },
  {
    id: 3,
    name: 'Home & Garden',
    description: 'Furniture, decor, and tools',
    itemCount: 892,
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=60',
    trending: false,
  },
  {
    id: 4,
    name: 'Sports & Outdoors',
    description: 'Fitness, camping, and recreation',
    itemCount: 674,
    image:
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=60',
    trending: true,
  },
  {
    id: 5,
    name: 'Books & Media',
    description: 'Books, music, and entertainment',
    itemCount: 1567,
    image:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=60',
    trending: false,
  },
  {
    id: 6,
    name: 'Health & Beauty',
    description: 'Skincare, cosmetics, and wellness',
    itemCount: 743,
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=60',
    trending: true,
  },
]

export default function ProductCategory() {
  return (
    <section className="py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-balance">
          Shop by Category
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Discover products across our most popular categories
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="group cursor-pointer overflow-hidden py-0 transition-all duration-500 hover:shadow-lg"
          >
            <div className="relative aspect-5/4 overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

              {/* Trending Badge */}
              {category.trending && (
                <Badge className="absolute top-4 left-4">Trending</Badge>
              )}

              {/* Category Info Overlay */}
              <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
                <h3 className="mb-1 text-xl font-bold">{category.name}</h3>
                <p className="mb-3 text-sm text-white/90">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {category.itemCount.toLocaleString()} items
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="cursor-pointer border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  >
                    Browse
                    <ArrowRight className="ms-2 size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
