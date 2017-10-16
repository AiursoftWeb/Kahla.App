import { AiurProtocal } from '../AiurProtocal';
import { KahlaUser } from '../KahlaUser';

export class UserDetailViewModel extends AiurProtocal {
    public user: KahlaUser;
    public areFriends: boolean;
    public conversationId: number;
}
