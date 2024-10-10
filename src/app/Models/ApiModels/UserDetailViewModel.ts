import { AiurProtocol } from '../AiurProtocal';
import { KahlaUser } from '../KahlaUser';
import { Request } from '../Request';

export interface UserDetailViewModel extends AiurProtocol {
    user: KahlaUser;
    areFriends: boolean;
    conversationId: number;
    sentRequest: boolean;
    pendingRequest: Request;
}
