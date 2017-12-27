import { Card, CardTitle } from "material-ui/Card";
import { List, ListItem, makeSelectable } from "material-ui/List";
import React, { Component } from "react";
import { SessionObject } from "../model/Data";
import { getSessions } from "../api";
import Divider from "material-ui/Divider";
import PropTypes from "prop-types";
import Subheader from "material-ui/Subheader";

let SelectableList = makeSelectable(List);

function wrapState(ComposedComponent) {
   return class SelectableList extends Component {
      static propTypes = {
         children: PropTypes.node.isRequired,
         defaultValue: PropTypes.number.isRequired,
         onChange: PropTypes.func
      };

      componentWillMount() {
         this.setState({
            selectedIndex: this.props.defaultValue
         });
      }

      handleRequestChange = (event, index) => {
         this.setState({
            selectedIndex: index
         });
         if (this.props.onChange) {
            this.props.onChange(event, index);
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
   static propTypes = {
      setSelected: PropTypes.func,
      sessions: PropTypes.array.isRequired,
      defaultValue: PropTypes.number
   };

   handleChange = (event, index) => {
      if (this.props.setSelected) {
         this.props.setSelected(index);
      }
   };

   render() {
      if (this.props.sessions) {
         return (
            <SelectableList
               onChange={this.handleChange}
               defaultValue={this.props.defaultValue}
            >
               <Subheader>Session List</Subheader>
               {this.props.sessions.map((s, index) => {
                  return React.Children.toArray([
                     <Divider key={index} />,
                     <ListItem
                        key={index}
                        value={index}
                        primaryText={s.Name}
                        secondaryText={s.dateString()}
                     />
                  ]);
               })}
            </SelectableList>
         );
      } else {
         return (
            <Card>
               <CardTitle title="No sessions" />
            </Card>
         );
      }
   }
}

class SessionListContainer extends Component {
   state = {
      sessions: [],
      selected: null
   };

   static propTypes = {
      onSelection: PropTypes.func.isRequired
   };

   setSelected = index => {
      let selected = this.state.sessions[index];
      this.setState({ selected: selected });
      this.props.onSelection(selected);
   };

   loadSessions() {
      getSessions().end((err, res) => {
         if (err) {
            alert(err.message);
            this.setState({ sessions: [] });
         } else {
            let sessions = Array.from(res.body.Sessions)
               .map(s => new SessionObject(s))
               .sort((a, b) => {
                  return a.compare(b);
               });
            this.setState({ sessions: sessions, error: null });
            this.setSelected(0);
         }
      });
   }

   componentDidMount() {
      this.loadSessions();
   }

   render() {
      if (this.state.error) {
         return <p>{this.state.error}</p>;
      } else {
         return (
            <div>
               <SessionList
                  sessions={this.state.sessions}
                  defaultValue={0}
                  setSelected={this.setSelected}
               />
            </div>
         );
      }
   }
}

export default SessionListContainer;
