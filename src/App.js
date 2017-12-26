import React from 'react';
import './App.css';
import AppBar from './ui/AppBar';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import SessionListContainer from "./comp/SessionList";

const AppMain = () => (
   <div>
   <AppBar title="Bridge Scores" />
   <SessionListContainer />
   </div>
);

const App = () => (
   <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
   <AppMain />
   </MuiThemeProvider>
);

export default App;
