import { Button } from '@/components/ui/button'
import pLimit from 'p-limit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload'
import type { CreateProduct } from '@/interfaces/product.interface'
import { ProductBasicInfo } from '@/pages/admin/ProductManagement/components/ProductBasicInfo'
import {
  ProductImagesUpload,
  type ProductImageForm,
} from '@/pages/admin/ProductManagement/components/ProductImagesUpload'
import {
  ProductVariantForm,
  type VariantFormData,
} from '@/pages/admin/ProductManagement/components/ProductVariantForm'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useBrands } from '../BrandManagement/brand.queries'
import { useCategories } from '../CategoryMangement/category.queries'
import { useCreateProduct } from './product.queries'

export default function CreateProductPage() {
  const navigate = useNavigate()
  const createProduct = useCreateProduct()
  const { uploadImage, uploading, progress } = useCloudinaryUpload()

  const brandsQuery = useBrands({ page: 1, limit: 100 })
  const categoriesQuery = useCategories({ page: 1, limit: 100 })

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    status: 'draft' as 'active' | 'inactive' | 'draft' | 'out_of_stock',
    brandId: '',
    categoryId: '',
    isFeatured: false,
  })

  const [productImages, setProductImages] = useState<ProductImageForm[]>([])
  const [variants, setVariants] = useState<VariantFormData[]>([
    {
      id: crypto.randomUUID(),
      sku: '',
      title: '',
      price: '',
      costPrice: '',
      msrp: '',
      stockQuantity: '0',
      isDefault: true,
      attributes: [],
      images: [],
    },
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const uploadAllImages = async () => {
    const limit = pLimit(4)
    const uploadedProductImages = await Promise.all(
      productImages.map((img) =>
        img.file
          ? limit(async () => {
              const url = await uploadImage(img.file!, 'products')
              return url
                ? {
                    url,
                    altText: img.altText,
                    isPrimary: img.isPrimary,
                  }
                : null
            })
          : Promise.resolve(null),
      ),
    )

    const uploadedVariants = await Promise.all(
      variants.map(async (variant) => {
        const uploadedImages = await Promise.all(
          variant.images.map((img) =>
            img.file
              ? limit(async () => {
                  const url = await uploadImage(img.file!, 'products')
                  return url
                    ? {
                        url,
                        altText: img.altText,
                        isPrimary: img.isPrimary,
                      }
                    : null
                })
              : Promise.resolve(null),
          ),
        )

        return {
          ...variant,
          images: uploadedImages.filter((img) => img !== null),
        }
      }),
    )

    return {
      productImages: uploadedProductImages.filter((img) => img !== null),
      variants: uploadedVariants,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.brandId || !formData.categoryId) {
      toast.error('Please select brand and category')
      return
    }

    if (variants.length === 0) {
      toast.error('Please add at least one variant')
      return
    }

    setIsSubmitting(true)

    try {
      // Upload all images first
      const {
        productImages: uploadedProductImages,
        variants: uploadedVariants,
      } = await uploadAllImages()

      const productData: CreateProduct = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description || undefined,
        status: formData.status,
        brandId: Number(formData.brandId),
        categoryId: Number(formData.categoryId),
        isFeatured: formData.isFeatured,
        variants: uploadedVariants.map((v) => ({
          sku: v.sku,
          title: v.title || undefined,
          price: Number(v.price),
          costPrice: v.costPrice ? Number(v.costPrice) : undefined,
          msrp: v.msrp ? Number(v.msrp) : undefined,
          stockQuantity: Number(v.stockQuantity),
          isDefault: v.isDefault,
          attributes: v.attributes.length > 0 ? v.attributes : undefined,
          images: v.images.length > 0 ? v.images : undefined,
        })),
        images:
          uploadedProductImages.length > 0 ? uploadedProductImages : undefined,
      }

      await createProduct.mutateAsync(productData)
      navigate('/admin/products')
    } catch {
      toast.error('Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sku: '',
        title: '',
        price: '',
        costPrice: '',
        msrp: '',
        stockQuantity: '0',
        isDefault: false,
        attributes: [],
        images: [],
      },
    ])
  }

  const removeVariant = (id: string) => {
    if (variants.length === 1) {
      toast.error('At least one variant is required')
      return
    }
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  const addAttribute = (variantId: string) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              attributes: [...v.attributes, { attributeName: '', value: '' }],
            }
          : v,
      ),
    )
  }

  const removeAttribute = (variantId: string, index: number) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, attributes: v.attributes.filter((_, i) => i !== index) }
          : v,
      ),
    )
  }

  return (
    <div className="container mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic-info">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
              <TabsTrigger value="product-images">Product Images</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              type="submit"
              disabled={isSubmitting || uploading}
            >
              {isSubmitting && <Spinner />}
              Create Product
            </Button>
          </div>

          <TabsContent value="basic-info">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductBasicInfo
                  formData={formData}
                  brands={brandsQuery.data?.data}
                  categories={categoriesQuery.data?.data}
                  onChange={(data) =>
                    setFormData((prev) => ({ ...prev, ...data }))
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="product-images">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductImagesUpload
                  images={productImages}
                  onChange={setProductImages}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Variants <span className="text-destructive">*</span>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {variants.map((variant, variantIndex) => (
                  <ProductVariantForm
                    key={variant.id}
                    variant={variant}
                    variantIndex={variantIndex}
                    canRemove={variants.length > 1}
                    onRemove={() => removeVariant(variant.id.toString())}
                    onUpdate={(updated) =>
                      setVariants((prev) =>
                        prev.map((v) =>
                          v.id === variant.id ? { ...v, ...updated } : v,
                        ),
                      )
                    }
                    onAddAttribute={() => addAttribute(variant.id.toString())}
                    onRemoveAttribute={(attrIndex) =>
                      removeAttribute(variant.id.toString(), attrIndex)
                    }
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upload Progress */}
        {uploading && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading images...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
