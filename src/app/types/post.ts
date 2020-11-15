export interface Post {
    description: string;
    followerList: string[];
    gameType: 'tictactoe' | 'videoPost' | 'imagePost' | 'hangman' | 'truthordare';
    hashtags: string[];
    likes: string[];
    location: string;
    mediaUrl: string;
    ownerId: string;
    postId: string;
    timestamp: firebase.firestore.Timestamp;
    username: string;
    comments?: any[];
}