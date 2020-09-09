export interface User {
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
}