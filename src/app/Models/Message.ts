﻿import { KahlaUser } from './KahlaUser';

export interface MessagePreview {
    id: string;
    threadId: number;
    sender: KahlaUser;
    sendTime: string;
    content: string;
}
