import React from 'react';
import AppBar from 'material-ui/AppBar';

const Main = (props) => (
   <AppBar
    onLeftIconButtonClick={props.onLeft}
    title={props.title} />
);

export default Main;
