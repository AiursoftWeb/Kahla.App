import { AiurProtocol } from './AiurProtocal';

export interface AiurValue<T> extends AiurProtocol {
    value: T;
}

export type AiurValueNamed<T, N extends string> = {
    [key in N]: T;
} & AiurProtocol;
