import * as Data from "./Data";

const C = Data.clubs;
const D = Data.diamonds;
const H = Data.hearts;
const SP = Data.spades;
const NT = Data.nt;
const U = Data.undoubled;
const X = Data.doubled;
const XX = Data.redoubled;
const N = Data.north;
const E = Data.east;
const S = Data.south;
const W = Data.west;

class BBWrap {
   constructor(bridgeBoard, refSeat) {
      this.board = bridgeBoard;
      this.refSeat = refSeat;
   }
}

function noBid(boardNum) {
   let bb = new Data.BridgeBoard({
      BoardNumber: boardNum,
      Level: 0,
      Suit: "none",
      Doubled: U,
      Tricks: 0,
      Declarer: "none"
   });
   return new BBWrap(bb, N);
}

function board(boardNum, level, suit, doubled, relTricks, declarer, refSeat) {
   let bb = new Data.BridgeBoard({
      BoardNumber: boardNum,
      Level: level,
      Suit: suit,
      Doubled: doubled,
      Tricks: 6 + level + relTricks,
      Declarer: declarer
   });
   return new BBWrap(bb, refSeat);
}

function checkScore(testCase, boardWrap, expected) {
   it("scoring: " + testCase, () => {
      let board = boardWrap.board;
      let refSeat = boardWrap.refSeat;
      let score = board.score();
      if (refSeat === E || refSeat === W) {
         score = -1 * score;
      }
      expect(score).toBe(expected);
   });
}

checkScore("no bid             ", noBid(), 0);
checkScore("game               ", board(1, 4, SP, U, 0, N, N), 420);
checkScore("vul game           ", board(2, 4, SP, U, 0, N, N), 620);
checkScore("game doubled       ", board(1, 5, C, X, 0, N, N), 550);
checkScore("game XX over       ", board(1, 5, C, XX, 2, N, N), 1200);
checkScore("game V XX over     ", board(4, 5, C, XX, 2, N, N), 1800);
checkScore("part minor         ", board(1, 1, D, U, 0, N, N), 70);
checkScore("part major         ", board(1, 1, H, U, 0, N, E), -80);
checkScore("part NT            ", board(1, 1, NT, U, 0, N, N), 90);
checkScore("part minor down    ", board(1, 1, D, U, -2, N, N), -100);
checkScore("part minor X       ", board(1, 1, D, X, 0, N, N), 140);
checkScore("part minor X game  ", board(1, 3, D, X, 0, N, N), 470);
checkScore("part minor XX game ", board(1, 2, D, XX, 0, N, N), 560);
checkScore("part minor VXX     ", board(4, 1, D, XX, 3, N, N), 1430);
checkScore("part major over    ", board(1, 2, H, U, 2, N, S), 170);
checkScore("part major over vul", board(4, 2, H, U, 2, N, S), 170);
checkScore("part major over X  ", board(1, 2, H, X, 2, N, S), 670);
checkScore("part major ov V X  ", board(4, 2, H, X, 2, N, S), 1070);
checkScore("part major ov XX   ", board(1, 2, H, XX, 2, N, E), -1040);
checkScore("part major ov V XX ", board(4, 2, H, XX, 2, N, S), 1640);
checkScore("down 1             ", board(1, 4, H, U, -1, E, N), 50);
checkScore("down 4             ", board(1, 4, H, U, -4, E, W), -200);
checkScore("down 1 V           ", board(4, 2, H, U, -1, E, W), -100);
checkScore("down 1 X           ", board(1, 2, H, X, -1, E, W), -100);
checkScore("down 1 VX          ", board(4, 2, H, X, -2, E, W), -500);
checkScore("down 1 XX          ", board(1, 2, H, XX, -6, E, W), -2800);
checkScore("down 1 VXX         ", board(4, 2, H, XX, -6, E, W), -3400);
checkScore("small slam         ", board(3, 6, NT, U, 0, N, S), 990);
checkScore("small slam vul     ", board(3, 6, NT, U, 1, E, W), 1470);
checkScore("grand slam         ", board(8, 7, D, U, 0, S, N), 1440);
checkScore("vs grand lam vul   ", board(4, 7, D, U, 0, N, E), -2140);
