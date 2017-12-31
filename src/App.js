import "./App.css";
import * as Data from "./model/Data";
import { BoardResults, ImpResults, TeamResults } from "./bridge/Results";
import { Card, CardText, CardTitle } from "material-ui/Card";
import { Component } from "react";
import { HashRouter, Link, Route } from "react-router-dom";
import { getBoards } from "./api";
import AppBar from "./ui/AppBar";
import suitIcon from "./ui/Icons";
import Drawer from "material-ui/Drawer";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import PropTypes from "prop-types";
import React from "react";
import SessionListContainer from "./comp/SessionList";
import darkBaseTheme from "material-ui/styles/baseThemes/darkBaseTheme";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import lightBaseTheme from "material-ui/styles/baseThemes/lightBaseTheme";

const assert = require("assert");

function numberObjId(value) {
   let idVal;
   if (value > 0) {
      idVal = "positive";
   } else if (value < 0) {
      idVal = "negative";
   } else {
      idVal = "tied";
   }
   return idVal;
}

function teamIndexElementId(index) {
   switch (index) {
      case 0:
         return "team1";
      case 1:
         return "team2";
      default:
         assert(false, "invalid team index " + index);
   }
}

class ContractInfo extends Component {
   static propTypes = {
      board: PropTypes.instanceOf(Data.BridgeBoard).isRequired
   };

   trickString(b) {
      let relTricks = b.relativeTricks();
      if (!relTricks) {
         return "";
      } else {
         if (relTricks > 0) {
            return ", made " + (b.level + relTricks);
         } else {
            return ", down " + -1 * relTricks;
         }
      }
   }

   render() {
      let b = this.props.board;
      if (b.level) {
         let xStr;
         switch (b.doubled) {
            case Data.doubled:
               xStr = " X";
               break;
            case Data.redoubled:
               xStr = " XX";
               break;
            default:
               xStr = "";
               break;
         }
         let score = b.score();
         let scoreId = numberObjId(score);
         if (score > 0) {
            score = "+" + score;
         }
         return (
            <span>
               {b.level}
               {suitIcon(b.suit)}
               {xStr} by {b.declarer}
               {this.trickString(b)} (<span id={scoreId}>{score}</span>)
            </span>
         );
      } else {
         return <span>No bid</span>;
      }
   }
}
ContractInfo.propTypes = {
   board: PropTypes.instanceOf(Data.BridgeBoard).isRequired
};

class SessionBoard extends Component {
   static propTypes = {
      board: PropTypes.instanceOf(Data.BridgeBoard).isRequired,
      publisher: PropTypes.instanceOf(Data.BridgeBoardSet).isRequired,
      rowNum: PropTypes.number.isRequired
   };

   render() {
      let rowClass;
      let cellClass;
      if (this.props.rowNum % 2) {
         rowClass = "tableRow odd";
         cellClass = "tableCell oddCell";
      } else {
         rowClass = "tableRow even";
         cellClass = "tableCell evenCell";
      }
      let key = this.props.rowNum + this.props.publisher.team;
      return (
         <tr className={rowClass} key={key}>
            <td className={cellClass}>
               {this.props.publisher.team} ({this.props.publisher.dirString()})
            </td>
            <td className={cellClass}>
               <ContractInfo board={this.props.board} />
            </td>
         </tr>
      );
   }
}

class SessionBoardResults extends Component {
   static propTypes = {
      boardResults: PropTypes.instanceOf(BoardResults).isRequired,
      publisherArray: PropTypes.array.isRequired
   };

   render() {
      let imps = this.props.boardResults.imps;
      let impStr = "-";
      let impId = "noTeamSpecified";
      for (let i = 0; i < imps.length; ++i) {
         if (imps[i] !== 0) {
            impId = teamIndexElementId(i);
            impStr = imps[i] + " IMP";
            break;
         }
      }
      return React.Children.toArray([
         <tr className="bold large tableRow" key="boardNum">
            <td className="tableCell tableCellBreak">
               Board {this.props.boardResults.boards[0].boardNumber}:
            </td>
            <td className="tableCell tableCellBreak" id={impId}>
               {impStr}
            </td>
         </tr>,
         <SessionBoard
            key={0}
            rowNum={0}
            board={this.props.boardResults.boards[0]}
            publisher={this.props.publisherArray[0]}
         />,
         <SessionBoard
            key={1}
            rowNum={1}
            board={this.props.boardResults.boards[1]}
            publisher={this.props.publisherArray[1]}
         />
      ]);
   }
}

class SessionSummaryLine extends Component {
   static propTypes = {
      imps: PropTypes.number.isRequired,
      teamName: PropTypes.array.isRequired,
      teamIndex: PropTypes.number.isRequired
   };

   render() {
      let teamName =
         this.props.teamName.length > 0
            ? this.props.teamName.join(", ")
            : "(opponents)";
      let impId = teamIndexElementId(this.props.teamIndex);
      return (
         <tr className="tableRow">
            <td className="tableCell">{teamName}</td>
            <td className="bold large tableCell" id={impId}>
               {this.props.imps} IMP
            </td>
         </tr>
      );
   }
}

