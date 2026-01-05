import { useEffect, useState } from 'react'
import { useChatContext, useCreateChannel } from '@/hooks/useStreamChat'
import { useAuthStore } from '@/store/zustand/useAuthStore'
import { MessageCircle, X, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import {
  Channel,
  Chat,
  MessageList,
  MessageInput,
  Window,
} from 'stream-chat-react'

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [channelId, setChannelId] = useState<string | null>(null)

  const { isAuthenticated } = useAuthStore()
  const { client, isLoading, isError } = useChatContext()
  const createChannel = useCreateChannel()

  useEffect(() => {
    if (!isOpen || !client || channelId) return
    createChannel.mutate(undefined, {
      onSuccess: (res) => setChannelId(res.data!.channelId),
    })
  }, [isOpen, client, channelId])

  if (!isAuthenticated) return null

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        disabled={isLoading || isError}
        size="icon"
        className="fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-xl transition-transform hover:scale-105 hover:shadow-2xl"
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <MessageCircle className="h-7 w-7" />
        )}
        <span className="sr-only">Open Support Chat</span>
      </Button>
    )
  }

  if (isError) {
    return (
      <Card className="animate-in fade-in slide-in-from-bottom-4 fixed right-6 bottom-6 z-50 flex h-[500px] w-[380px] flex-col items-center justify-center shadow-2xl">
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="bg-destructive/10 text-destructive rounded-full p-4">
            <X size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">Connection Failed</h3>
            <p className="text-muted-foreground text-sm">
              Unable to connect to support. Please try again.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </Card>
    )
  }

  if (isLoading || !client || !channelId) {
    return (
      <Card className="animate-in fade-in slide-in-from-bottom-4 fixed right-6 bottom-6 z-50 flex h-[550px] w-[380px] flex-col items-center justify-center shadow-2xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="text-muted-foreground text-sm font-medium">
            Connecting to Support...
          </span>
        </div>
      </Card>
    )
  }

  const channel = client.channel('messaging', channelId)

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 fixed right-6 bottom-6 z-50 flex h-[600px] w-[400px] flex-col overflow-hidden border-slate-200 shadow-2xl duration-300">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-white p-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-slate-100">
              <AvatarImage src="/images/support-avatar.png" alt="Support" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                CS
              </AvatarFallback>
            </Avatar>
            <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">
              Customer Support
            </span>
            <span className="text-muted-foreground text-[11px] font-medium">
              Always here to help
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden bg-white p-0">
        <Chat client={client}>
          <Channel channel={channel}>
            <Window>
              <MessageList />
              <MessageInput focus />
            </Window>
          </Channel>
        </Chat>
      </CardContent>
    </Card>
  )
}
