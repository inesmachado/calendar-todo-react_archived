import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    // This code only runs on the server
    // Only publish tasks that are public or belong to the current user

    Meteor.publish('tasks', function tasksPublication() {
        return Tasks.find({owner: this.userId});
    });
}

Meteor.methods({
    'tasks.insert'(text, startValue) {
        check(text, String);
        check(startValue, Date);

        // Make sure the user is logged in before inserting a task
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.insert({
            text,
            createdAt: new Date(),
            startValue: new Date(startValue),

            owner: this.userId,
            username: Meteor.users.findOne(this.userId).username,
        });
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
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { text: newText } });
    },
});
