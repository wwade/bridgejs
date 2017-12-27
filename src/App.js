import { Card, CardText, CardTitle } from "material-ui/Card";
import { Component } from "react";
import { HashRouter, Link, Route } from "react-router-dom";
import { SessionBoardSets, BridgeSession } from "./model/Data";
import { getBoards } from "./api";
import AppBar from "./ui/AppBar";
import Drawer from "material-ui/Drawer";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import PropTypes from "prop-types";
import React from "react";
import SessionListContainer from "./comp/SessionList";
import darkBaseTheme from "material-ui/styles/baseThemes/darkBaseTheme";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import lightBaseTheme from "material-ui/styles/baseThemes/lightBaseTheme";

class SessionBoards extends Component {
   static propTypes = {
      //<<<<       boards: PropTypes.array
   };

   render() {
      if (!this.props.boards) {
         return "";
      } else {
         return "";
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
            this.setState({ boards: new SessionBoardSets(res.body.BoardSets) });
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
               <CardTitle title={this.props.session.Name} />
               <CardText>
                  <SessionBoardsContainer session={this.props.session} />
                  {this.props.session.dateString()}
               </CardText>
            </Card>
         );
      } else {
         return <Card />;
      }
   }
}

class SessionCardContainer extends Component {
   static propTypes = {
      session: PropTypes.instanceOf(BridgeSession),
      sessions: PropTypes.instanceOf(Map),
      match: PropTypes.object
   };

   render() {
      let session;
      if (this.props.sessions && this.props.match.params.sessionId) {
         let sessionId = Number(this.props.match.params.sessionId);
         session = this.props.sessions.get(sessionId);
      } else {
         session = this.props.session;
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
