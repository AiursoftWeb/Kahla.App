import { AiurProtocol } from './AiurProtocal';

export interface AiurCollection<T> extends AiurProtocol {
    items: T[];
}
