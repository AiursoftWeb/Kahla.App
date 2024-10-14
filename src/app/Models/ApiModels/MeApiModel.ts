import { AiurProtocol } from '../AiurProtocal';
import { AppOptions } from '../AppOptions';
import { KahlaUser } from '../KahlaUser';

export interface MeApiModel extends AiurProtocol {
    user: KahlaUser;

    privateSettings: AppOptions;
}
