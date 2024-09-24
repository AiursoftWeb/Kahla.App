import { AiurProtocal } from "../AiurProtocal";

export class InitWebsocketViewModel extends AiurProtocal {
    otp: string;
    otpValidTo: string;
    webSocketEndpoint: string;
}
