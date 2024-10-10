import { KahlaUser } from './KahlaUser';

export interface DiscoverUser {
    commonFriends: number;
    commonGroups: number;
    targetUser: KahlaUser;
    sentRequest: boolean;
}
