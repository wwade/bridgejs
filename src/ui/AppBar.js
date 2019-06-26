import ActionHome from "material-ui/svg-icons/action/home";
import AppBar from "material-ui/AppBar";
import IconButton from "material-ui/IconButton";
import PropTypes from "prop-types";
import React from "react";

const Main = props => (
   <AppBar
      onLeftIconButtonClick={props.onLeft}
      onRightIconButtonClick={props.onRight}
      iconElementRight={
         <IconButton containerElement={props.homeLink}>
            <ActionHome />
         </IconButton>
      }
      title={props.title}
   />
);

Main.propTypes = {
   onLeft: PropTypes.func.isRequired,
   onRight: PropTypes.func.isRequired,
   homeLink: PropTypes.object.isRequired,
   title: PropTypes.string.isRequired
};

export default Main;
