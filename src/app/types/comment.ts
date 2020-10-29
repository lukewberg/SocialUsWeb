export interface Comment {
    anonymousDuration: number;
    anonymousState: boolean;
    avatarUrl: string;
    comment: string;
    mediaUrl: string;
    postId: string;
    timestamp: firebase.firestore.Timestamp;
    userId: string;
    username: string;
}