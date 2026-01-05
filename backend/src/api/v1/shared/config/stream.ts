import { StreamChat, type ChannelData } from 'stream-chat'

const apiKey = process.env.STREAM_API_KEY!
const apiSecret = process.env.STREAM_API_SECRET!

export interface CustomChannelData extends ChannelData {
  name?: string
  support_channel?: boolean
  buyer_id?: string
}

export const streamServer = StreamChat.getInstance(apiKey, apiSecret)
