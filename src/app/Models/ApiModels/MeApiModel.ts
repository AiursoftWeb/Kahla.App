import { AiurProtocal } from "../AiurProtocal";
import { KahlaUser } from "../KahlaUser";

export interface MeApiModel extends AiurProtocal {
    user: KahlaUser;
    
    themeId: number;
    enableEmailNotification: boolean;
    enableEnterToSendMessage: boolean;
    enableHideMyOnlineStatus: boolean;
    listInSearchResult: boolean;
    allowHardInvitation: boolean;
}