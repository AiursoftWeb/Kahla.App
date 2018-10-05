import { KahlaUser } from './KahlaUser';

export class Message {
    public id: number;
    public conversationId: number;
    public senderId: string;
    public sender: KahlaUser;
    public sendTime: Date;
    public content: string;
    public read: boolean;
    public local = false;
}
