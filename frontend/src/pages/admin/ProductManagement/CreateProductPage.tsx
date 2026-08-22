import { Button } from '@/shared/ui/button'
import pLimit from 'p-limit'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { Spinner } from '@/shared/ui/spinner'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { RHFCombobox } from '@/shared/ui/RHFCombobox'
import { useCloudinaryUpload } from '@/shared/hooks'
import type { CreateProduct } from '@/entities/product'
import {
  ProductBasicInfo,
  ProductImagesUpload,
  type ProductImageForm,
  ProductVariantForm,
  type VariantFormData,
  useCreateProduct,
} from '@/features/manage-product'
import { ArrowLeft, CheckCircle2, Layers, Plus, Sparkles, UploadCloud } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useBrands } from '@/features/manage-brand'
import { useCategories } from '@/features/manage-category'

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
      title: 'Mặc định',
      price: '',
      costPrice: '',
      msrp: '',
      stockQuantity: '10',
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
          variant.images.map((img: ProductImageForm) =>
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
          images: uploadedImages.filter((img): img is NonNullable<typeof img> => img !== null),
        }
      }),
    )

    return {
      productImages: uploadedProductImages.filter((img): img is NonNullable<typeof img> => img !== null),
      variants: uploadedVariants,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm')
      return
    }

    if (!formData.sku.trim()) {
      toast.error('Vui lòng nhập mã sản phẩm (SKU)')
      return
    }

    if (!formData.brandId || !formData.categoryId) {
      toast.error('Vui lòng chọn Thương hiệu và Danh mục cho sản phẩm')
      return
    }

    if (variants.length === 0) {
      toast.error('Cần ít nhất một phiên bản sản phẩm')
      return
    }

    for (const [idx, v] of variants.entries()) {
      if (!v.sku.trim()) {
        toast.error(`Phiên bản #${idx + 1} chưa có mã SKU`)
        return
      }
      if (!v.price || Number(v.price) <= 0) {
        toast.error(`Phiên bản #${idx + 1} cần có giá bán lớn hơn 0`)
        return
      }
    }

    setIsSubmitting(true)

    try {
      const {
        productImages: uploadedProductImages,
        variants: uploadedVariants,
      } = await uploadAllImages()

      const productData: CreateProduct = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        description: formData.description || undefined,
        status: formData.status,
        brandId: Number(formData.brandId),
        categoryId: Number(formData.categoryId),
        isFeatured: formData.isFeatured,
        variants: uploadedVariants.map((v) => ({
          sku: v.sku.trim().toUpperCase(),
          title: v.title || undefined,
          price: Number(v.price),
          costPrice: v.costPrice ? Number(v.costPrice) : undefined,
          msrp: v.msrp ? Number(v.msrp) : undefined,
          stockQuantity: Number(v.stockQuantity) || 0,
          isDefault: v.isDefault,
          attributes: v.attributes.length > 0 ? v.attributes : undefined,
          images: v.images.length > 0 ? v.images : undefined,
        })),
        images:
          uploadedProductImages.length > 0 ? uploadedProductImages : undefined,
      }

      await createProduct.mutateAsync(productData)
      toast.success('Tạo mới sản phẩm thành công!')
      navigate('/admin/products')
    } catch {
      toast.error('Đã xảy ra lỗi khi tạo sản phẩm')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sku: `${formData.sku || 'SKU'}-VAR-${prev.length + 1}`,
        title: `Phiên bản ${prev.length + 1}`,
        price: prev[0]?.price || '',
        costPrice: prev[0]?.costPrice || '',
        msrp: prev[0]?.msrp || '',
        stockQuantity: '10',
        isDefault: false,
        attributes: [],
        images: [],
      },
    ])
  }

  const removeVariant = (id: string) => {
    if (variants.length === 1) {
      toast.error('Bắt buộc phải có ít nhất một phiên bản sản phẩm')
      return
    }
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  const addAttribute = (variantId: string, defaultName = '') => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              attributes: [...v.attributes, { attributeName: defaultName, value: '' }],
            }
          : v,
      ),
    )
  }

  const removeAttribute = (variantId: string, index: number) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, attributes: v.attributes.filter((_: unknown, i: number) => i !== index) }
          : v,
      ),
    )
  }

  return (
    <div className="container mx-auto pb-12 space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="size-8 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Thêm sản phẩm mới</h1>
            <p className="text-[11px] text-muted-foreground">
              Thông tin chi tiết, hình ảnh và phân loại phiên bản
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/products')}
            disabled={isSubmitting || uploading}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || uploading}
            className="cursor-pointer font-semibold shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-1.5 size-3.5" />
                Đang lưu...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-1.5 size-3.5" />
                Lưu & Xuất bản
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Upload Progress Notification */}
      {uploading && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <UploadCloud className="size-3.5 animate-bounce text-primary" />
                  Đang tải hình ảnh lên Cloudinary...
                </span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main 2-Column Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (8 cols): Main Content */}
        <div className="lg:col-span-8 space-y-4">
          {/* Card 1: Basic Information */}
          <Card className="shadow-xs">
            <CardHeader className="py-3 px-4 border-b bg-muted/10">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Thông tin chung
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ProductBasicInfo
                formData={formData}
                onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
                disabled={isSubmitting || uploading}
              />
            </CardContent>
          </Card>

          {/* Card 2: Product Images */}
          <Card className="shadow-xs">
            <CardHeader className="py-3 px-4 border-b bg-muted/10">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Bộ sưu tập hình ảnh
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ProductImagesUpload
                images={productImages}
                onChange={setProductImages}
                disabled={isSubmitting || uploading}
              />
            </CardContent>
          </Card>

          {/* Card 3: Variants */}
          <Card className="shadow-xs">
            <CardHeader className="py-3 px-4 border-b bg-muted/10 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" />
                3. Phiên bản & Phân loại hàng <span className="text-destructive">*</span>
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
                disabled={isSubmitting || uploading}
                className="h-6 text-[11px] px-2 cursor-pointer"
              >
                <Plus className="mr-1 size-3" />
                Thêm phiên bản
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
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
                  onAddAttribute={(defaultName) =>
                    addAttribute(variant.id.toString(), defaultName)
                  }
                  onRemoveAttribute={(attrIndex) =>
                    removeAttribute(variant.id.toString(), attrIndex)
                  }
                  disabled={isSubmitting || uploading}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Sticky Sidebar */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
          {/* Card: Status & Visibility */}
          <Card className="shadow-xs">
            <CardHeader className="py-3 px-4 border-b bg-muted/10">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Trạng thái & Hiển thị
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Trạng thái xuất bản</Label>
                <RHFCombobox
                  value={formData.status}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value as
                        | 'active'
                        | 'inactive'
                        | 'draft'
                        | 'out_of_stock',
                    }))
                  }
                  options={[
                    { label: 'Đang bán (Hiển thị công khai)', value: 'active' },
                    { label: 'Bản nháp (Chưa công khai)', value: 'draft' },
                    { label: 'Tạm ẩn (Không hiển thị)', value: 'inactive' },
                    { label: 'Hết hàng', value: 'out_of_stock' },
                  ]}
                  placeholder="Chọn trạng thái"
                />
              </div>

              <div className="bg-muted/20 flex items-start space-x-2.5 rounded-lg border p-3">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isFeatured: !!checked }))
                  }
                  disabled={isSubmitting || uploading}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <Label htmlFor="isFeatured" className="cursor-pointer text-xs font-semibold flex items-center gap-1">
                    <Sparkles className="size-3 text-amber-500" />
                    Sản phẩm nổi bật
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Ưu tiên tại Banner và Carousel trang chủ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Category & Brand */}
          <Card className="shadow-xs">
            <CardHeader className="py-3 px-4 border-b bg-muted/10">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Phân loại danh mục
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Thương hiệu <span className="text-destructive">*</span>
                </Label>
                <RHFCombobox
                  value={formData.brandId}
                  onChange={(value) => setFormData((prev) => ({ ...prev, brandId: value }))}
                  options={
                    brandsQuery.data?.data?.map((brand) => ({
                      label: brand.name,
                      value: brand.id.toString(),
                    })) ?? []
                  }
                  placeholder="Chọn thương hiệu..."
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Danh mục sản phẩm <span className="text-destructive">*</span>
                </Label>
                <RHFCombobox
                  value={formData.categoryId}
                  onChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                  options={
                    categoriesQuery.data?.data?.map((category) => ({
                      label: category.name,
                      value: category.id.toString(),
                    })) ?? []
                  }
                  placeholder="Chọn danh mục..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
