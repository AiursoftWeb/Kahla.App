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

    // private attributes (can access after joined)
    latestMessage: Message;
    unReadAmount: number;
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
    allowDirectJoinWithoutInvitation: boolean;

    /**
     * @deprecated
     */
    avatarURL: string;
}
