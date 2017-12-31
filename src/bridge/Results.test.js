import * as Data from "../model/Data";
import * as Results from "./Results";

const D = Data.diamonds;
const H = Data.hearts;
const NT = Data.nt;
const U = Data.undoubled;
const N = Data.north;
const E = Data.east;
const S = Data.south;
const W = Data.west;

function board(num, level, suit, decl, made, publisherSeat) {
   let tricks = level + 6 + made;
   return {
      BoardNumber: num,
      Suit: suit,
      Declarer: decl,
      Level: level,
      Tricks: tricks,
      Doubled: U,
      PublisherSeat: publisherSeat
   };
}

function _teamResults(boardSets) {
   let sessionBoardSets = new Data.SessionBoardSets(boardSets);
   return new Results.TeamResults(sessionBoardSets);
}

function score(boardSets) {
   let tr = _teamResults(boardSets);
   return tr.sessionScore();
}

function table1Boards(publisherSeat) {
   return [
      board(1, 4, H, N, 2, publisherSeat),
      board(2, 3, NT, W, 0, publisherSeat),
      board(3, 5, D, S, -1, publisherSeat)
   ];
}

function table2Boards(publisherSeat) {
   return [
      board(1, 3, D, S, 0, publisherSeat),
      board(2, 3, NT, W, -1, publisherSeat),
      board(3, 5, H, S, -1, publisherSeat)
   ];
}

const team1Ns = {
   Team: "Alice + Bob (1NS)",
   Id: 1,
   Boards: table1Boards(S)
};

const team1NsB = {
   Team: "Bob + Alice (1SN)",
   Id: 2,
   Boards: table1Boards(N)
};

const team1Ew = {
   Team: "Harry + Sally (1EW)",
   Id: 3,
   Boards: table2Boards(W)
};

const team1EwBad = {
   // different results!
   Team: "Harry + Sally (1BEW)",
   Id: 4,
   Boards: [
      board(1, 3, D, S, 0, W),
      board(2, 2, NT, W, 0, W),
      board(3, 5, H, S, -1, W)
   ]
};

const team2Ns = {
   Team: "Jay + Silent Bob (2NS)",
   Id: 5,
   Boards: table2Boards(N)
};

const team2Ew = {
   Team: "Blue + Orange (2EW)",
   Id: 6,
   Boards: table1Boards(E)
};

const noBoards = {
   Team: "Bad Guy",
   Id: 7,
   Boards: []
};

function validateResults(scores, publishers, winnerIn, loserIn) {
   expect(scores.conflict.size).toBe(0);

   let winner = winnerIn.map(v => v.Team);
   let loser = loserIn.map(v => v.Team);

   for (var index = 0; index < scores.imps.teams.length; ++index) {
      var team = scores.imps.teams[index];
      if (JSON.stringify(winner) === JSON.stringify(team)) {
         expect(scores.imps.imps[index]).toEqual(10);
         expect(scores.imps.boards.get(1).imps[index]).toEqual(0);
         expect(scores.imps.boards.get(2).imps[index]).toEqual(10);
         expect(scores.imps.teams[index]).toEqual(winner);
      } else {
         expect(scores.imps.imps[index]).toEqual(9);
         expect(scores.imps.boards.get(1).imps[index]).toEqual(9);
         expect(scores.imps.boards.get(2).imps[index]).toEqual(0);
         expect(scores.imps.teams[index]).toEqual(loser);
      }
      expect(scores.imps.boards.get(3).imps).toEqual([0, 0]);
   }

   //let actualPubNames = scores.publisher.map(p => p.team);
   //let expectPubNames = publishers.map(p => p.Team);
   //expect(actualPubNames).toEqual(expectPubNames);
}

it("basic, scores entered by each team's NS pair", () => {
   let ss = score([team1Ns, team2Ns]);
   validateResults(ss, [team1Ns, team2Ns], [team2Ns], [team1Ns]);
});

it("basic, scores entered by each team's EW pair", () => {
   let ss = score([team1Ew, team2Ew]);
   validateResults(ss, [team2Ew, team1Ew], [team2Ew], [team1Ew]);
});

it("basic, only one team entered results, 1 NS and 1 EW", () => {
   let ss = score([team1Ns, team1Ew]);
   validateResults(ss, [team1Ns, team1Ew], [], [team1Ns, team1Ew]);
});

it("everyone entered results", () => {
   let ss = score([team1Ns, team1Ew, team2Ns, team2Ew]);
   validateResults(ss, null, [team2Ns], [team1Ns]);
});

it("negative, same n/s pair, both players entered results", () => {
   let ss = score([team1Ns, team1NsB]);
   expect(ss.valid).toBe(false);
});

it("corner, two valid results and with no boards", () => {
   let ss = score([noBoards, team1Ns, team2Ns]);
   validateResults(ss, [team1Ns, team2Ns], [team2Ns], [team1Ns]);
});

//it("one set of results is missing a board", () => {
//});

//it("someone entered conflicting results", () => {
//});
//

function impCheck(val, expImps) {
   expect(new Results.ImpResults().calculateImps(val)).toEqual(expImps);
   if (expImps) {
      expect(new Results.ImpResults().calculateImps(-1 * val)).toEqual(
         -1 * expImps
      );
   }
}

it("calculate IMPs for all score differences", () => {
   impCheck(0, 0);
   impCheck(10, 0);
   impCheck(20, 1);
   impCheck(40, 1);
   impCheck(50, 2);
   impCheck(80, 2);
   impCheck(90, 3);
   impCheck(120, 3);
   impCheck(130, 4);
   impCheck(160, 4);
   impCheck(170, 5);
   impCheck(210, 5);
   impCheck(220, 6);
   impCheck(260, 6);
   impCheck(270, 7);
   impCheck(310, 7);
   impCheck(320, 8);
   impCheck(360, 8);
   impCheck(370, 9);
   impCheck(420, 9);
   impCheck(430, 10);
   impCheck(490, 10);
   impCheck(500, 11);
   impCheck(590, 11);
   impCheck(600, 12);
   impCheck(740, 12);
   impCheck(750, 13);
   impCheck(890, 13);
   impCheck(900, 14);
   impCheck(1090, 14);
   impCheck(1100, 15);
   impCheck(1290, 15);
   impCheck(1300, 16);
   impCheck(1490, 16);
   impCheck(1500, 17);
   impCheck(1740, 17);
   impCheck(1750, 18);
   impCheck(1990, 18);
   impCheck(2000, 19);
   impCheck(2240, 19);
   impCheck(2250, 20);
   impCheck(2490, 20);
   impCheck(2500, 21);
   impCheck(2990, 21);
   impCheck(3000, 22);
   impCheck(3490, 22);
   impCheck(3500, 23);
   impCheck(3990, 23);
   impCheck(4000, 24);
   impCheck(5000, 24);
});
