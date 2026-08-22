import axios from 'axios'
import { useState } from 'react'
import { toast } from 'sonner'

interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  [key: string]: unknown
}

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadImage = async (
    file: File,
    folder: string,
  ): Promise<string | null> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary configuration is missing')
      return null
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('File quá lớn (tối đa 5MB)')
      return null
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
      'image/gif',
    ]
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file JPG, PNG, WEBP')
      return null
    }

    try {
      setUploading(true)
      setProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', folder)

      const response = await axios.post<CloudinaryUploadResponse>(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentage = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              )
              setProgress(percentage)
            }
          },
        },
      )

      return response.data.secure_url
    } catch {
      toast.error('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadImage,
    uploading,
    progress,
  }
}
