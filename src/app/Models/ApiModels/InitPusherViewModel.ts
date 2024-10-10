import { AiurProtocal } from "../AiurProtocal";

export interface InitWebsocketViewModel extends AiurProtocal {
    otp: string;
    otpValidTo: string;
    webSocketEndpoint: string;
}
