import { AiurProtocal } from './AiurProtocal';

export interface AiurCollection<T> extends AiurProtocal {
    items: T[];
}
