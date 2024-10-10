import { AiurProtocol } from "../AiurProtocal";

export interface InitWebsocketViewModel extends AiurProtocol {
    otp: string;
    otpValidTo: string;
    webSocketEndpoint: string;
}
