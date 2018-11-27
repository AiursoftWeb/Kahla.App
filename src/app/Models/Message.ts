export class Message {
    public id: number;
    public conversationId: number;
    public senderId: string;
    public sendTime: Date;
    public content: string;
    public read: boolean;
    public local = false;
    public avatarURL: string;
}
