import { AiurProtocal } from './AiurProtocal';

export interface AiurValue<T> extends AiurProtocal {
    value: T;
}
