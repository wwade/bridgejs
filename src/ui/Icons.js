import React from "react";
import * as Data from "../model/Data";

const black = {
   color: "black"
};
const red = {
   color: "red"
};
const Clubs = <span style={black}>{"\u2663"}</span>;
const Diamonds = <span style={red}>{"\u2666"}</span>;
const Hearts = <span style={red}>{"\u2665"}</span>;
const Spades = <span style={black}>{"\u2660"}</span>;

export default function suitIcon(suit) {
   switch (suit) {
      case Data.clubs:
         return Clubs;
      case Data.diamonds:
         return Diamonds;
      case Data.hearts:
         return Hearts;
      case Data.spades:
         return Spades;
      case Data.nt:
         return <span>NT</span>;
      default:
         throw new Error("Bad suit value " + suit);
   }
}
