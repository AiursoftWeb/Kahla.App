import { KahlaUser } from './KahlaUser';

export interface Request {
    id: number;
    creatorId: string;
    creator: KahlaUser;
    targetId: string;
    target: KahlaUser;
    createTime: Date;
    completed: boolean;
}
