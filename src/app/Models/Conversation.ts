import { KahlaUsers } from './KahlaUsers';

export class Conversation {
    public id: number;
    public discriminator: string;
    public conversationCreateTime: Date;
    public displayName: string;
    public displayImage: string;
    public anotherUserId: string;
    public aesKey: string;
    public users: KahlaUsers[];
}
