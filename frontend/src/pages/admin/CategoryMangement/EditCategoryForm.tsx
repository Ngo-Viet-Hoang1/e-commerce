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
import { useUpdateCategory, useCategorie } from './category.queries'
import { type UpdateCategoryInputs, updateCategorySchema } from './category.schema'

interface EditCategoryFormProps {
  categoryId: number
  open: boolean
  onClose: () => void
}

export function EditCategoryForm({ categoryId, open, onClose }: EditCategoryFormProps) {
  const categoryQuery = useCategorie(categoryId)
  const updateCategory = useUpdateCategory()

  const form = useForm<UpdateCategoryInputs>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  })

  useEffect(() => {
    if (categoryQuery.data) {
      form.reset({
        name: categoryQuery.data.data?.name ?? '',
        slug: categoryQuery.data.data?.slug ?? '',
        description: categoryQuery.data.data?.description ?? '',
      })
    }
  }, [categoryQuery.data, form])

  const onSubmit = async (values: UpdateCategoryInputs) => {
    await updateCategory.mutateAsync({
      id: categoryId,
      data: values,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
        </DialogHeader>

        {categoryQuery.isLoading ? (
          <div className="text-muted-foreground py-6 text-center text-sm">
            Loading category...
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
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

              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updateCategory.isPending}
                  >
                    Cancel
                  </Button>
                </DialogClose>

                <Button type="submit" disabled={updateCategory.isPending}>
                  {updateCategory.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
