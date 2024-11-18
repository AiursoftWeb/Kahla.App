import { KahlaUser } from './KahlaUser';

/** @deprecated */
export interface Message {
    id: string;
    conversationId: number;
    senderId: string;
    sender: KahlaUser;
    sendTime: string;
    content: string;
    groupWithPrevious: boolean;
    sendTimeDate: Date;
}
