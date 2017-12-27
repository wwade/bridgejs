import React, { Component } from "react";
import "./App.css";
import AppBar from "./ui/AppBar";
import Drawer from "material-ui/Drawer";
import {Card, CardText, CardTitle} from "material-ui/Card";
import lightBaseTheme from "material-ui/styles/baseThemes/lightBaseTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import SessionListContainer from "./comp/SessionList";
import {List, ListItem} from "material-ui/List";
import {getBoards} from "./api";
import PropTypes from "prop-types";

class SessionBoards extends Component {
   static propTypes = {
      boards: PropTypes.array
   };

   render() {
      if (!this.props.boards) {
         return "";
      } else {
         return (
            <List>
            {this.props.boards.map( (b, index ) => {
               return (
                  <ListItem key={index} value={index} primaryText={b.Team} />
               );
            })}
            </List>
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
      session: PropTypes.object.isRequired,
   };

   loadBoards(sessionId) {
      this.setState({sessionId: sessionId});
      getBoards(sessionId).end((err, res) => {
         if ( err ) {
            alert( err.message );
         } else {
            this.setState({boards: res.body.BoardSets});
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
      session: PropTypes.object.isRequired,
   };

   render() {
      if ( this.props.session ) {
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
         return (
         <Card>
            <CardTitle title="No session selected" />
         </Card>
         );
      }
   }
}

class AppMain extends Component {
   state = {
      open: false,
      session: null,
   };

   onLeft = () => this.setState({ open: !this.state.open});

   onSelection = ( sessionObj) => {
      this.setState({ open: false, session: sessionObj });
   }

   render() {
      return (
         <div>
            <AppBar
               onLeft={this.onLeft}
               title="Bridge Scores" />
            <Drawer
               docked={false}
               open={this.state.open}
               onRequestChange={(open) => this.setState({open})}
            >
               <SessionListContainer onSelection={this.onSelection}/>
            </Drawer>
            <SessionCard session={this.state.session} />
         </div>
      );
   }
}

const App = () => (
   <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
   <AppMain />
   </MuiThemeProvider>
);

export default App;
