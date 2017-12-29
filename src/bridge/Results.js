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
      var boardSets = this.sessionBoards.boardSets;
      for (let boardSet of boardSets) {
         var key = JSON.stringify([...boardSet.boards.values()]);
         if (!uniqueResults.has(key)) {
            uniqueResults.set(key, {
               boardSet: boardSet,
               teamInfo: new Array()
            });
         }
         var pos = boardSet.publisherPosition();
         var val = { team: boardSet.team, pos: pos };
         if (pos !== null) {
            uniqueResults.get(key).teamInfo.push(val);
         } else {
            this.addConflict(conflictResults, key, val);
         }
      }

      return { results: uniqueResults, conflict: conflictResults };
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
