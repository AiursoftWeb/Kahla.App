import { AiurProtocol } from './AiurProtocal';

export interface AiurValue<T> extends AiurProtocol {
    value: T;
}
