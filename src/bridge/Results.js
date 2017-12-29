import * as Data from "../model/Data";
const assert = require("assert");

export class BoardResults {
   constructor(boardNum, imps1, imps2, board1, board2) {
      this.boardNum = boardNum;
      this.imps = [imps1, imps2];
      this.boards = [board1, board2];
   }
}

export class ImpResults {
   constructor() {
      this.imps1 = 0;
      this.imps2 = 0;
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

   imps(diff) {
      if (diff < 0) {
         return -1 * this.absImps(-1 * diff);
      } else {
         return this.absImps(diff);
      }
   }

   add(board1, board2, pos1, pos2) {
      let team1Score = board1.score();
      let team2Score = board2.score();
      if (pos1 === Data.ew) {
         team1Score = -1 * team1Score;
      }
      if (pos2 === Data.ew) {
         team2Score = -1 * team2Score;
      }

      let team1Imps = 0;
      let team2Imps = 0;
      if (team1Score > team2Score) {
         team1Imps = this.imps(team1Score - team2Score);
         this.imps1 += team1Imps;
      } else {
         team2Imps = this.imps(team2Score - team1Score);
         this.imps2 += team2Imps;
      }
      assert(board1.boardNumber === board2.boardNumber);
      let boardNum = board1.boardNumber;
      let board = new BoardResults(
         boardNum,
         team1Imps,
         team2Imps,
         board1,
         board2
      );
      this.boards.set(boardNum, board);
   }
}

export class TeamResults {
   constructor(sessionBoardSets) {
      this.sessionBoards = sessionBoardSets;
   }

   addConflict(conflictResults, key, val) {
      if (!conflictResults.has(key)) {
         conflictResults.set(key, { teamInfo: [] });
      }
      conflictResults.get(key).teamInfo.push(val);
   }

   sessionScore() {
      var uniqueResults = new Map();
      var conflictResults = new Map();
      var impResults = new ImpResults();
      var ret = {
         results: uniqueResults,
         conflict: conflictResults,
         imps: impResults,
         team1: null,
         team2: null
      };
      var boardSets = this.sessionBoards.boardSets;
      for (let boardSet of boardSets) {
         var key = JSON.stringify([...boardSet.boards.values()]);
         if (!uniqueResults.has(key)) {
            uniqueResults.set(key, {
               boardSet: boardSet,
               publisherInfo: []
            });
         }
         var pos = boardSet.publisherPosition();
         var val = { team: boardSet.team, pos: pos };
         if (pos !== null) {
            uniqueResults.get(key).publisherInfo.push(val);
         } else {
            this.addConflict(conflictResults, key, val);
         }
      }

      if (uniqueResults.size < 2) {
         return ret;
      }

      // Ignore conflicts if we have enough non-conflicting results...
      let iter = uniqueResults.values();
      let res1 = iter.next().value;
      let res2 = iter.next().value;
      let res1Boards = res1.boardSet.boards;
      let res2Boards = res2.boardSet.boards;
      ret.team1 = res1.boardSet;
      ret.team2 = res2.boardSet;
      for (let [boardNum, b1] of res1Boards) {
         if (!res2Boards.has(boardNum)) {
            continue;
         }
         let b2 = res2Boards.get(boardNum);
         impResults.add(b1, b2, res1.publisherInfo.pos, res2.publisherInfo.pos);
      }

      return ret;
   }
}
