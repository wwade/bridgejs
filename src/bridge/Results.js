import * as Data from "../model/Data";
const assert = require("assert");

export class BoardResults {
   constructor(boardNum, imps1, team1, imps2, team2) {
      this.boardNum = boardNum;
      this.imps = [imps1, imps2];
      this.teams = [team1, team2];
   }
}

export class ImpResults {
   constructor() {
      this.imps1 = 0;
      this.imps2 = 0;
      this.boards = new Map();
   }

   absImps(n) {
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
      }
   }

   imps(diff) {
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

      if (diff < 0) {
         return -1 * this.absImps(-1 * diff);
      } else {
         return this.absImps(diff);
      }
   }

   add(board1, board2, res1, res2) {
      let team1Score = board1.score();
      let team2Score = board2.score();
      if (res1.publisherInfo.pos === Data.ew) {
         team1Score = -1 * team1Score;
      }
      if (res2.publisherInfo.pos === Data.ew) {
         team2Score = -1 * team2Score;
      }

      let team1Imps = 0;
      let team2Imps = 0;
      if (team1Score > team2Score) {
         team1Imps = team1Score - team2Score;
         this.imps1 += team1Imps;
      } else {
         team2Imps = team2Score - team2Score;
         this.imps2 += team2Imps;
      }
      assert(board1.boardNumber === board2.boardNumber);
      let boardNum = board1.boardNumber;
      let board = new BoardResults(boardNum, team1Imps, res1, team2Imps, res2);
      this.boards.set(boardNum, board);
   }
}

export class TeamResults {
   constructor(sessionBoardSets) {
      this.sessionBoards = sessionBoardSets;
   }

   addConflict(conflictResults, key, val) {
      if (!conflictResults.has(key)) {
         conflictResults.set(key, { teamInfo: new Array() });
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
         imps: impResults
      };
      var boardSets = this.sessionBoards.boardSets;
      for (let boardSet of boardSets) {
         var key = JSON.stringify([...boardSet.boards.values()]);
         if (!uniqueResults.has(key)) {
            uniqueResults.set(key, {
               boardSet: boardSet,
               publisherInfo: new Array()
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
      for (let [boardNum, b1] of res1Boards) {
         if (!res2Boards.has(boardNum)) {
            continue;
         }
         let b2 = res2Boards.get(boardNum);
         impResults.add(b1, b2, res1, res2);
      }

      return ret;
   }
   // sessionScore() {
   //    var results = new Map();
   //    var boardSets = this.sessionBoards.boardSets;
   //    for (let boardSet of boardSets) {
   //       for (let board of boardSet.boards.values()) {
   //          let boardStr = JSON.stringify(board);
   //          if (!results.has(boardStr)) {
   //             results.set(boardStr, { board: board, teams: new Array() });
   //          }
   //          results.get(boardStr).teams.push(boardSet.team);
   //       }
   //    }
   //    for (let info of results.values()) {
   //       let board = info.board;
   //       let teamList = info.teams;
   //       console.log(board.boardNumber, board.score(), teamList);
   //    }
   //    console.log(results);
   //    return results;
   // }

   // teams() {
   //    var bs = this.sessionBoards.boardSets;
   //    var boardResults = new Map();
   //    for (var key of bs) {
   //       var boardSet = bs[key];
   //       for (var [boardNum, board] of boardSet.boards) {
   //          if (!boardResults.has(boardNum)) {
   //             boardResults[boardNum] = new Array();
   //          }
   //          boardResults[boardNum].push([boardSet.team, board]);
   //       }
   //    }
   // }
}
