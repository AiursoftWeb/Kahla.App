import { UserGroupRelation } from './UserGroupRelation';

export interface Conversation {
    id: number;
    discriminator: 'GroupConversation' | 'PrivateConversation';
    conversationCreateTime: Date;
    displayName: string;
    displayImagePath: string;
    anotherUserId: string;
    users: UserGroupRelation[];
    avatarURL: string;
    maxLiveSeconds: number;
}
