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

function BadValue(value) {
   return new Error("Bad value " + value);
}

export const east = "east";
export const north = "north";
export const south = "south";
export const west = "west";

export const clubs = "clubs";
export const diamonds = "diamonds";
export const hearts = "hearts";
export const spades = "spades";
export const nt = "noTrumps";
export const majors = new Array(hearts, spades);
export const minors = new Array(clubs, diamonds);

export const undoubled = "undoubled";
export const redoubled = "redoubled";
export const doubled = "doubled";
export const none = new Array();
export const ew = new Array(east, west);
export const ns = new Array(north, south);
export const all = ns.concat(ew);

export class BridgeBoard {
   constructor(data) {
      this.boardNumber = data.BoardNumber;
      this.suit = data.Suit;
      this.declarer = data.Declarer;
      this.publisherSeat = data.PublisherSeat;
      this.level = data.Level;
      this.tricks = data.Tricks;
      this.doubled = data.Doubled;
   }

   vulnerable() {
      let index = (this.boardNumber - 1) % 16;
      switch (index) {
         case 0:
         case 7:
         case 10:
         case 13:
            return none;
         case 1:
         case 4:
         case 11:
         case 14:
            return ns;
         case 2:
         case 5:
         case 8:
         case 15:
            return ew;
         case 3:
         case 6:
         case 9:
         case 12:
            return all;
         default:
            throw new BadValue(index);
      }
   }

   relativeTricks() {
      return this.tricks - (6 + this.level);
   }

   contractPoints() {
      let relTricks = this.relativeTricks();
      if (relTricks < 0) {
         return 0;
      }
      let contractTricks = relTricks >= 0 ? this.level : 0;
      let contractTrickPoints;
      if (majors.includes(this.suit)) {
         contractTrickPoints = 30 * contractTricks;
      } else if (minors.includes(this.suit)) {
         contractTrickPoints = 20 * contractTricks;
      } else if (this.suit === nt) {
         contractTrickPoints = 40 + 30 * (contractTricks - 1);
      } else {
         throw new BadValue(this.suit);
      }

      if (this.doubled === doubled) {
         contractTrickPoints *= 2;
      } else if (this.doubled === redoubled) {
         contractTrickPoints *= 4;
      } else if (this.doubled !== undoubled) {
         throw new BadValue(this.doubled);
      }
      return contractTrickPoints;
   }

   score() {
      if (this.level === 0) {
         return 0;
      }
      let vul = this.declarerVulnerable();
      let contractPoints = this.contractPoints();
      let contractBonus = 0;
      if (contractPoints >= 100) {
         contractBonus = vul ? 500 : 300;
      } else if (this.relativeTricks() >= 0) {
         contractBonus = 50;
      }
      let slamBonus = this.slamBonus();
      let other = this.otherAboveLineScore();
      let total = contractPoints + other + contractBonus + slamBonus;
      if (ew.includes(this.declarer)) {
         total *= -1;
      }
      return total;
   }

   declarerVulnerable() {
      return this.vulnerable().includes(this.declarer);
   }

   slamBonus() {
      let vul = this.declarerVulnerable();
      let bonus = 0;
      if (this.level === 7 && this.tricks === 13) {
         bonus = vul ? 1500 : 1000;
      } else if (this.level === 6 && this.tricks >= 12) {
         bonus = vul ? 750 : 500;
      }
      return bonus;
   }

   otherAboveLineScore() {
      let relTricks = this.relativeTricks();
      let overTricks = relTricks > 0 ? relTricks : 0;
      let underTricks = relTricks < 0 ? -1 * relTricks : 0;
      let vulnerable = this.declarerVulnerable();

      let overTrickPoints;
      if (this.doubled === undoubled) {
         switch (this.suit) {
            case clubs:
            case diamonds:
               overTrickPoints = 20 * overTricks;
               break;
            case hearts:
            case spades:
            case nt:
               overTrickPoints = 30 * overTricks;
               break;
            default:
               throw new BadValue(this.suit);
         }
      } else if (this.doubled === doubled) {
         overTrickPoints = 100 * overTricks;
      } else if (this.doubled === redoubled) {
         overTrickPoints = 200 * overTricks;
      } else {
         throw new BadValue(this.doubled);
      }

      if (vulnerable && this.doubled !== undoubled) {
         overTrickPoints *= 2;
      }

      let underTrickPoints;
      if (this.doubled === undoubled) {
         // 50 for each undertrick
         underTrickPoints = -50 * underTricks;
         if (vulnerable) {
            // 100 for each undertrick
            underTrickPoints *= 2;
         }
      } else if (!vulnerable) {
         // 100 for first. 200 for 2nd and 3rd, 300 after that
         underTrickPoints = -100 * underTricks;
         if (underTricks > 1) {
            underTrickPoints += -100 * (underTricks - 1);
         }
         if (underTricks > 3) {
            underTrickPoints += -100 * (underTricks - 3);
         }
      } else {
         // 200 for first. 300 after
         underTrickPoints = -200 * underTricks;
         if (underTricks > 1) {
            underTrickPoints += -100 * (underTricks - 1);
         }
      }

      if (this.doubled === redoubled) {
         underTrickPoints *= 2;
      }

      let insult;
      if (underTricks === 0) {
         switch (this.doubled) {
            case undoubled:
               insult = 0;
               break;
            case doubled:
               insult = 50;
               break;
            case redoubled:
               insult = 100;
               break;
            default:
               throw new BadValue(this.doubled);
         }
      } else {
         insult = 0;
      }
      return overTrickPoints + underTrickPoints + insult;
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

   publisherPosition() {
      // Determine if pair sits E/W or N/S.
      let pos = null;
      let prev = null;
      for (let board of this.boards.values()) {
         if (ns.includes(board.publisherSeat)) {
            pos = ns;
         } else if (ew.includes(board.publisherSeat)) {
            pos = ew;
         } else {
            return null;
         }
         if (prev && prev != pos) {
            return null;
         }
         prev = pos;
      }
      return pos;
   }
}

export class SessionBoardSets {
   constructor(data) {
      this.boardSets = data.map(b => new BridgeBoardSet(b));
   }
}
