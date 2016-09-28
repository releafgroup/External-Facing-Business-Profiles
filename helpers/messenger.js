exports = module.exports = {};
var username = '';
var moment = require('moment');

var config = require('./../config');
var schedule = require('node-schedule');

var express = require('express');
var path = require('path');
var fs = require('fs');
var dl = require('delivery');
var spanHours = .5;//
var cronString = '59 * * * *';//4 hours// * */4 * * *
var usersOnline = [];
var msgQ = [];
var userSockets = {};
var debug = require('debug')('server:io');
var router = express.Router();
var Message = require('./../models/message');
var Groups = require('./../models/chat_groups');

var user_functions = require('../utils/user');
var nodemailer = require('./../utils/node_mailer');
nodemailer.setupTransport(config.mailConfig.smtp);


/**
 * General Functions
 */
exports.updateGroup = function (option, cb) {
  Groups.findOne({_id: option._id}).exec(function (err, doc) {
    if (err) {
      return cb({success: false, message: err.message});
    }
    if (!doc) {
      return cb({success: false, message: "Group not found!"});
    }
    for (var a in option.data) {
      doc[a] = option.data[a];
    }
    doc.save(function (err, affected) {
      if (err)
        return cb({success: false, message: err.message});
      Groups.findOne({_id: option._id}).populate('members').exec(function (err, group2) {
        return cb({_id: option._id, group: group2, success: true}); // Returns company id
      });
    });
  });
};

exports.createNewGroup = function (option, cb) {
  Groups.findOne({
    'name': option.data.name
  }).exec(function (err, group) {
    if (err) {
      return cb({success: false, message: handleGroupSaveError(err)});
    }
    if (group) {
      //send error that this group name is taken already
      return cb({success: false, message: handleGroupSaveError({code: 11000})});
    }
    debug(' not found ');

    var owner = username; //for now we keep it blank//this should be req.session.passport.user
    var groupData = {
      name: option.data.name, //uniq
      owner: owner,
      members: option.data.members
    };
    if (option.data.photo && option.data.photo.length > 100) {
      groupData.photo = option.data.photo;
    }

    // Populate Information to group instance
    var group = new Groups(groupData);
    group.save(function (err, group) {
      if (err) {
        return cb({success: false, message: handleGroupSaveError(err)});
      }
      Groups.findOne({_id: group._id}).populate('members').exec(function (err, group2) {
        return cb({_id: group._id, group: group2, success: true}); // Returns company id
      });

    });
  })
};

exports.fetchMessages = function (option, cb) {
  var query = {};

  if (option.type == 'private') {
    query.room = {$in: [option.room, '@' + option.username]};
  } else {
    query.room = option.room;
  }

  var skip = 0;
  if (option.skip) {
    skip = option.skip;
  }

  var limit = 1000;
  if (option.limit) {
    limit = option.limit;
  }

  Message.find(query,
      {'file.data': 0}, //we skip the file data for faster messages loading
      {
        skip: skip * limit, // Starting Row
        limit: limit, // Ending Row
        sort: {
          createdAt: 1 //Sort by Date Added DESC
        }
      }).exec(cb);
}

exports.getGroups = function (option, cb) {
  // Find
  var query = {};
  if (typeof option == 'function') {
    cb = option;
  } else {
    if (option.username) {
      query.members = option.username;
    }
  }
  if (!option.admin) {
    query.status = true;
  }
  //to get only that users saved groups
  debug('Query in getGroups:', query);
  Groups.find(query).populate('members').exec(cb);
}

exports.handleGroupSaveError = function (err) {
  // Check if business name already exists
  if (err.code == 11000) {
    err.message = "A Group with that name already exists";
  } else {
    // If company validation, gets one of the errors to return
    if (err.message == "Group validation failed") {
      var one_error;
      for (var first in err.errors) { // Get one of the errors
        one_error = err.errors[first];
        break;
      }
      // If it is one of the required ones i.e. Path 'XXXX' is required we change it to just XXXX is required
      if (/ is required/.test(one_error.message)) {
        one_error.message = one_error.message.replace(/^Path /gi, '');
      }
      err.message = one_error.message;
    }
  }
  return err.message;
}

exports.isOnline = function (userId) {
  return usersOnline.indexOf(userId) != -1;
};

//get emails by user
exports.getQueuedPrivateMsg = function (cb, options) {
  Message.find({
    type: 'private',
//      from: options.from,
//      to: options.to,
    createdAt: {$gt: new Date() - (spanHours * 60 * 60 * 1000) - 10 * 1000}//-10 second rewind
  }, null, {
    skip: 0, // Starting Row
    limit: 2,
    sort: {
      createdAt: 1 //Sort by Date Added DESC
    }
  }).exec(function (err, msgs) {
    debug('Found saved messages for user ' + options.to + ' Count ' + msgs.length);
    cb(err, msgs);
  });
};

exports.formatTime = function (dateStr) {
  return moment(dateStr).format('LT');
}

exports.formatMessage = function (msg) {
  return "<br>At: " + formatTime(msg.createdAt) + " <br> " + msg.content + " <br><br>";
}

/**
 * will get the array of the queue and get all messages for each users to send and get the email of the user
 * then send emails
 * @param msgs
 * @returns {{}}
 */
exports.filterByUser = function (msgs) {
  var d = {};

  for (var i in msgs) {
    var msg = msgs[i];
    debug("Msg", msgs[i]);
    if (!d[msg.to]) {
      d[msg.to] = {};
      d[msg.to].messages = [];
      d[msg.to].html = '';
    }
    d[msg.to].html += formatMessage(msg);
    d[msg.to].messages.push(msg);
  }
  return d;
}


