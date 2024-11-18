import { AiurProtocol } from "../AiurProtocal";
import { KahlaUser } from "../KahlaUser";

export interface UserInfoViewModel extends AiurProtocol {
    briefUser: KahlaUser;
}
