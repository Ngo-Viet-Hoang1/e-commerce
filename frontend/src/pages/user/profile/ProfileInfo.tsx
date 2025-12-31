import UserService from "@/api/services/user/user.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserSchema, type UpdateUserInputs } from "@/schema/user.schema"
import { useAuthStore } from "@/store/zustand/useAuthStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit, Mail, Phone, User } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import AddressSection from "./Address/AddressSection"

const ProfileInfo = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { me, initializeAuth } = useAuthStore()

  const form = useForm<UpdateUserInputs>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: me?.name ?? '',
      phoneNumber: me?.phoneNumber ?? '',
    },
  })

  const handleUpdate = async (data: UpdateUserInputs) => {
    if (!me?.id) return

    try {
      setIsLoading(true)
      await UserService.updateProfile(me.id, data)
      await initializeAuth()
      toast.success('Cập nhật thông tin thành công')
      setIsEditing(false)
    } catch {
      toast.error('Cập nhật thông tin thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset({
      name: me?.name ?? '',
      phoneNumber: me?.phoneNumber ?? '',
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl space-y-8">
      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Thông tin cá nhân
            </CardTitle>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-muted-foreground hover:text-primary"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Họ và tên</Label>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="Nhập họ và tên"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Số điện thoại
                      </Label>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="Nhập số điện thoại"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>

                <Input
                  value={me?.email ?? ''}
                  disabled
                />
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4 items-center justify-center">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>

      </Card>

      <Card>
        <AddressSection />
      </Card>
    </div>
  )
}

export default ProfileInfo
