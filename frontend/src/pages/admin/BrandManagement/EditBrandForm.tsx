import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useUpdateBrand, useBrand } from './brand.queries'
import { type UpdateBrandInputs, updateBrandSchema } from './brand.schema'

interface EditBrandFormProps {
  brandId: number
  open: boolean
  onClose: () => void
}

export function EditBrandForm({ brandId, open, onClose }: EditBrandFormProps) {
  const brandQuery = useBrand(brandId)
  const updateBrand = useUpdateBrand()

  const form = useForm<UpdateBrandInputs>({
    resolver: zodResolver(updateBrandSchema),
    defaultValues: {
      name: '',
      description: '',
      logoUrl: '',
      website: '',
    },
  })

  useEffect(() => {
    if (brandQuery.data) {
      form.reset({
        name: brandQuery.data.data?.name ?? '',
        description: brandQuery.data.data?.description ?? '',
        logoUrl: brandQuery.data.data?.logoUrl ?? '',
        website: brandQuery.data.data?.website ?? '',
      })
    }
  }, [brandQuery.data, form])

  const onSubmit = async (values: UpdateBrandInputs) => {
    await updateBrand.mutateAsync({
      id: brandId,
      data: values,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Edit brand</DialogTitle>
        </DialogHeader>

        {brandQuery.isLoading ? (
          <div className="text-muted-foreground py-6 text-center text-sm">
            Loading brand...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updateBrand.isPending}
                  >
                    Cancel
                  </Button>
                </DialogClose>

                <Button type="submit" disabled={updateBrand.isPending}>
                  {updateBrand.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
