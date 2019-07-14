import { AiurProtocal } from '../AiurProtocal';
import { KahlaUser } from '../KahlaUser';
import { Request } from '../Request';

export class UserDetailViewModel extends AiurProtocal {
    public user: KahlaUser;
    public areFriends: boolean;
    public conversationId: number;
    public sentRequest: boolean;
    public pendingRequest: Request;
}
