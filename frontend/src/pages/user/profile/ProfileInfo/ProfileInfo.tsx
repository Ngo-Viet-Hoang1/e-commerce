import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/zustand/useAuthStore"
import { Edit, Mail, Phone, User } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import AddressSection from "../Address/AddressSection"
import { useUpdateProfile } from "./profile.queries"

const ProfileInfo = () => {
  const { me } = useAuthStore()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(me?.name ?? "")
  const [phoneNumber, setPhoneNumber] = useState(me?.phoneNumber ?? "")

  const updateProfile = useUpdateProfile()
  const isLoading = updateProfile.isPending

  const save = async () => {
    if (!me?.id) return

    if (!name.trim() || !phoneNumber.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin")
      return
    }

    await updateProfile.mutateAsync(
      {
        id: me.id,
        data: {
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
        },
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    )
  }

  const cancel = () => {
    if (!me) return
    setName(me.name ?? "")
    setPhoneNumber(me.phoneNumber ?? "")
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl space-y-8">
      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cá nhân
            </CardTitle>

            {!isEditing && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Họ và tên</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Số điện thoại
              </Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!isEditing}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input value={me?.email ?? ""} disabled />
          </div>

          {isEditing && (
            <div className="flex justify-center gap-2 pt-4">
              <Button onClick={save} disabled={isLoading}>
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button
                variant="outline"
                onClick={cancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <AddressSection />
    </div>
  )
}

export default ProfileInfo
