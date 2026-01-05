import { useChatContext } from '@/hooks/useStreamChat'
import { AlertCircle } from 'lucide-react'
import {
  Channel,
  ChannelList,
  Chat,
  MessageInput,
  MessageList,
  Window,
} from 'stream-chat-react'
import { Spinner } from '../../ui/spinner'
import { Button } from '@/components/ui/button'

const AdminChat = () => {
  const { client, isLoading, isError } = useChatContext()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spinner />{' '}
        <p className="font-medium text-gray-600">Connecting to chat...</p>
      </div>
    )
  }

  if (isError || !client) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Failed to connect to chat
          </h2>
          <p className="mb-4 text-gray-600">
            Unable to establish connection to the chat server.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  const filters = {
    type: 'messaging',
    members: { $in: [client.userID!] },
  }

  const sort = { last_message_at: -1 as const }

  const options = {
    state: true,
    presence: true,
    limit: 20,
  }

  return (
    <div className="flex h-full flex-col border-t bg-white">
      <div className="flex-1 overflow-hidden">
        <Chat client={client}>
          <div className="flex h-full">
            <div className="w-80 border-r">
              <ChannelList
                filters={filters}
                sort={sort}
                options={options}
                showChannelSearch={false}
              />
            </div>

            <div className="flex-1 bg-white">
              <Channel>
                <Window>
                  <MessageList />
                  <MessageInput />
                </Window>
              </Channel>
            </div>
          </div>
        </Chat>
      </div>
    </div>
  )
}

export default AdminChat
