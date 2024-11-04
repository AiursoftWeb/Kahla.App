import { KahlaUser } from './KahlaUser';

export interface Message {
    id: string;
    conversationId: number;
    senderId: string;
    sender: KahlaUser;
    sendTime: string;
    content: string;
    groupWithPrevious: boolean;
    sendTimeDate: Date;
    resend: boolean;
    local: boolean;
    timeStamp: number;
}
