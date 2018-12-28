import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {DatePicker} from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import 'moment/locale/en-GB';

moment.locale('en-GB');

export default class DateRange extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startValue: moment(),
      endValue: moment(),
      endOpen: false,
      lockDate: false,
    };

  }

  disabledStartDate = (startValue) => {
    const {endValue, lockDate} = this.state;

    if (!lockDate) {
      return false;
    }
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = (endValue) => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = (value) => {
    this.setState({lockDate: true,});
    this.onChange('startValue', value);
    this.props.setStartValue(value);
  };

  onEndChange = (value) => {
    this.onChange('endValue', value);
    this.props.setEndValue(value);
  };

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({endOpen: true});
    }
  };

  handleEndOpenChange = (open) => {
    this.setState({endOpen: open});
  };

  clearInput() {
    ReactDOM.findDOMNode(this.refs.startValue).value = '';
    ReactDOM.findDOMNode(this.refs.endValue).value = '';
  }

  render() {
    const {startValue, endValue, endOpen} = this.state;
    const format = "DD/MM/YYYY";
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
