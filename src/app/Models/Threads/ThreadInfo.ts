import { ContactInfo } from '../Contacts/ContactInfo';
import { MessagePreview } from '../MessagePreview';

export interface ThreadInfo {
    // public attributes (can access anytime)
    id: number;
    name: string;
    imagePath: string;
    ownerId: string;
    createTime: Date;
    imInIt: boolean;
    allowDirectJoinWithoutInvitation: boolean;
}

export interface ThreadInfoJoined extends ThreadInfo {
    // private attributes (can access after joined)
    messageContext: {
        unReadAmount: number;
        latestMessage: MessagePreview;
    };
    totalMessages: number;
    muted: boolean;
    someoneAtMe: boolean;
    topTenMembers: ContactInfo[];
    lastMessageTime: Date;
    imAdmin: boolean;
    imOwner: boolean;

    // options
    allowSearchByName: boolean;
    allowMembersSendMessages: boolean;
    allowMembersEnlistAllMembers: boolean;
    allowMemberSoftInvitation: boolean;
}
