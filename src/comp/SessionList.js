import React, { Component } from 'react';
import PropTypes from 'prop-types';
import request from "superagent";
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import { SessionObject } from '../model/Data';

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
         if ( this.props.onChange ) {
            this.props.onChange( event, index );
         }
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

class SessionList extends Component {
   handleChange = ( event, index ) => {
      if ( this.props.setSelected ) {
         this.props.setSelected( index );
      }
   };

   render() {
      return (
         <SelectableList
             onChange={this.handleChange}
             defaultValue={this.props.sessions.length ? this.props.sessions[0].Id : 0} >
            <Subheader>Session List</Subheader>
            {this.props.sessions.map( s => {
             return (
                React.Children.toArray([
                   <Divider />,
                   <ListItem key={s.Id} value={s.Id} primaryText={s.Name} secondaryText={s.dateString()} />
                ])
             )
            })}
         </SelectableList>
      );
   }
}

const SessionHeader = (props) => (
   <div>
      Selection: {props.selected}
   </div>
);

class SessionListContainer extends Component {
   state = {
      sessions: [],
      selected: null,
      error: null,
   };

   setSelected = (sessionId) => {
      this.setState( { selected: sessionId } );
   }

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
         return (
            <div>
            <SessionHeader selected={this.state.selected} />
            <SessionList sessions={this.state.sessions} setSelected={this.setSelected}/>;
            </div>
         );
      }
   }
}

export default SessionListContainer;
