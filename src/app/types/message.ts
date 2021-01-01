export interface Message {
    authorId: string;
    mediaUrl?: string;
    message: string;
    timestamp: firebase.firestore.Timestamp;
    read?: boolean;
}