import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { DatePicker } from 'antd';
import 'antd/lib/date-picker/style/index.css';
import moment from 'moment';
import 'moment/locale/en-GB';
import { App } from './App.js'

moment.locale('en-GB');

export default class DateRange extends React.Component {
  state = {
    startValue: null,
    endValue: null,
    endOpen: false,
  };

  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  onStartChange = (value) => {
    this.onChange('startValue', value);
    this.props.setStartValue(value);
  }

  onEndChange = (value) => {
    this.onChange('endValue', value);
    this.props.setEndValue(value);
  }

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  }

  clearInput() {
    ReactDOM.findDOMNode(this.refs.startValue).value = '';
    //ReactDOM.findDOMNode(this.refs.endValue).value = '';
  }

  render() {
    const { startValue, endValue, endOpen } = this.state;
    let format="DD/MM/YYYY";
    return (
      <div className="new-task">
        <DatePicker
          className="ant-calendar"
          disabledDate={this.disabledStartDate}
          format={format}
          value={startValue}
          placeholder="Start"
          onChange={this.onStartChange}
          onOpenChange={this.handleStartOpenChange}
          showToday
          ref="startValue"
        />
      <DatePicker
          className="ant-calendar"
          disabledDate={this.disabledEndDate}
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
}
