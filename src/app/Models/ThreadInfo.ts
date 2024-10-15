import { ContactInfo } from './Contacts/ContactInfo';
import { Message } from './Message';

export interface ThreadInfo {
    name: string;
    imagePath: string;
    latestMessage: Message;
    unReadAmount: number;
    id: number;
    muted: boolean;
    someoneAtMe: boolean;

    topTenMembers: ContactInfo[];
    lastMessageTime: Date;
    imAdmin: boolean;
    imOwner: boolean;

    allowSearchByName: boolean;
    allowMembersSendMessages: boolean;
    allowMembersEnlistAllMembers: boolean;
    allowMemberSoftInvitation: boolean;
    allowDirectJoinWithoutInvitation: boolean;

    ownerId: string;
    createTime: Date;
    imInIt: boolean;

    /**
     * @deprecated
     */
    avatarURL: string;
}
