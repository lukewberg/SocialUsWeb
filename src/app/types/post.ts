export interface Post {
    description: string;
    followerList: string[];
    gameType: string;
    hashtags: string[];
    likes: string[];
    location: string;
    mediaUrl: string;
    ownerId: string;
    postId: string;
    timestamp: string;
    username: string;
    comments?: any[];
}