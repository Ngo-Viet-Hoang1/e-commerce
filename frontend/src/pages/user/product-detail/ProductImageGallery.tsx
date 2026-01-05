import { useState, useCallback, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/interfaces/product.interface'

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
  isFeatured?: boolean
  discountPercentage?: number
}

export function ProductImageGallery({
  images,
  productName,
  isFeatured = false,
  discountPercentage,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({ loop: false })
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  })

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return
      emblaMainApi.scrollTo(index)
    },
    [emblaMainApi, emblaThumbsApi],
  )

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return
    setSelectedIndex(emblaMainApi.selectedScrollSnap())
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap())
  }, [emblaMainApi, emblaThumbsApi])

  useEffect(() => {
    if (!emblaMainApi) return

    const timerId = setTimeout(() => {
      onSelect()
    }, 0)

    emblaMainApi.on('select', onSelect)
    emblaMainApi.on('reInit', onSelect)
    return () => {
      clearTimeout(timerId)
      emblaMainApi.off('select', onSelect)
      emblaMainApi.off('reInit', onSelect)
    }
  }, [emblaMainApi, onSelect])

  const scrollPrev = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollPrev()
  }, [emblaMainApi])

  const scrollNext = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollNext()
  }, [emblaMainApi])

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    if (!emblaMainApi) return
    const updateScrollButtons = () => {
      setCanScrollPrev(emblaMainApi.canScrollPrev())
      setCanScrollNext(emblaMainApi.canScrollNext())
    }
    updateScrollButtons()
    emblaMainApi.on('select', updateScrollButtons)
    emblaMainApi.on('reInit', updateScrollButtons)
    return () => {
      emblaMainApi.off('select', updateScrollButtons)
      emblaMainApi.off('reInit', updateScrollButtons)
    }
  }, [emblaMainApi])

  if (!images.length) {
    return (
      <div className="bg-muted flex aspect-square items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">Không có hình ảnh</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image Carousel */}
      <div className="relative">
        <div className="overflow-hidden rounded-lg" ref={emblaMainRef}>
          <div className="flex">
            {images.map((img, idx) => (
              <div
                key={img.imageId}
                className="relative min-w-0 flex-[0_0_100%]"
              >
                <div className="bg-muted relative aspect-square overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.altText ?? `${productName} - Ảnh ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Badges only on first image */}
                  {idx === 0 && (
                    <>
                      {isFeatured && (
                        <Badge className="absolute top-4 left-4">Nổi bật</Badge>
                      )}
                      {discountPercentage && discountPercentage > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute top-4 right-4"
                        >
                          -{discountPercentage}%
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full backdrop-blur-sm disabled:opacity-30"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Ảnh trước</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full backdrop-blur-sm disabled:opacity-30"
              onClick={scrollNext}
              disabled={!canScrollNext}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Ảnh tiếp theo</span>
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute right-4 bottom-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="overflow-hidden" ref={emblaThumbsRef}>
          <div className="flex gap-2">
            {images.map((img, idx) => (
              <button
                key={img.imageId}
                onClick={() => onThumbClick(idx)}
                className={cn(
                  'relative min-w-0 flex-[0_0_20%] overflow-hidden rounded-md border-2 transition-all',
                  idx === selectedIndex
                    ? 'border-primary'
                    : 'border-transparent opacity-60 hover:opacity-100',
                )}
              >
                <div className="aspect-square">
                  <img
                    src={img.url}
                    alt={img.altText ?? `Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
