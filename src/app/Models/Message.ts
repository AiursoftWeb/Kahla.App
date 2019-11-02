import { KahlaUser } from './KahlaUser';

export class Message {
    public id: string;
    public conversationId: number;
    public senderId: string;
    public sender: KahlaUser;
    public sendTime: string;
    public content: string;

    public resend: boolean;
    public contentRaw: string;
    public isEmoji = false;
    public read: boolean;
    public local = false;
    public avatarURL: string;
    public timeStamp: number;
    public lastRead = false;
    public relatedData: any;
}
