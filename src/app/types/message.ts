export interface Message {
    userId: string;
    mediaUrl?: string;
    message: string;
    timestamp: firebase.firestore.Timestamp;
}