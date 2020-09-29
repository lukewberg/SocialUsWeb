export interface Post {
    description: string;
    followerList: string[];
    gameType: string;
    hashtags: string[];
    likes: object;
    location: string;
    mediaUrl: string;
    ownerId: string;
    postId: string;
    timestamp: string;
    username: string;
    comments?: any[];
}