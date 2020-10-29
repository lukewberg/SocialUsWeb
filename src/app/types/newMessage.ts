import { Message } from './message';

export interface NewMessage {
    threadIndex: number;
    message: Message;
}