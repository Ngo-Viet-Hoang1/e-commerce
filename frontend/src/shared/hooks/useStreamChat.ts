import { api } from '@/shared/api'
import type { IApiResponse } from '@/shared/types'
import type { ChannelResponse } from '@/shared/types'
import { useMutation } from '@tanstack/react-query'
import { createContext, useContext } from 'react'
import type { StreamChat } from 'stream-chat'

export interface ChatContextValue {
  client: StreamChat | null
  isLoading: boolean
  isError: boolean
  disconnect: () => Promise<void>
}

export const ChatContext = createContext<ChatContextValue | null>(null)

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}

export const useCreateChannel = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } =
        await api.post<IApiResponse<ChannelResponse>>('/chat/channel')
      return data
    },
  })
}

export const useDisconnectChat = () => {
  const { disconnect } = useChatContext()
  return disconnect
}
