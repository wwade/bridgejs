import React, { Component } from 'react';
import './App.css';
import AppBar from './ui/AppBar';
import Drawer from 'material-ui/Drawer';
import {Card, CardText, CardTitle} from 'material-ui/Card';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import SessionListContainer from "./comp/SessionList";
import request from "superagent";
import {List, ListItem} from 'material-ui/List';

class SessionBoards extends Component {
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
   }

   loadBoards(sessionId) {
      this.setState({sessionId: sessionId});
      request.get("http://192.168.0.16/boards?sessionId=" + sessionId).end((err, res) => {
         this.setState({boards: res.body.BoardSets});
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
      return <SessionBoards boards={this.state.boards} />
   }
}

class SessionCard extends Component {
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
         return "Select a session";
      }
   }
}

class AppMain extends Component {
   state = {
      open: true,
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
