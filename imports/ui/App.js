import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import AccountsUIWrapper from './AccountsUIWrapper.js';
import {Tasks} from '../api/tasks.js';
import Task from './Task.js';
import Modal from 'react-responsive-modal';
import {Button, Calendar, DatePicker} from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import 'moment/locale/en-GB';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      //App fields
      hideCompleted: false,
      inputValue: 'add',
      taskId: '',
      textValue: '',

      //Modal fields
      openModal: false,

      //Date Picker fields
      startValue: moment(),
      endValue: moment(),
      DateReadOnly: false,
      endOpen: false,
      lockDate: false,
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    const {startValue, endValue, taskId} = this.state;

    if (taskId === '') {
      Meteor.call('tasks.insert', text, new Date(startValue), new Date(endValue));
    } else {
      Meteor.call('tasks.update', taskId, text);
    }

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
    this.onCloseModal();
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  setStartValue = (value) => {
    this.setState({startValue: value})
  };

  setEndValue = (value) => {
    this.setState({endValue: value})
  };

  onOpenModal = () => {
    this.setState({openModal: true});
    this.resetFields();
  };

  onCloseModal = () => {
    this.setState({openModal: false});
  };

  resetFields = () => {
    this.setState({inputValue: 'add'});
    this.setState({taskId: ''});
    this.setState({textValue: ''});
    this.setState({startValue: moment()});
    this.setState({endValue: moment()});
    this.setState({DateReadOnly: false});
  };

  editThisTask = (taskId) => {
    this.setState({taskId: taskId});
    const currTask = Tasks.findOne(taskId);
    this.setState({inputValue: 'edit'});
    this.setState({textValue: currTask.text});
    this.setState({startValue: currTask.startValue});
    this.setState({endValue: currTask.endValue});
    this.setState({DateReadOnly: true});
    this.setState({openModal: true});
  };

  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    const lockDate = this.state.lockDate;

    if (!lockDate) {
      return false;
    }
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = (endValue) => {
    //Setting the time at startValue 00:00:00 to be able to select the end date the same day as the start day
    const startValue = this.state.startValue.set({'hour': 0, 'minute': 0, 'second': 0});

    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  onStartChange = (value) => {
    this.setState({lockDate: true});
    this.setState({startValue: value});
  };

  onEndChange = (value) => {
    this.setState({endValue: value});
  };

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({endOpen: true});
    }
  };

  handleEndOpenChange = (open) => {
    this.setState({endOpen: open});
  };


  addTaskRender() {
    const {openModal, textValue, inputValue} = this.state;
    return (
      <div>
        <br/>
        <Button onClick={this.onOpenModal} size="small">Add a Task</Button>
        <Modal open={openModal} onClose={this.onCloseModal} centre>
          {this.props.currentUser ?
            <form className="new-task" onSubmit={this.handleSubmit}>
              <label>
                <input
                  type="text"
                  ref="textInput"
                  placeholder="Type to add new tasks"
                  defaultValue={textValue}
                  required
                />
              </label>
              <div>
                {this.DatePickerRender()}
              </div>
              <div>
                <input type="submit" value={inputValue}/>
              </div>
            </form> : ''
          }
        </Modal>
      </div>
    );
  }

  tasksRender() {
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

  DatePickerRender() {
    const startValue = moment(this.state.startValue);
    const endValue = moment(this.state.endValue);
    const {endOpen, DateReadOnly} = this.state;
    const format = "DD/MM/YYYY";

    return (
      <div className="new-task">
        <DatePicker
          className="ant-calendar"
          disabledDate={this.disabledStartDate}
          disabled={DateReadOnly}
          format={format}
          value={startValue}
          placeholder="Start"
          onChange={this.onStartChange}
          onOpenChange={this.handleStartOpenChange}
          showToday
          ref="startValue"
          newStartChange={this.newStartChange}
        />
        <DatePicker
          className="ant-calendar"
          disabledDate={this.disabledEndDate}
          disabled={DateReadOnly}
          format={format}
          value={endValue}
          placeholder="End"
          onChange={this.onEndChange}
          open={endOpen}
          onOpenChange={this.handleEndOpenChange}
          showToday
          ref="endValue"
        />
      </div>
    );
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
          <AccountsUIWrapper/>
          {this.addTaskRender()}
        </header>

        <ul>
          {this.tasksRender()}
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
    tasks: Tasks.find({}, {sort: {startValue: 1, text: 1}}).fetch(),
    incompleteCount: Tasks.find({checked: {$ne: true}}).count(),
    currentUser: Meteor.user(),
  };
})(App);
