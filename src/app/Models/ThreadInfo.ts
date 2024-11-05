import { ContactInfo } from './Contacts/ContactInfo';
import { Message } from './Message';

export interface ThreadInfo {
    // public attributes (can access anytime)
    id: number;
    name: string;
    imagePath: string;
    ownerId: string;
    createTime: Date;
    imInIt: boolean;
    allowDirectJoinWithoutInvitation: boolean;

    // private attributes (can access after joined)
    messageContext: {
        unReadAmount: number;
        latestMessage: Message;
    };
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

    /**
     * @deprecated
     */
    avatarURL: string;
}
