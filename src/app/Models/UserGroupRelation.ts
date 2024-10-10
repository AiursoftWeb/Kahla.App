import { KahlaUser } from './KahlaUser';

export interface UserGroupRelation {
    groupId: number;
    id: number;
    joinTime: Date;
    readTimeStamp: string;
    user: KahlaUser;
    userId: string;
    muted: boolean;
}
