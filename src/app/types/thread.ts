import { Message } from './message';
import { User } from './user';

export interface Thread {
    members: string[];
    id?: string;
    messages?: Message[];
    groupChatName?: string;
    profile?: User;
}
