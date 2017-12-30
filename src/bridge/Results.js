import * as Data from "../model/Data";
const assert = require("assert");

export class BoardResults {
   constructor(boardNum, imps, boards, publishers) {
      this.boardNum = boardNum;
      this.imps = imps;
      this.boards = boards;
      this.publishers = publishers;
   }
}

export class ImpResults {
   constructor() {
      this.imps = [0, 0];
      this.teams = null;
      this.boards = new Map();
   }

   absImps(n) {
      // Diff. in Pts.  IMPs
      // 20 - 40         1
      // 50 - 80         2
      // 90 - 120        3
      // 130 - 160       4
      // 170 - 210       5
      // 220 - 260       6
      // 270 - 310       7
      // 320 - 360       8
      // 370 - 420       9
      // 430 - 490       10
      // 500 - 590       11
      // 600 - 740       12
      // 750 - 890       13
      // 900 - 1090      14
      // 1100 - 1290     15
      // 1300 - 1490     16
      // 1500 - 1740     17
      // 1750 - 1990     18
      // 2000 - 2240     19
      // 2250 - 2490     20
      // 2500 - 2990     21
      // 3000 - 3490     22
      // 3500 - 3990     23
      // 4000 and up     24

      switch (true) {
         case n < 20:
            return 0;
         case 20 <= n && n <= 40:
            return 1;
         case 50 <= n && n <= 80:
            return 2;
         case 90 <= n && n <= 120:
            return 3;
         case 130 <= n && n <= 160:
            return 4;
         case 170 <= n && n <= 210:
            return 5;
         case 220 <= n && n <= 260:
            return 6;
         case 270 <= n && n <= 310:
            return 7;
         case 320 <= n && n <= 360:
            return 8;
         case 370 <= n && n <= 420:
            return 9;
         case 430 <= n && n <= 490:
            return 10;
         case 500 <= n && n <= 590:
            return 11;
         case 600 <= n && n <= 740:
            return 12;
         case 750 <= n && n <= 890:
            return 13;
         case 900 <= n && n <= 1090:
            return 14;
         case 1100 <= n && n <= 1290:
            return 15;
         case 1300 <= n && n <= 1490:
            return 16;
         case 1500 <= n && n <= 1740:
            return 17;
         case 1750 <= n && n <= 1990:
            return 18;
         case 2000 <= n && n <= 2240:
            return 19;
         case 2250 <= n && n <= 2490:
            return 20;
         case 2500 <= n && n <= 2990:
            return 21;
         case 3000 <= n && n <= 3490:
            return 22;
         case 3500 <= n && n <= 3990:
            return 23;
         case 4000 <= n:
            return 24;
         default:
            throw new Error("Should not be reachable");
      }
   }

   calculateImps(diff) {
      if (diff < 0) {
         return -1 * this.absImps(-1 * diff);
      } else {
         return this.absImps(diff);
      }
   }

   add(boardArray, publisherArray) {
      let scores = boardArray.map(b => b.score());
      let posArray = publisherArray.map(p => p.publisherPosition());
      let teams = [[], []];
      for (var idx of [0, 1]) {
         if (posArray[idx] === Data.ns) {
            teams[idx].push(publisherArray[idx].team);
         } else {
            teams[1 - idx].push(publisherArray[idx].team);
         }
      }

      let imps = [0, 0];
      if (scores[0] > scores[1]) {
         imps[0] = this.calculateImps(scores[0] - scores[1]);
         this.imps[0] += imps[0];
      } else {
         imps[1] = this.calculateImps(scores[1] - scores[0]);
         this.imps[1] += imps[1];
      }
      assert(boardArray[0].boardNumber === boardArray[1].boardNumber);
      let boardNum = boardArray[0].boardNumber;
      let board = new BoardResults(boardNum, imps, boardArray, publisherArray);
      this.boards.set(boardNum, board);
      if (this.teams !== null) {
         var was = JSON.stringify(this.teams);
         var is = JSON.stringify(teams);
         assert(was === is, "was: " + was + ", is: " + is);
      } else {
         this.teams = teams;
      }
   }
}

export class TeamResults {
   constructor(sessionBoardSets) {
      this.sessionBoards = sessionBoardSets;
   }

   addConflict(conflictResults, key, boardSet) {
      if (!conflictResults.has(key)) {
         conflictResults.set(key, []);
      }
      conflictResults.get(key).push(boardSet);
   }

   compareBoardSets(a, b) {
      let aPos = a.publisherPosition();
      let bPos = b.publisherPosition();
      if (aPos === bPos) {
         let aKey = a.team + a._id;
         let bKey = b.team + b._id;
         return aKey - bKey;
      } else {
         if (aPos === Data.ns) {
            return -1;
         } else {
            return 1;
         }
      }
   }

   getBoardSet(boardSetArray) {
      return boardSetArray.sort((a, b) => {
         return this.compareBoardSets(a, b);
      })[0];
   }

   boardSetKey(boards) {
      let key = [];
      for (let board of boards.values()) {
         key.push(board.resultsKey());
      }
      return JSON.stringify(key);
   }

   sessionScore() {
      var uniqueResults = new Map();
      var conflictResults = new Map();
      var impResults = new ImpResults();
      var ret = {
         conflict: conflictResults,
         imps: impResults,
         publisher: [null, null],
         valid: false
      };
      var boardSets = this.sessionBoards.boardSets;
      for (let boardSet of boardSets) {
         var key = this.boardSetKey(boardSet.boards);
         if (!uniqueResults.has(key)) {
            uniqueResults.set(key, []);
         }
         var pos = boardSet.publisherPosition();
         if (pos !== null) {
            uniqueResults.get(key).push(boardSet);
         } else {
            this.addConflict(conflictResults, key, boardSet);
         }
      }

      if (uniqueResults.size < 2) {
         return ret;
      }

      // Ignore conflicts if we have enough non-conflicting results...
      let iter = uniqueResults.values();
      let boardSet1 = this.getBoardSet(iter.next().value);
      let boardSet2 = this.getBoardSet(iter.next().value);
      ret.publisher = [boardSet1, boardSet2];
      for (let [boardNum, b1] of boardSet1.boards) {
         if (!boardSet2.boards.has(boardNum)) {
            continue;
         }
         let b2 = boardSet2.boards.get(boardNum);
         impResults.add([b1, b2], ret.publisher);
         ret.valid = true;
      }

      return ret;
   }
}
