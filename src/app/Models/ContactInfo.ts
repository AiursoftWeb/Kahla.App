import { Message } from './Message';

export interface ContactInfo {
    displayName: string;
    displayImagePath: string;
    latestMessage: Message;
    unReadAmount: number;
    conversationId: number;
    discriminator: 'GroupConversation' | 'PrivateConversation';
    userId: string;
    avatarURL: string;
    muted: boolean;
    someoneAtMe: boolean;
    online?: boolean;
}
