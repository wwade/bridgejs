import React, { Component } from 'react';
import './App.css';
import AppBar from './ui/AppBar';
import Drawer from 'material-ui/Drawer';
import {Card, CardText, CardTitle} from 'material-ui/Card';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import SessionListContainer from "./comp/SessionList";

class SessionCard extends Component {
   render() {
      if ( this.props.session ) {
         return (
         <Card>
            <CardTitle title={this.props.session.Name} />
            <CardText>
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
            <Drawer open={this.state.open}>
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
