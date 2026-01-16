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
import { useUpdateBadge, useBadge } from './badge.queries'
import { type UpdateBadgeInputs, updateBadgeSchema } from './badge.schema'

interface EditBadgeFormProps {
  badgeId: number
  open: boolean
  onClose: () => void
}

export function EditBadgeForm({ badgeId, open, onClose }: EditBadgeFormProps) {
  const badgeQuery = useBadge(badgeId)
  const updateBadge = useUpdateBadge()

  const form = useForm<UpdateBadgeInputs>({
    resolver: zodResolver(updateBadgeSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      iconUrl: '',
    },
  })

  useEffect(() => {
    if (badgeQuery.data) {
      form.reset({
        code: badgeQuery.data.data?.code ?? '',
        name: badgeQuery.data.data?.name ?? '',
        description: badgeQuery.data.data?.description ?? '',
        iconUrl: badgeQuery.data.data?.iconUrl ?? '',
      })
    }
  }, [badgeQuery.data, form])

  const onSubmit = async (values: UpdateBadgeInputs) => {
    await updateBadge.mutateAsync({
      id: badgeId,
      data: values,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Edit badge</DialogTitle>
        </DialogHeader>

        {badgeQuery.isLoading ? (
          <div className="text-muted-foreground py-6 text-center text-sm">
            Loading badge...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="iconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon URL (Optional)</FormLabel>
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
                    disabled={updateBadge.isPending}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={updateBadge.isPending}>
                  {updateBadge.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
