import { KahlaUser } from './KahlaUser';
import { Message } from './Message';

export class Conversation {
    public id: number;
    public discriminator: string;
    public conversationCreateTime: Date;
    public displayName: string;
    public displayImage: string;
    public anotherUserId: string;
}
