import { UserGroupRelation } from './KahlaUsers';

export class Conversation {
    public id: number;
    public discriminator: string;
    public conversationCreateTime: string;
    public displayName: string;
    public displayImageKey: number;
    public anotherUserId: string;
    public aesKey: string;
    public users: UserGroupRelation[];
    public avatarURL: string;
}
