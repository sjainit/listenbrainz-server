import { faChevronDown, faChevronUp, faPlusCircle, faSave, faSitemap, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import {getArtistLink, getPlayButton, getTrackLink} from './utils.jsx';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import {isNil as _isNil} from 'lodash';

export class FollowUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: props.followList || [],
      saveUrl: props.saveUrl || window.location.origin + "/1/follow/save",
      listId: props.listId,
      listName: props.listName,
    }
    this.addUserToList = this.addUserToList.bind(this);
    this.addFollowerOnEnter = this.addFollowerOnEnter.bind(this);
    this.saveListOnEnter = this.saveListOnEnter.bind(this);
  }

  addUserToList(event) {
    event.preventDefault();
    if (this.textInput.value === "" ||
      this.state.users.find(user => user === this.textInput.value))
    {
      return;
    }
    this.setState(prevState => {
      return { users: prevState.users.concat([this.textInput.value]) }
    }, () => {
      this.textInput.value = "";
      this.props.onUserListChange(this.state.users);
    });
  }

  removeUserFromList(index) {
    this.setState(prevState => {
      prevState.users.splice(index, 1);
      return { users: prevState.users }
    }, () => { this.props.onUserListChange(this.state.users) });
  }

  saveFollowList(event) {
    var listName = this.state.listName;
    if (!_isNil(this.nameInput.value) && this.nameInput.value.length) {
      listName = this.nameInput.value;
    }
    fetch(this.state.saveUrl, {
      method: "POST",
      body: JSON.stringify({
        "users": this.state.users,
        "name": listName,
        "id": this.state.listId,
      }),
      headers: {"Authorization": "Token " + this.props.creator.auth_token},
    })
    .then(response => {
        if (!response.ok) {
          this.props.newAlert('danger', 'Could not save list', response.statusText);
          return;
        }
        this.props.newAlert('success', 'Successfully saved list');
        return response.json();
    })
    .then(data => {
      console.debug(data);
      console.debug("old List ID: " + this.state.listId);
      this.setState(prevState => {
        return {listId: data.list_id};
      }, () => {
          console.debug("new List ID: " + this.state.listId);
      });
    })
    .catch(error => {
      console.error(error);
      this.props.newAlert('danger', 'Could not save list', error.message);
    });
  }

  newFollowList(event) {
    this.setState(prevState => {
      return {
        users: [],
        listId: null,
        listName: null
     };
    });
    this.nameInput.value = null;
  }

  addFollowerOnEnter(event) {
    if(event.key === "Enter") {
      this.addUserToList(event);
    }
  }

  saveListOnEnter(event) {
    if(event.key === "Enter") {
      this.saveFollowList(event);
    }
  }

  render() {
    const noTopBottomPadding = {
      paddingTop: 0,
      paddingBottom: 0
    };
    return (
      <div className="panel panel-primary">
        <div className="panel-heading">
          <FontAwesomeIcon icon={faSitemap} flip="vertical"/>
          <span style={{fontSize: "x-large", marginLeft: "0.55em", verticalAign: "middle" }}>
            Follow users
          </span>
        </div>
        <div className="panel-body">
            <p className="text-muted">
              Add a user to discover what they are listening to:
            </p>
            <div className="row">
              <div className="col-sm-6">
                <div className="input-group input-group-flex">
                  <span className="input-group-addon">Follow user</span>
                  <input type="text" className="form-control" placeholder="Username…"
                    ref={(input) => this.textInput = input}
                    onKeyPress={this.addFollowerOnEnter}
                  />
                  <span className="input-group-btn">
                    <button className="btn btn-primary" type="button" onClick={this.addUserToList}>
                      <FontAwesomeIcon icon={faPlusCircle}/> Add
                    </button>
                  </span>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="input-group input-group-flex">
                  <span className="input-group-addon">Save list</span>
                  <input type="text" className="form-control" defaultValue={this.state.listName} placeholder="New list name" ref={(input) => this.nameInput = input} 
                    onKeyPress={this.saveListOnEnter}
                  />
                  <div className="input-group-btn">
                    <button className="btn btn-primary" type="button" onClick={this.saveFollowList.bind(this)}>
                        <FontAwesomeIcon icon={faSave}/> Save
                      </button>
                    <button className="btn btn-danger" type="button" onClick={this.newFollowList.bind(this)}>
                      <FontAwesomeIcon icon={faTimes}/> Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <hr/>
            <table className="table table-condensed table-striped listens-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Listening now</th>
                  <th width="50px"></th>
                  <th width="65px"></th>
                </tr>
              </thead>
              <tbody>
                {this.state.users.map((user, index) => {
                  return (
                    <tr key={user} className={this.props.playingNow[user] && "playing_now"} onDoubleClick={this.props.playListen.bind(this, this.props.playingNow[user])}>
                      <td>
                        {user}
                      </td>
                      <td>
                        {this.props.playingNow[user] &&
                          <React.Fragment>
                            {getTrackLink(this.props.playingNow[user])}
                            <span className="small"> — {getArtistLink(this.props.playingNow[user])}</span>
                          </React.Fragment>
                        }
                      </td>
                      <td className="playButton">
                        {this.props.playingNow[user] &&
                          getPlayButton(this.props.playingNow[user], this.props.playListen.bind(this, this.props.playingNow[user]))
                        }
                      </td>
                      <td style={noTopBottomPadding}>
                        <button className="btn btn-danger" type="button" aria-label="Remove"
                          onClick={this.removeUserFromList.bind(this, index)}>
                          <FontAwesomeIcon icon={faTrashAlt}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      </div>
    );
  }

}
