module.exports = function (io) {
    var config = require('./../config');

    var express = require('express');
    var debug = require('debug')('server:io');
    var router = express.Router();
    var Message = require('./../models/message');
    var Groups = require('./../models/chat_groups');
    var helper = require('./../helpers/messenger');
    var user_functions = require('../utils/user');
    var nodemailer = require('./../utils/node_mailer');
    nodemailer.setupTransport(config.mailConfig.smtp);

    router.get('/messages/:room', function (req, res) {
        debug(' got messages request ', req.params);
        //Find
        Message.find({
            'room': req.params.room.toLowerCase()
        }, null, {
            skip: 0, // Starting Row
            limit: 100, // Ending Row
            sort: {
                createdAt: -1 //Sort by Date Added DESC
            }
        }).exec(function (err, msgs) {
            //Send
            debug('Found saved messages for room ' + req.params.room.toLowerCase(), " Count" + msgs.length);
            res.json(msgs);
        });
    });

    /** Route: /volunteers
     * GET
     * No input
     * Returns list of all volunteers
     * If success: {success: true, message: [volunteers]}
     * If failure: {success: false, ...}
     * See getAllUsers for more info
     */
    router.route('/volunteers').get(function (req, res) {
        return user_functions.getAll(req, res);
    });

    /**
     * OK:100% //need to protect it by auth
     *  @id is the message _id
     *  this will send the file to download on request
     */
    router.route('/messages/file/:id').get(function (req, res) {
        debug(' got file download request ', req.params);
        //Find
        Message.findOne({
            '_id': req.params.id
        }).exec(function (err, msg) {
            if (err) {
                return res.status(500).end('No file found!');
            }
            if (!msg || !msg.file || !msg.file.data) {
                return res.status(404).end('No file found!');
            }
            //Send
            debug('Found saved message by id', msg.file);
            res.writeHead(200, {
                'Content-Type': 'application/force-download',
                'Content-disposition': 'attachment; filename=' + msg.file.name
            });
            res.end(msg.file.data);
        });
    });

    /**
     * gets all saved active groups
     * will filter later on
     * FILTER THERE IN INNER FUNC
     */
    router.route('/groups')
        .get(function (req, res) {
            debug(' got groups request ', req.query);
            helper.getGroups(function (err, groups) {
                if (err)
                    return res.json({success: false, message: err.message});
                res.json({success: true, groups: groups});
            });
        })
    ;

    /**
     * GET - gets all saved active groups, will filter later on | FILTER THERE IN INNER FUNC
     * POST -add new group//with members//
     */
    router.route('/admin/groups').get(function (req, res) {
        debug(' got groups request ', req.query);
        helper.getGroups({admin: true}, function (err, groups) {
            if (err)
                return res.json({success: false, message: err.message});
            res.json({success: true, groups: groups});
        });
    }).post(function (req, res) {
        debug('Data:', req.body);
        var user = req.session.passport.user;

        debug('groups post request ', user);
        var members = JSON.parse(req.body.members);
        debug('members ', members);

        var query = req.body.id;

        Groups.find({
            '_id': query
        }).exec(function (err, group) {
            if (err) {
                return res.json({success: false, message: helper.handleGroupSaveError(err)});
            }
            if (group) {
                //send error that this group , is taken already
                return res.json({success: false, message: helper.handleGroupSaveError({code: 11000})});
            }
            debug(' not found ');

            var owner = user; //for now we keep it blank//this should be req.session.passport.user
            var groupData = {
                name: req.body.name, //uniq
                owner: owner,
                members: members,
                photo: req.body.photo
            };

            // Populate Information to group instance
            var group = new Groups(groupData);
            group.save(function (err, group) {
                if (err) {
                    return res.json({success: false, message: helper.handleGroupSaveError(err)});
                }
                return res.json({id: group.id, success: true}); // Returns company id
            });
        })
    });


    /**
     * PUT - make inactive a group
     */
    router.route('/groups/:name').put(function (req, res) {
        debug('groups put request ', req.params);
        Groups.findOne({name: req.params.name}).exec(function (err, doc) {
            if (err) {
                return res.json({success: false, message: err.message});
            }
            if (!doc) {
                return res.json({success: false, message: "Group not found!"});
            }
            doc.status = true;
            doc.save(function (err, affected) {
                if (err)
                    return res.json({success: false, message: err.message});
                res.json({success: true});
            });
        });
    }).delete(function (req, res) {
        debug('groups delete request ', req.params);
        Groups.findOne({name: req.params.name}).exec(function (err, doc) {
            if (err) {
                return res.json({success: false, message: err.message});
            }
            if (!doc) {
                return res.json({success: false, message: "Group not found!"});
            }
            doc.status = false;
            doc.save(function (err, affected) {
                if (err)
                    return res.json({success: false, message: err.message});
                res.json({success: true});
            });
        });
    });

    /**
     * add remove group members any time
     * id === username/email
     */
    router.route('/groups/:name/member/:id').post(function (req, res) {
        Groups.update(
            {name: req.params.name},
            {$push: {'members': req.params.id}}
            , function (err, updatedRes) {
                if (err)
                    return res.json({success: false, message: err.message});
                res.json({success: true, d: updatedRes});
            });
    }).delete(function (req, res) {
        // TODO: delete associated
        Groups.update(
            {name: req.params.name},
            {$pull: {'members': req.params.id}}
            , function (err, delRes) {
                if (err)
                    return res.json({success: false, message: err.message});
                res.json({success: true, d: delRes});
            });
    });
    return router;
};