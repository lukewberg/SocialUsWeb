export interface User {
    backgroundPhotoUrl: string;
    bio: string;
    displayName: string;
    email: string;
    followers: {}[];
    following: {}[];
    friendState: {}[];
    id: string;
    photoUrl: string;
    userToken: string[];
    username: string;
    groups?: string[];
}