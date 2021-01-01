import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { TicTacToePost } from '../../types/ticTacToePost';
import { User } from '../../types/user';
import { firestore } from 'firebase';

@Component({
  selector: 'app-tictactoe-game',
  templateUrl: './tictactoe-game.component.html',
  styleUrls: ['./tictactoe-game.component.less']
})
export class TictactoeGameComponent implements OnInit, OnDestroy {

  @Input() post: TicTacToePost;
  @Input() authorProfile: User;
  @Input() opponentProfile: User;
  @Input() currentUser: User;
  gameSubscription: Subscription;
  gameChar: string;
  isTurn: boolean;
  spentTurn: boolean;
  gameSlots = [
    'squareOne',
    'squareTwo',
    'squareThree',
    'squareFour',
    'squareFive',
    'squareSix',
    'squareSeven',
    'squareEight',
    'squareNine'
  ];
  isPlayer: boolean;

  constructor(public fireStore: AngularFirestore) { }

  ngOnInit(): void {
    if (this.currentUser.id === this.post.playerOneId || this.currentUser.id === this.post.playerTwoId) {
      this.isPlayer = true;
    }
    if (this.currentUser.id === this.post.playerOneId) {
      this.gameChar = 'X';
    } else {
      this.gameChar = 'O';
    }
    this.checkInitialTurn();
    this.gameListener();
  }

  checkInitialTurn(): void {
    let selfCount = 0;
    let opponentCount = 0;
    for (let square of this.gameSlots) {
      if (this.post[square] !== ' ' && this.post[square] !== this.gameChar) {
        opponentCount += 1;
      } else if (this.post[square] !== ' ' && this.post[square] === this.gameChar) {
        selfCount += 1;
      }

      if (selfCount > opponentCount) {
        this.isTurn = false;
        this.spentTurn = true;
      } else if (selfCount < opponentCount) {
        this.isTurn = true;
        this.spentTurn = false;
      } else if (selfCount === opponentCount) {
        if (this.post.playerOneId === this.currentUser.id) {
          this.isTurn = true;
          this.spentTurn = false;
        } else {
          this.isTurn = false;
          this.spentTurn = true;
        }
      }
    }
  }

  gameListener(): void {
    this.gameSubscription = this.fireStore.collection('posts').doc(this.post.postId).snapshotChanges().subscribe(result => {
      if (this.spentTurn) {
        this.spentTurn = false;
        this.post = result.payload.data() as TicTacToePost;
      } else if (!this.spentTurn) {
        this.isTurn = true;
        this.post = result.payload.data() as TicTacToePost;
      }
      console.log(result.payload.data());
    });
  }

  playTurn(field: string): void {
    this.isTurn = false;
    this.spentTurn = true;
    this.fireStore.collection('posts').doc(this.post.postId).update({
        [field]: this.gameChar,
        turn: firestore.FieldValue.increment(1)
      });
  }

  ngOnDestroy(): void {
    this.gameSubscription.unsubscribe();
  }

}
