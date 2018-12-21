import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import AccountsUIWrapper from './AccountsUIWrapper.js';
import Modal from 'react-responsive-modal';
import { Tasks } from '../api/tasks.js';
import Task from './Task.js';
import RangePicker from './DateRange.js';
import { Calendar, Button } from 'antd';
import 'antd/dist/antd.css';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setStartValue = this.setStartValue.bind(this);
    this.setEndValue = this.setEndValue.bind(this);

    this.state = {
      hideCompleted: false,
      startValue:null,
      endValue: null,
      openModal: false,
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    const startValue = this.state.startValue;
    const endValue = this.state.endValue;
    Meteor.call('tasks.insert', text, new Date(startValue));

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
    this.refs.dateInput.clearInput();
    this.onCloseModal();
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  setStartValue = (value) => {
    this.setState({
      startValue: value
    })
  };

  setEndValue = (value) => {
    this.setState({
      endValue: value
    })
  };

  onOpenModal = () => {
    this.setState({ openModal: true });
  };

  onCloseModal = () => {
    this.setState({ openModal: false });
  };

  editThisTask = () => {
    this.setState({ openModal: true });
  };

  addTaskRender() {
    const { openModal } = this.state;
    return (
      <div>
        <br/>
        <Button onClick={this.onOpenModal} size="small">Add a Task</Button>
        <Modal open={openModal} onClose={this.onCloseModal} centre>
          { this.props.currentUser ?
          <form className="new-task" onSubmit={this.handleSubmit} >
            <label>
            <input
              type="text"
              ref="textInput"
              placeholder="Type to add new tasks"
            />
          </label>
          <div>
            {/* required
              */}
          <RangePicker ref="dateInput" setStartValue={this.setStartValue} setEndValue={this.setEndValue}></RangePicker>
          </div>
          <div>
            <input type="submit" value="Add"/>
          </div>
        </form> : ''
      }
        </Modal>
      </div>
    );
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;

      return (
        <Task
          editThisTask={this.editThisTask}
          key={task._id}
          task={task}
        />
      );
    });
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List ({this.props.incompleteCount})</h1>

          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Tasks
          </label>
          <AccountsUIWrapper />
          {this.addTaskRender()}
        </header>

        <ul>
          {this.renderTasks()}
        </ul>
       {/* <div>
          <Calendar/>
        </div>*/}
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, { sort: { startValue: 1 , text: 1} }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
})(App);
