import * as Data from "./model/Data";
import { BoardResults, TeamResults } from "./bridge/Results";
import { Card, CardText, CardTitle } from "material-ui/Card";
import { Component } from "react";
import { HashRouter, Link, Route } from "react-router-dom";
import { Table, TableBody, TableRow, TableRowColumn } from "material-ui/Table";
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

class ContractInfo extends Component {
   static propTypes = {
      board: PropTypes.instanceOf(Data.BridgeBoard).isRequired
   };

   trickString(relTricks) {
      if (!relTricks) {
         return "making";
      } else {
         if (relTricks > 0) {
            return "plus " + relTricks;
         } else {
            return "down " + relTricks;
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
         return (
            <span>
               {b.level}
               {suitIcon(b.suit)}
               {xStr} by {b.declarer}
               {", "}
               {this.trickString(b.relativeTricks())} ({b.score()})
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

const SessionBoard = props => (
   <div>
      <div>
         {props.imps} IMPS for {props.team.team}
      </div>
      <div>
         <ContractInfo board={props.board} />
      </div>
   </div>
);
SessionBoard.propTypes = {
   board: PropTypes.instanceOf(Data.BridgeBoard).isRequired,
   imps: PropTypes.number.isRequired,
   team: PropTypes.instanceOf(Data.BridgeBoardSet).isRequired
};

const SessionBoardResults = props => (
   <div>
      <div>Board {props.boardResults.boardNum}</div>
      <SessionBoard
         key={0}
         board={props.boardResults.boards[0]}
         imps={props.boardResults.imps[0]}
         team={props.team1}
      />
      <SessionBoard
         key={1}
         board={props.boardResults.boards[1]}
         imps={props.boardResults.imps[1]}
         team={props.team2}
      />
   </div>
);

SessionBoardResults.propTypes = {
   boardResults: PropTypes.instanceOf(BoardResults).isRequired,
   team1: PropTypes.instanceOf(Data.BridgeBoardSet),
   team2: PropTypes.instanceOf(Data.BridgeBoardSet)
};

const SessionSummaryLine = props => (
   <div>
      Team {props.num} ({props.direction}): {props.team}, IMPs: {props.imps}
   </div>
);
SessionSummaryLine.propTypes = {
   direction: PropTypes.string.isRequired,
   imps: PropTypes.number.isRequired,
   num: PropTypes.number.isRequired,
   team: PropTypes.string.isRequired
};

const SessionSummary = props => (
   <span>
      <SessionSummaryLine
         num={1}
         direction={props.scores.team1.dirString()}
         team={props.scores.team1.team}
         imps={props.scores.imps.imps1}
      />
      <SessionSummaryLine
         num={2}
         direction={props.scores.team1.dirString()}
         team={props.scores.team2.team}
         imps={props.scores.imps.imps2}
      />
   </span>
);

SessionSummary.propTypes = {
   scores: PropTypes.object.isRequired
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
            return "";
         }
         return React.Children.toArray([
            <CardText key="sessionInfo">
               <SessionSummary scores={scores} />
            </CardText>,
            <CardText key="boardResults">
               {[...scores.imps.boards.keys()].sort().map(bn => {
                  let board = scores.imps.boards.get(bn);
                  return (
                     <SessionBoardResults
                        key={bn}
                        team1={scores.team1}
                        team2={scores.team2}
                        boardResults={board}
                     />
                  );
               })}
            </CardText>
         ]);
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
