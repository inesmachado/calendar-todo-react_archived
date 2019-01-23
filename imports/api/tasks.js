import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';
import moment from 'moment';
import 'moment/locale/en-GB';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    Meteor.publish('tasks', function tasksPublication() {
        return Tasks.find({owner: this.userId});
    });
}

Meteor.methods({
    'tasks.insert'(text, startValue, endValue) {
        check(text, String);
        check(startValue, Date);
        check(endValue, Date);
        const groupId = new Meteor.Collection.ObjectID().valueOf();
        let displayDate = new moment(startValue);

        // Make sure the user is logged in before inserting a task
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

       while (displayDate.isBetween(moment(startValue).subtract(1, 'days'), moment(endValue))){
           Tasks.insert({
                _groupId: groupId,
                text: text,
                createdAt: new Date(),
                startValue: new Date(startValue),
                endValue: new Date(endValue),
                displayDate: new Date(displayDate),
                owner: this.userId,
                username: Meteor.users.findOne(this.userId).username,
            });

            displayDate = displayDate.add(1, 'days');
        }
    },
    'tasks.remove'(taskId) {
        check(taskId, String);

        const task = Tasks.findOne(taskId);
        if (task.owner !== this.userId) {
            // If the task is private, make sure only the owner can delete it
            throw new Meteor.Error('not-authorized');
        }

        Tasks.remove(taskId);
    },
    'tasks.setChecked'(taskId, setChecked) {
        check(taskId, String);
        check(setChecked, Boolean);

        const task = Tasks.findOne(taskId);
        if (task.owner !== this.userId) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, {$set: {checked: setChecked}});
    },
    'tasks.update'(taskId, newText) {
        check(taskId, String);
        check(newText, String);

        const task = Tasks.findOne(taskId);
        if (task.owner !== this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        
        Tasks.update({_groupId : task._groupId}, { $set: { text: newText } }, {multi:true});
    },
});
