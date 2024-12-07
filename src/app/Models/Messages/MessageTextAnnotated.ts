export type MessageTextAnnotatedTypes = MessageTextAnnotatedMention['annotated'];

export interface MessageTextAnnotated {
    annotated: MessageTextAnnotatedTypes;
    content: string;

    [otherOptions: string]: unknown;
}

export interface MessageTextAnnotatedMention extends MessageTextAnnotated {
    annotated: 'mention';
    targetId: string; // UUID
}
