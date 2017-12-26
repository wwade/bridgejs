import React, { Component } from 'react';
import PropTypes from 'prop-types';
import request from "superagent";
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';

let SelectableList = makeSelectable(List);

function wrapState(ComposedComponent) {
   return class SelectableList extends Component {
      static propTypes = {
         children: PropTypes.node.isRequired,
         defaultValue: PropTypes.number.isRequired
      };

      componentWillMount() {
         this.setState({
            selectedIndex: this.props.defaultValue,
         });
      }

      handleRequestChange = ( event, index ) => {
         this.setState({
            selectedIndex: index,
         });
      };

      render() {
         return (
            <ComposedComponent
               value={this.state.selectedIndex}
               onChange={this.handleRequestChange}
            >
               {this.props.children}
            </ComposedComponent>
         );
      }
   };
}

SelectableList = wrapState(SelectableList);

class SessionObject {
   constructor( jSess ) {
      this.Id = jSess.Id;
      this.Timestamp = jSess.Timestamp;
      this.Name = jSess.Name;
      this.date = new Date( this.Timestamp );
   }

   compare(other) {
      return other.Timestamp - this.Timestamp;
   }

   dateString() {
      let date = new Date( this.Timestamp );
      return date.toUTCString()
   }
}

class SessionList extends Component {
   render() {
      return (
         <SelectableList defaultValue={this.props.sessions.length ? this.props.sessions[0].Id : 0} >
            <Subheader>Session List</Subheader>
         </SelectableList>
            //{ this.props.sessions.map( s =>
            //   <ListItem
            //      key={s.Id}
            //      value={s.Id}
            //      primaryText={s.Name}
            //      secondaryText={s.dateString()}
            //   />
            //   <Divider />
            //  )}
      );
   }
}

class SessionListContainer extends Component {
   state = {
      sessions: [],
      error: null,
   };

   loadSessions() {
      request.get("http://192.168.0.16/sessions").end((err, res) => {
         if ( err ) {
            this.setState( { sessions: [], error: err.message } );
         } else {
            let sessions =
               Array
                  .from(res.body.Sessions)
                  .map( s => (new SessionObject(s)))
                  .sort((a, b) => {return a.compare(b);});
            this.setState( { sessions: sessions, error: null } );
         }
      });
   }

   componentDidMount() {
      this.loadSessions();
   }

   render() {
      if ( this.state.error ) {
         return <p>{this.state.error}</p>;
      } else {
         return <SessionList sessions={this.state.sessions} />;
      }
   }
}

export default SessionListContainer;
