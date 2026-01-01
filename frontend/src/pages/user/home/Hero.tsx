import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { ArrowRight, Flame, ShoppingBag, Star, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Product {
  id: number
  name: string
  image: string
  price: number
  rating: number
  reviews: number
  trending: boolean
  discount: string
  tag: string
}

const storeData = {
  title: 'Discover Your Perfect Style',
  subtitle:
    'Explore our curated collection of premium products. Each piece is handpicked for those who appreciate quality and style.',
  featuredProducts: [
    {
      id: 1,
      name: 'Classic Watch',
      image:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&dpr=2&q=40',
      price: 299,
      rating: 4.9,
      reviews: 128,
      trending: true,
      tag: 'Best Seller',
    },
    {
      id: 2,
      name: 'Premium Headphones',
      image:
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&q=40',
      price: 199,
      rating: 4.8,
      reviews: 256,
      trending: true,
      discount: 'Free Shipping',
      tag: 'New Arrival',
    },
    {
      id: 3,
      name: 'Luxury Sunglasses',
      image:
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&dpr=2&q=40',
      price: 159,
      rating: 4.7,
      reviews: 189,
      trending: true,
      discount: 'Limited Stock',
      tag: 'Premium',
    },
    {
      id: 4,
      name: 'Smart Watch Pro',
      image:
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&dpr=2&q=40',
      price: 349,
      rating: 4.9,
      reviews: 312,
      trending: true,
      discount: 'Early Bird',
      tag: 'Featured',
    },
  ] as Product[],
}

export default function StorefrontHero() {
  const navigate = useNavigate()
  const [api, setApi] = useState<{
    selectedScrollSnap: () => number
    scrollTo: (index: number) => void
  }>()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-scroll functionality
  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % storeData.featuredProducts.length
      api.scrollTo(nextSlide)
      setCurrentSlide(nextSlide)
    }, 5000)

    return () => clearInterval(interval)
  }, [api, currentSlide])

  return (
    <section className="relative py-6">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <header className="space-y-8">
          <Badge variant="outline" className="rounded-full px-4 py-2">
            <TrendingUp className="me-1 size-4!" />
            New Collection 2025
          </Badge>

          <h1 className="text-5xl leading-tight font-bold text-balance md:text-6xl lg:text-7xl">
            {storeData.title}
          </h1>

          <p className="text-muted-foreground max-w-lg text-xl text-balance">
            {storeData.subtitle}
          </p>

          <div className="flex gap-4">
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer gap-2 rounded-full bg-emerald-500 px-8 text-white"
              onClick={() => navigate('/product-catalog')}
            >
              <ShoppingBag className="size-4" />
              View Catalog
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <div className="relative h-[500px] w-full border-0">
            <Carousel
              className="group size-full"
              setApi={setApi}
              opts={{
                align: 'start',
                loop: true,
                duration: 20,
                skipSnaps: true,
              }}
              onSelect={() => {
                if (api) {
                  setCurrentSlide(api.selectedScrollSnap())
                }
              }}
            >
              <CarouselContent className="h-full">
                {storeData.featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="h-full">
                    <Card className="relative size-full overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative size-full overflow-hidden rounded-md">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-[500px] w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="from-background/90 via-background/30 absolute inset-0 bg-linear-to-t to-transparent" />

                        <div className="text-background-foreground absolute inset-0 flex flex-col justify-end p-8">
                          <div className="relative z-10 max-w-md space-y-4">
                            <Badge className="w-fit rounded-full">
                              {product.tag}
                            </Badge>
                            <h2 className="text-4xl font-bold">
                              {product.name}
                            </h2>
                            <p className="text-background-foreground/80 text-lg">
                              Discover the latest in style and comfort with our
                              premium collection.
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                              <Button
                                size="lg"
                                onClick={() => navigate('/product-detail/1')}
                                className="cursor-pointer rounded-full"
                              >
                                Shop Now
                              </Button>
                              <div className="text-foreground flex items-center gap-1">
                                <Star className="fill-foreground size-5" />
                                <span className="font-medium">
                                  {product.rating}
                                </span>
                                <span className="text-foreground/80">
                                  ({product.reviews} reviews)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {product.trending && (
                          <div className="text-background-foreground bg-foreground/10 dark:bg-background/20 absolute end-8 top-8 flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium backdrop-blur-xs">
                            <Flame className="size-4" /> Trending
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Dots Navigation - Enhanced */}
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 justify-center gap-3">
              {storeData.featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    api?.scrollTo(index)
                    setCurrentSlide(index)
                  }}
                  className={`relative size-3 rounded-full transition-all ${currentSlide === index ? 'bg-primary' : 'bg-foreground/20 hover:bg-foreground/40'}`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={currentSlide === index ? 'step' : undefined}
                >
                  {currentSlide === index && (
                    <span className="absolute inset-0 m-auto rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