const SessionSummary = props => (
   <table className="table">
      <tbody className="tableBody">
         <tr className="tableRow">
            <td className="bold large tableCell tableCellBreak" colSpan="2">
               Score Summary:
            </td>
         </tr>
         {props.impResults.teams.map((teamName, index) => {
            return (
               <SessionSummaryLine
                  key={index}
                  teamName={teamName}
                  imps={props.impResults.imps[index]}
                  teamIndex={index}
               />
            );
         })}
      </tbody>
   </table>
);

SessionSummary.propTypes = {
   impResults: PropTypes.instanceOf(ImpResults).isRequired
};

class SessionBoards extends Component {
   static propTypes = {
      boards: PropTypes.instanceOf(Data.SessionBoardSets)
   };

   render() {
      if (!this.props.boards) {
         return "";
      } else {
         let teamRes = new TeamResults(this.props.boards);
         let scores = teamRes.sessionScore();
         if (!scores.valid) {
            return (
               <span>
                  <CardText>
                     <div className="bold large">No results to display</div>
                     {this.props.boards.boardSets.map(b => {
                        return (
                           <div key={b._id}>
                              <div>{JSON.stringify(b)}</div>
                           </div>
                        );
                     })}
                  </CardText>
               </span>
            );
         }
         return (
            <CardText>
               <SessionSummary impResults={scores.imps} />
               <table className="table">
                  <tbody className="tableBody">
                     {[...scores.imps.boards.keys()].sort().map(bn => {
                        return (
                           <SessionBoardResults
                              key={bn}
                              boardResults={scores.imps.boards.get(bn)}
                              publisherArray={scores.publisher}
                           />
                        );
                     })}
                  </tbody>
               </table>
            </CardText>
         );
      }
   }
}

class SessionBoardsContainer extends Component {
   state = {
      boards: null,
      sessionId: null
   };

   static propTypes = {
      session: PropTypes.object.isRequired
   };

   loadBoards(sessionId) {
      this.setState({ sessionId: sessionId });
      getBoards(sessionId).end((err, res) => {
         if (err) {
            alert(err.message);
         } else {
            this.setState({
               boards: new Data.SessionBoardSets(res.body.BoardSets)
            });
         }
      });
   }

   componentDidMount() {
      this.loadBoards(this.props.session.Id);
   }

   componentWillReceiveProps(nextProps) {
      let sessionId = nextProps.session.Id;
      if (sessionId !== this.state.sessionId) {
         this.loadBoards(nextProps.session.Id);
      }
   }

   render() {
      return <SessionBoards boards={this.state.boards} />;
   }
}

class SessionCard extends Component {
   static propTypes = {
      session: PropTypes.object
   };

   render() {
      if (this.props.session) {
         return (
            <Card>
               <CardTitle
                  title={this.props.session.Name}
                  subtitle={this.props.session.dateString()}
               />
               <SessionBoardsContainer session={this.props.session} />
            </Card>
         );
      } else {
         return <Card />;
      }
   }
}

class SessionCardContainer extends Component {
   static propTypes = {
      session: PropTypes.instanceOf(Data.BridgeSession),
      sessions: PropTypes.instanceOf(Map),
      match: PropTypes.object
   };

   render() {
      let session;
      if (!this.props.session && !this.props.sessions) {
         session = null;
      } else {
         if (this.props.match.params.sessionId) {
            let sessionId = Number(this.props.match.params.sessionId);
            session = this.props.sessions.get(sessionId);
         } else if (this.props.session) {
            session = this.props.session;
         } else if (this.props.sessions) {
            session = this.props.sessions.values().next().value;
         }
      }
      return <SessionCard session={session} />;
   }
}

class AppMain extends Component {
   state = {
      open: false,
      session: null,
      sessions: null
   };

   onLeft = () => this.setState({ open: !this.state.open });
   onRight = () => {};

   onSessions = sessionArray => {
      let sessionMap = new Map(sessionArray.map(s => [s.Id, s]));
      this.setState({ sessions: sessionMap });
   };

   onSelection = sessionObj => {
      this.setState({ open: false, session: sessionObj });
   };

   render() {
      return (
         <HashRouter>
            <div>
               <AppBar
                  onLeft={this.onLeft}
                  onRight={this.onRight}
                  homeLink={<Link to="/" replace />}
                  title="Bridge Scores"
               />
               <Drawer
                  docked={false}
                  open={this.state.open}
                  onRequestChange={open => this.setState({ open })}
               >
                  <SessionListContainer
                     onSessions={this.onSessions}
                     onSelection={this.onSelection}
                  />
               </Drawer>
               <Route
                  path="/session/:sessionId"
                  render={routeProps => (
                     <SessionCardContainer
                        {...routeProps}
                        sessions={this.state.sessions}
                     />
                  )}
               />
               <Route
                  exact
                  path="/"
                  render={routeProps => (
                     <SessionCardContainer
                        {...routeProps}
                        session={this.state.session}
                        sessions={this.state.sessions}
                     />
                  )}
               />
            </div>
         </HashRouter>
      );
   }
}

class App extends Component {
   render() {
      let useDark = false;
      let theme = useDark ? darkBaseTheme : lightBaseTheme;
      return (
         <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
            <AppMain />
         </MuiThemeProvider>
      );
   }
}

export default App;
