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
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useUpdateUser, useUser } from './user.queries'
import { type UpdateUserInputs, updateUserSchema } from './user.schema'

interface EditUserFormProps {
  userId: number
  open: boolean
  onClose: () => void
}

export function EditUserForm({ userId, open, onClose }: EditUserFormProps) {
  const userQuery = useUser(userId)
  const updateUser = useUpdateUser()

  const form = useForm<UpdateUserInputs>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  useEffect(() => {
    if (userQuery.data) {
      form.reset({
        name: userQuery.data.data?.name ?? undefined,
        email: userQuery.data.data?.email,
      })
    }
  }, [userQuery.data, form])

  const onSubmit = async (values: UpdateUserInputs) => {
    await updateUser.mutateAsync({
      id: userId,
      data: values,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
        </DialogHeader>

        {userQuery.isLoading ? (
          <div className="text-muted-foreground py-6 text-center text-sm">
            Loading user...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
                    disabled={updateUser.isPending}
                  >
                    Cancel
                  </Button>
                </DialogClose>

                <Button type="submit" disabled={updateUser.isPending}>
                  {updateUser.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
