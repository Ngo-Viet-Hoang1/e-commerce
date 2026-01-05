import AddressService from '@/api/services/user/address.service'
import LocationService from '@/api/services/user/location.service'
import type { CreateAddressPayload, UpdateAddressPayload } from '@/interfaces/location.interface'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const addressKeys = {
  all: ['addresses'] as const,
  lists: () => [...addressKeys.all, 'list'] as const,
  detail: (id: number) => [...addressKeys.all, 'detail', id] as const,
}

export const locationKeys = {
  provinces: ['provinces'] as const,
  districts: (provinceCode: string) => ['districts', provinceCode] as const,
}

export const useProvinces = () => {
  return useQuery({
    queryKey: locationKeys.provinces,
    queryFn: async () => {
      const res = await LocationService.getProvinces()
      return res.data ?? []
    },
    staleTime: Infinity,
  })
}

export const useDistricts = (provinceCode: string) => {
  return useQuery({
    queryKey: locationKeys.districts(provinceCode),
    queryFn: async () => {
      const res = await LocationService.getDistrictsByProvinceCode(provinceCode)
      return res.data ?? []
    },
    enabled: !!provinceCode,
    staleTime: Infinity,
  })
}

export const useAddresses = (enabled = true) => {
  return useQuery({
    queryKey: addressKeys.lists(),
    queryFn: async () => {
      const res = await AddressService.getAll()
      if (res.success && res.data) {
        return res.data
      }
      return []
    },
    enabled,
  })
}

export const useCreateAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAddressPayload) => AddressService.create(payload),
    onSuccess: () => {
      toast.success('Thêm địa chỉ thành công')
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() })
    },
    onError: () => {
      toast.error('Thêm địa chỉ thất bại')
    },
  })
}

export const useUpdateAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAddressPayload }) =>
      AddressService.update(id, payload),
    onSuccess: () => {
      toast.success('Cập nhật địa chỉ thành công')
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() })
    },
    onError: () => {
      toast.error('Cập nhật địa chỉ thất bại')
    },
  })
}

export const useDeleteAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => AddressService.delete(id),
    onSuccess: () => {
      toast.success('Xóa địa chỉ thành công')
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() })
    },
    onError: () => {
      toast.error('Xóa địa chỉ thất bại')
    },
  })
}
