import { KahlaUser } from './KahlaUser';

export class UserGroupRelation {
    public groupId: number;
    public id: number;
    public joinTime: string;
    public readTimeStamp: string;
    public user: KahlaUser;
    public userId: string;
}
