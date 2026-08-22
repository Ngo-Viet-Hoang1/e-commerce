import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

interface UseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
  successMessage?: string
  errorMessage?: string
}

interface UseMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>
  isLoading: boolean
  error: Error | null
  data: TData | null
  reset: () => void
}

export function useMutation<TData = unknown, TVariables = void>(
  options: UseMutationOptions<TData, TVariables>,
): UseMutationReturn<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<TData | null>(null)

  const optionsRef = useRef(options)
  optionsRef.current = options

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    const { mutationFn, onSuccess, onError, successMessage, errorMessage } =
      optionsRef.current

    setIsLoading(true)
    setError(null)

    try {
      const result = await mutationFn(variables)
      setData(result)

      if (successMessage) {
        toast.success(successMessage)
      }

      onSuccess?.(result, variables)

      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)

      if (errorMessage) {
        toast.error(errorMessage)
      } else {
        toast.error(error.message)
      }

      onError?.(error, variables)

      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setData(null)
  }, [])

  return { mutate, isLoading, error, data, reset }
}
