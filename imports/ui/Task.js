import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';
import Modal from 'react-responsive-modal';
import RangePicker from './DateRange.js';

import { Tasks } from '../api/tasks.js';

// Task component - represents a single todo item
export default class Task extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.editTaskRender = this.editTaskRender.bind(this);

    this.state = {
      startValue:null,
      endValue: null,
      openModal: false,
    };
  }

  toggleChecked() {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  deleteThisTask() {
    Meteor.call('tasks.remove', this.props.task._id);
  }

  onOpenModal = () => {
    this.setState({ openModal: true });
  };

  onCloseModal = () => {
    this.setState({ openModal: false });
  };

  editThisTask() {
    this.onOpenModal();
    this.editTaskRender();
  };

  handleSubmit(event) {
    event.preventDefault();

    this.onCloseModal();
  }

  editTaskRender() {
    const { openModal } = this.state;
    //this.onOpenModal();
    return (
      <div>
        <Modal open={openModal} onClose={this.onCloseModal} center>
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
              <RangePicker setStartValue={this.setStartValue} setEndValue={this.setEndValue}></RangePicker>
              */}
          <RangePicker ref="dateInput" ></RangePicker>
          </div>
          <div>
            <input type="submit" value="edit"/>
          </div>
        </form> : ''
        </Modal>
      </div>
    );
  }

  render() {
    // Give tasks a different className when they are checked off,
    // so that we can style them nicely in CSS
    const taskClassName = classnames({
      checked: this.props.task.checked,
    });
    let options = { weekday: 'short', year: 'numeric', month: '2-digit', day: 'numeric' };

    return (
      <li className={taskClassName}>
        <button className="delete" onClick={this.deleteThisTask.bind(this)}>
          &times;
        </button>

        <input
          type="checkbox"
          readOnly
          checked={!!this.props.task.checked}
          onClick={this.toggleChecked.bind(this)}
        />

      <span className="text" onClick={this.editThisTask.bind(this)}>
          {this.props.task.text}
        </span>
        <span className="text" onClick={this.editThisTask.bind(this)}>
          <strong>{this.props.task.startValue.toLocaleDateString('en-GB', options)}</strong>
        </span>
      </li>
    );
  }
}
