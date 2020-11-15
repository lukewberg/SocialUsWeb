import { User } from './user';

export interface TicTacToePost {
    recentMove: string;
    buttonOneDisabled: boolean;
    buttonTwoDisabled: boolean;
    buttonThreeDisabled: boolean;
    buttonFourDisabled: boolean;
    buttonFiveDisabled: boolean;
    buttonSixDisabled: boolean;
    buttonSevenDisabled: boolean;
    buttonEightDisabled: boolean;
    buttonNineDisabled: boolean;
    description: string;
    followerList: string[];
    gameType: 'tictactoe' | 'videoPost' | 'imagePost' | 'hangman' | 'truthordare';
    mediaUrl: string;
    ownerId: string;
    playerOneId: string;
    playerTwoId: string;
    postId: string;
    squareOne: string;
    squareTwo: string;
    squareThree: string;
    squareFour: string;
    squareFive: string;
    squareSix: string;
    squareSeven: string;
    squareEight: string;
    squareNine: string;
    timestamp: firebase.firestore.Timestamp;
    turn: number;
    opponentProfile?: User;
}