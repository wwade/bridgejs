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

const team1Ns = {
   // Results must equal team2Ew
   Team: "Alice + Bob",
   Boards: [
      board(1, 4, H, N, 2, S),
      board(2, 3, NT, W, 0, S),
      board(3, 5, D, S, -1, S)
   ]
};

const team1NsB = {
   Team: "Bob + Alice",
   Boards: team1Ns.Boards
};

const team1Ew = {
   // Results must equal team2Ns
   Team: "Harry + Sally",
   Boards: [
      board(1, 3, D, S, 0, W),
      board(2, 3, NT, W, -1, W),
      board(3, 5, H, S, -1, W)
   ]
};

const team1EwBad = {
   Team: "Harry + Sally",
   Boards: [
      board(1, 3, D, S, 0, W),
      board(2, 2, NT, W, 0, W),
      board(3, 5, H, S, -1, W)
   ]
};

const team2Ns = {
   // Results must equal team1Ew
   Team: "Jay + Silent Bob",
   Boards: [
      board(1, 3, D, S, 0, N),
      board(2, 3, NT, W, -1, N),
      board(3, 5, H, S, -1, N)
   ]
};

const team2Ew = {
   // Results must equal team1Ns
   Team: "Turner + Hooch",
   Boards: [
      board(1, 4, H, N, 2, E),
      board(2, 3, NT, W, 0, E),
      board(3, 5, D, S, -1, E)
   ]
};

it("basic, scores entered by each team's n/s pair", () => {
   let ss = score([team1Ns, team2Ns]);
   expect(ss.results.size).toBe(2);
   expect(ss.conflict.size).toBe(0);
   let haveNs = 0;
   let haveEw = 0;
   for (let r of ss.results.values()) {
      expect(r.publisherInfo.length).toBe(1);
      if (r.publisherInfo.pos === Data.ew) {
         haveEw += 1;
      } else if (r.publisherInfo.pos === Data.nw) {
         haveNs += 1;
      } else {
         assert(false, "invalid publisherInfo.pos" + publisherInfo.pos);
      }
   }
   expect(haveNs).toBe(2);
   expect(haveEw).toBe(0);

   expect(ss.team1.team).toEqual(team1Ns.Team);
   expect(ss.team2.team).toEqual(team2Ns.Team);
   expect(ss.imps.imps1).toEqual(9);
   expect(ss.imps.imps2).toEqual(10);
   expect(ss.imps.boards.get(1).imps).toEqual([9, 0]);
   expect(ss.imps.boards.get(2).imps).toEqual([0, 10]);
   expect(ss.imps.boards.get(3).imps).toEqual([0, 0]);
});

it("basic, scores entered by each team's e/w pair", () => {
   let ss = score([team1Ew, team2Ew]);
   expect(ss.results.size).toBe(2);
   expect(ss.conflict.size).toBe(0);
   let haveNs = 0;
   let haveEw = 0;
   for (let r of ss.results.values()) {
      expect(r.publisherInfo.length).toBe(1);
      if (r.publisherInfo.pos === Data.ew) {
         haveEw += 1;
      } else if (r.publisherInfo.pos === Data.nw) {
         haveNs += 1;
      } else {
         assert(false, "invalid publisherInfo.pos" + publisherInfo.pos);
      }
   }
   expect(haveNs).toBe(2);
   expect(haveEw).toBe(0);

   expect(ss.team1.team).toEqual(team1Ew.Team);
   expect(ss.team2.team).toEqual(team2Ew.Team);
   expect(ss.imps.imps1).toEqual(9);
   expect(ss.imps.imps2).toEqual(10);
   expect(ss.imps.boards.get(1).imps).toEqual([9, 0]);
   expect(ss.imps.boards.get(2).imps).toEqual([0, 10]);
   expect(ss.imps.boards.get(3).imps).toEqual([0, 0]);
});

it("negative, same n/s pair, both players entered results", () => {
   let ss = score([team1Ns, team1NsB]);
   expect(ss.results.size).toBe(1);
   expect(ss.conflict.size).toBe(0);
   for (let r of ss.results.values()) {
      expect(r.publisherInfo.length).toBe(2);
   }
   expect(ss.imps.imps1).toEqual(0);
   expect(ss.imps.imps2).toEqual(0);
});

it("only one team entered results, 1 NS and 1 EW", () => {
   let ss = score([team1Ns, team1Ew]);
   expect(ss.results.size).toBe(2);
   for (let r of ss.results.values()) {
      expect(r.publisherInfo.length).toBe(1);
   }
});

//it("one set of results is missing a board", () => {
//});

//it("everyone entered results", () => {
//});

//it("someone entered conflicting results", () => {
//});
//

function impCheck(val, expImps) {
   expect(new Results.ImpResults().imps(val)).toEqual(expImps);
   if (expImps) {
      expect(new Results.ImpResults().imps(-1 * val)).toEqual(-1 * expImps);
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
