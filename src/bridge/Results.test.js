import * as Data from "../model/Data";
import * as Results from "./Results";

const C = Data.clubs;
const D = Data.diamonds;
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

function teamResults(boardSets) {
   let sessionBoardSets = new Data.SessionBoardSets(boardSets);
   return new Results.TeamResults(sessionBoardSets);
}

const team1Ns = {
   Team: "Alice + Bob",
   Boards: [
      board(1, 3, C, N, 0, S),
      board(2, 3, NT, W, 1, S),
      board(3, 5, D, S, -1, S)
   ]
};

const team1NsB = {
   Team: "Bob + Alice",
   Boards: team1Ns.Boards
};

const team1Ew = {
   Team: "Harry + Sally",
   Boards: [
      board(1, 3, D, S, 0, W),
      board(2, 3, NT, W, 1, W),
      board(3, 5, D, S, -1, W)
   ]
};

const team1EwBad = {
   Team: "Harry + Sally",
   Boards: [
      board(1, 3, D, S, 0, W),
      board(2, 3, NT, W, 1, W),
      board(3, 5, D, S, -1, W)
   ]
};

const team2Ns = {
   Team: "Jay + Silent Bob",
   Boards: [
      board(1, 3, D, S, 0, N),
      board(2, 3, NT, W, 1, N),
      board(3, 5, D, S, -1, N)
   ]
};

const team2Ew = {
   Team: "Turner + Hooch",
   Boards: [
      board(1, 3, C, N, 0, E),
      board(2, 3, NT, W, 1, E),
      board(3, 5, D, S, -1, E)
   ]
};

it("basic, scores entered by each team's n/s pair", () => {
   let tr = teamResults([team1Ns, team2Ns]);
   let ss = tr.sessionScore();
   expect(ss.results.size).toBe(2);
   expect(ss.conflict.size).toBe(0);
   let haveNs = 0;
   let haveEw = 0;
   for (let r of ss.results.values()) {
      expect(r.teamInfo.length).toBe(1);
      if (r.teamInfo.pos === Data.ew) {
         haveEw += 1;
      } else if (r.teamInfo.pos === Data.nw) {
         haveNs += 1;
      } else {
         assert(false, "invalid teamInfo.pos" + teamInfo.pos);
      }
   }
   expect(haveNs).toBe(2);
   expect(haveEw).toBe(0);
});

it("marginal, same n/s pair, both players entered results", () => {
   let tr = teamResults([team1Ns, team1NsB]);
   let ss = tr.sessionScore();
   expect(ss.results.size).toBe(1);
   expect(ss.conflict.size).toBe(0);
   for (let r of ss.results.values()) {
      expect(r.teamInfo.length).toBe(2);
   }
});

//it("everyone entered results", () => {
//});

//it("someone entered conflicting results", () => {
//});
