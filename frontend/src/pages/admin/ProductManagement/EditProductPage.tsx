import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductBasicInfo } from '@/pages/admin/ProductManagement/components/ProductBasicInfo'
import {
  ProductImagesUpload,
  type ProductImageForm,
} from '@/pages/admin/ProductManagement/components/ProductImagesUpload'
import {
  ProductVariantForm,
  type VariantFormData,
} from '@/pages/admin/ProductManagement/components/ProductVariantForm'
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload'
import type { UpdateProduct } from '@/interfaces/product.interface'
import { Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useBrands } from '../BrandManagement/brand.queries'
import { useCategories } from '../CategoryMangement/category.queries'
import { useProduct, useUpdateProduct } from './product.queries'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const updateProduct = useUpdateProduct()
  const { uploadImage, uploading, progress } = useCloudinaryUpload()

  const productQuery = useProduct(Number(id))
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
  const [variants, setVariants] = useState<VariantFormData[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing product data
  useEffect(() => {
    if (productQuery.data) {
      const product = productQuery.data
      setFormData({
        name: product.data?.name ?? '',
        sku: product.data?.sku ?? '',
        description: product.data?.description ?? '',
        status: (product.data?.status === 'out_of_stock'
          ? 'inactive'
          : (product.data?.status ?? 'draft')) as
          | 'active'
          | 'inactive'
          | 'draft',
        brandId: product.data?.brand?.id.toString() ?? '',
        categoryId: product.data?.category?.id.toString() ?? '',
        isFeatured: product.data?.isFeatured ?? false,
      })

      // Load product images
      if (product?.data?.productImages) {
        setProductImages(
          product?.data?.productImages.map((img) => ({
            url: img.url,
            altText: img.altText ?? '',
            isPrimary: img.isPrimary,
          })),
        )
      }

      // Load variants
      if (product?.data?.variants) {
        setVariants(
          product?.data?.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            title: variant.title ?? '',
            price: variant.price.toString(),
            costPrice: variant.costPrice?.toString() ?? '',
            msrp: variant.msrp?.toString() ?? '',
            stockQuantity: variant.stockQuantity.toString(),
            isDefault: variant.isDefault,
            attributes:
              variant.attributeValues?.map((av) => ({
                attributeName: av.attribute?.name ?? '',
                value: av.valueText ?? '',
              })) ?? [],
            images:
              variant.productImages?.map((img) => ({
                url: img.url,
                altText: img.altText ?? '',
                isPrimary: img.isPrimary,
              })) ?? [],
          })),
        )
      }
    }
  }, [productQuery.data])

  const uploadAllImages = async () => {
    // Upload product images (only new ones with file property)
    const uploadedProductImages = await Promise.all(
      productImages.map(async (img) => {
        if (img.file) {
          const url = await uploadImage(img.file, 'products')
          return url
            ? { url, altText: img.altText, isPrimary: img.isPrimary }
            : null
        }
        // Keep existing images
        return { url: img.url, altText: img.altText, isPrimary: img.isPrimary }
      }),
    )

    // Upload variant images
    const uploadedVariants = await Promise.all(
      variants.map(async (variant) => {
        const uploadedImages = await Promise.all(
          variant.images.map(async (img) => {
            if (img.file) {
              const url = await uploadImage(img.file, 'products')
              return url
                ? { url, altText: img.altText, isPrimary: img.isPrimary }
                : null
            }
            // Keep existing images
            return {
              url: img.url,
              altText: img.altText,
              isPrimary: img.isPrimary,
            }
          }),
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

      const productData: UpdateProduct = {
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

      await updateProduct.mutateAsync({ id: Number(id), data: productData })
      navigate('/admin/products')
    } catch {
      toast.error('Failed to update product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        sku: '',
        title: '',
        price: '',
        costPrice: '',
        msrp: '',
        stockQuantity: '0',
        isDefault: false,
        attributes: [],
        images: [],
        _isNew: true,
      },
    ])
  }

  const removeVariant = (id: number | string) => {
    if (variants.length === 1) {
      toast.error('At least one variant is required')
      return
    }
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  const addAttribute = (variantId: number | string) => {
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

  const removeAttribute = (variantId: number | string, index: number) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, attributes: v.attributes.filter((_, i) => i !== index) }
          : v,
      ),
    )
  }

  if (productQuery.isLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-6">
        <Skeleton className="mb-6 h-10 w-40" />
        <Skeleton className="mb-6 h-12 w-80" />
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <div className="container mx-auto max-w-5xl py-6">
        <div className="text-center">
          <h1 className="text-destructive mb-2 text-2xl font-bold">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-4">
            The product you're looking for doesn't exist
          </p>
          <Link to="/admin/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl py-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductBasicInfo
              formData={formData}
              brands={brandsQuery.data?.data}
              categories={categoriesQuery.data?.data}
              onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
            />
          </CardContent>
        </Card>

        {/* Product Images */}
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

        {/* Variants */}
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
                onRemove={() => removeVariant(variant.id)}
                onUpdate={(updated) =>
                  setVariants((prev) =>
                    prev.map((v) =>
                      v.id === variant.id ? { ...v, ...updated } : v,
                    ),
                  )
                }
                onAddAttribute={() => addAttribute(variant.id)}
                onRemoveAttribute={(attrIndex) =>
                  removeAttribute(variant.id, attrIndex)
                }
              />
            ))}
          </CardContent>
        </Card>

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

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link to="/admin/products">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || uploading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
