import React from "react";
import AppBar from "material-ui/AppBar";
import PropTypes from "prop-types";

const Main = (props) => (
   <AppBar
    onLeftIconButtonClick={props.onLeft}
    title={props.title} />
);

Main.propTypes = {
   onLeft: PropTypes.func.isRequired,
   title: PropTypes.string.isRequired
};

export default Main;
