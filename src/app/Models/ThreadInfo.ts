import { KahlaUser } from './KahlaUser';
import { Message } from './Message';

export interface ThreadInfo {
    name: string;
    imagePath: string;
    latestMessage: Message;
    unReadAmount: number;
    id: number;
    muted: boolean;
    someoneAtMe: boolean;

    topTenMembers: KahlaUser[];
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
    discriminator: 'GroupConversation' | 'PrivateConversation';
    /**
     * @deprecated
     */
    userId: string;
    /**
     * @deprecated
     */
    avatarURL: string;
    /**
     * @deprecated use online property in KahlaUser instead
     */
    online?: boolean;
}
