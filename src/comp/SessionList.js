import { Card, CardTitle } from "material-ui/Card";
import { Link, Route } from "react-router-dom";
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
         defaultValue: PropTypes.number,
         onChange: PropTypes.func
      };

      componentWillMount() {
         this.setState({
            selectedIndex: this.props.defaultValue
         });
      }

      componentWillReceiveProps(nextProps) {
         let cur = this.props.defaultValue;
         let next = nextProps.defaultValue;
         if (cur !== next) {
            this.setState({ selectedIndex: next });
         }
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
                  let uri = "/session/" + s.Id;
                  return React.Children.toArray([
                     <Divider key={s.Id} />,
                     <ListItem
                        key={s.Id}
                        value={s.Id}
                        primaryText={s.Name}
                        secondaryText={s.dateString()}
                        containerElement={<Link to={uri} replace />}
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

class SessionListRoute extends Component {
   static propTypes = {
      match: PropTypes.object.isRequired,
      sessions: PropTypes.array.isRequired,
      setSelected: PropTypes.func.isRequired
   };

   render() {
      let first = this.props.sessions.length ? this.props.sessions[0].Id : null;
      let defaultValue;
      if (this.props.match.params.sessionId) {
         defaultValue = Number(this.props.match.params.sessionId);
      } else {
         defaultValue = first;
      }
      return (
         <SessionList
            sessions={this.props.sessions}
            defaultValue={defaultValue}
            setSelected={this.props.setSelected}
         />
      );
   }
}

class SessionListContainer extends Component {
   state = {
      sessions: [],
      selected: null
   };

   static propTypes = {
      onSelection: PropTypes.func.isRequired,
      onSessions: PropTypes.func.isRequired
   };

   setSelected = index => {
      let selected = this.state.sessions[index];
      this.setState({ selected: selected });
      this.props.onSelection(selected);
   };

   loadSessions() {
      getSessions().end((err, res) => {
         let sessions;
         if (err) {
            alert(err.message);
            sessions = [];
         } else {
            sessions = Array.from(res.body.Sessions)
               .map(s => new SessionObject(s))
               .sort((a, b) => {
                  return a.compare(b);
               });
            this.setState({ sessions: sessions, error: null });
            this.setSelected(0);
         }
         this.setState({ sessions: sessions });
         this.props.onSessions(sessions);
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
               <Route
                  exact
                  path="/"
                  render={routeProps => (
                     <SessionListRoute
                        {...routeProps}
                        sessions={this.state.sessions}
                        setSelected={this.setSelected}
                     />
                  )}
               />
               <Route
                  path="/session/:sessionId"
                  render={routeProps => (
                     <SessionListRoute
                        {...routeProps}
                        sessions={this.state.sessions}
                        setSelected={this.setSelected}
                     />
                  )}
               />
            </div>
         );
      }
   }
}

export default SessionListContainer;
