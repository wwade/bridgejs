import moment from "moment";

export class BridgeSession {
   constructor(jSess) {
      this.Id = jSess.Id;
      this.Timestamp = jSess.Timestamp;
      this.Name = jSess.Name;
      this.date = new Date(this.Timestamp);
   }

   compare(other) {
      return other.Timestamp - this.Timestamp;
   }

   dateString() {
      let offset = moment().utcOffset() * 60 * 1000;
      let date = moment(this.Timestamp - offset);
      return date.fromNow();
   }
}

// const SuitValue = {
//    clubs: "clubs",
//    diamonds: "diamonds",
//    hearts: "hearts",
//    spades: "spades"
// };
//
// class Suit {
//    constructor(value) {
//       this.suit = undefined;
//       for (var k in SuitValue) {
//          if (value === SuitValue[k]) {
//             this.suit = k;
//             break;
//          }
//       }
//    }
// }

class BridgeBoard {
   constructor(data) {
      this.boardNumber = data.BoardNumber;
      this.suit = data.Suit;
      this.declarer = data.Declarer;
      this.level = data.Level;
      this.tricks = data.Tricks;
   }
}

export class BridgeBoardSet {
   constructor(data) {
      this.team = data.Team;
      this._id = data.Id;
      this.boards = new Map(
         data.Boards.map(b => [b.BoardNumber, new BridgeBoard(b)])
      );
   }
}

export class SessionBoardSets {
   constructor(data) {
      this.boardSets = data.map(b => new BridgeBoardSet(b));
   }
}
