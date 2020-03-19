import { Message } from './Message';

export class ContactInfo {
    public displayName: string;
    public displayImagePath: string;
    public latestMessage: Message;
    public unReadAmount: number;
    public conversationId: number;
    public discriminator: string;
    public userId: string;
    public aesKey: string;
    public avatarURL: string;
    public muted: boolean;
    public someoneAtMe: boolean;
    public online: boolean;
}
