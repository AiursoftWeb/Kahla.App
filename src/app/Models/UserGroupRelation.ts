import { KahlaUser } from './KahlaUser';

export class UserGroupRelation {
    public groupId: number;
    public id: number;
    public joinTime: Date;
    public readTimeStamp: string;
    public user: KahlaUser;
    public userId: string;
    public muted: boolean;
}
