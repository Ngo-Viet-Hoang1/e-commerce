/* eslint-disable no-console */
import { adminApi, api } from '@/api'
import { ChatContext, type ChatContextValue } from '@/hooks/useStreamChat'
import type { IApiResponse } from '@/interfaces/base-response.interface'
import type { ChatTokenResponse } from '@/interfaces/stream-chat.interface'
import { useAdminAuthStore, useAuthStore } from '@/store/zustand/useAuthStore'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { StreamChat } from 'stream-chat'

interface ChatProviderProps {
  children: ReactNode
  role: 'user' | 'admin'
}

const StreamChatProvider = ({ children, role }: ChatProviderProps) => {
  const [client, setClient] = useState<StreamChat | null>(null)
  const isInitializingRef = useRef(false)

  const authStore = role === 'admin' ? useAdminAuthStore : useAuthStore
  const { isInitialized, isAuthenticated } = authStore()

  const apiClient = role === 'admin' ? adminApi : api
  const queryKey = role === 'admin' ? 'admin-chat-token' : 'user-chat-token'

  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data } =
        await apiClient.post<IApiResponse<ChatTokenResponse>>('/chat/token')
      return data
    },
    staleTime: 1000 * 60 * 50,
    retry: 2,
    enabled: isInitialized && isAuthenticated,
  })

  useEffect(() => {
    if (!data?.data || isInitializingRef.current) return

    const { apiKey, userId, token } = data.data
    const chatClient = StreamChat.getInstance(apiKey)

    const initChat = async () => {
      isInitializingRef.current = true

      try {
        if (chatClient.userID && chatClient.userID !== userId) {
          await chatClient.disconnectUser()
        }

        if (chatClient.userID !== userId) {
          await chatClient.connectUser({ id: userId }, token)
        }

        setClient(chatClient)
      } catch (error) {
        console.error('Chat init error:', error)
        toast.error('Failed to initialize chat')
      } finally {
        isInitializingRef.current = false
      }
    }

    initChat()
  }, [data])

  const disconnect = useCallback(async () => {
    if (client) {
      try {
        await client.disconnectUser()
        setClient(null)
      } catch (error) {
        console.error('Disconnect error:', error)
      }
    }
  }, [client])

  const value: ChatContextValue = {
    client,
    isLoading: isLoading || !client,
    isError,
    disconnect,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export default StreamChatProvider
