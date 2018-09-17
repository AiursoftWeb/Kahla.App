import { KahlaUser } from './KahlaUser';

export class Request {
    public id: number;
    public creatorId: string;
    public creator: KahlaUser;
    public targetId: string;
    public createTime: string;
    public completed: boolean;
}
