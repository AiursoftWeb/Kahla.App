import { KahlaUser } from './KahlaUser';

export class DiscoverUser {
    public commonFriends: number;
    public commonGroups: number;
    public targetUser: KahlaUser;
    public sentRequest: boolean;
}
