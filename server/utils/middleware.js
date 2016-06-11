/**
 * Created by ND88 on 25/05/2016.
 */

var mongoUtils = require('./mongo');
var debug = require('debug')('utils/middleware');
var HttpStatus = require('http-status-codes');
var config = require('../../config.json');
var COLLECTIONS = config.COLLECTIONS;
var ROLES = config.ROLES;
var ROLES_HIERARCHY = Object.keys(ROLES).map(function (key) {
    return ROLES[key];
}).reverse();
var middleware = {};

/**
 * Middleware - Make sure user is logged in
 */
middleware.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.status(HttpStatus.UNAUTHORIZED).send({errMessage : "Error: User is not logged in" });
};

/**
 * Check if a user is authorized to access a certain action
 */
middleware.ensurePermission = function(req, res, next) {

    if(!req.action)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({errMessage: "No Action ID"});
    debug('ensurePermission request action', req.action);
    debug('ensurePermission user', req.user.role);

    mongoUtils.query(COLLECTIONS.ACTIONS, {action: req.action}, function (error, result) {

        if (error || !result || result.length !== 1)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({errMessage: "Invalid Action ID"});

        if (ROLES_HIERARCHY.indexOf(req.user.role) < ROLES_HIERARCHY.indexOf(result[0].role))
            return res.status(HttpStatus.FORBIDDEN).send({errMessage: "Not Allowed"});

        next();
    });
};

/**
 * Check User exists in the database
 */
middleware.ensureUserExists = function(req, res, next) {

    mongoUtils.query(COLLECTIONS.USERS, {email: req.body.email}, function (error, result) {

        if (error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({errMessage: "Failed to find user"});
        else if (!result || !result.length)
            return res.status(HttpStatus.BAD_REQUEST).send({errMessage: "User does not exists"});

        req.queriedUser = result[0];
        next();
    });
};

/**
 * Check Multiple Users exists in teh database 
 */
middleware.ensureMultipleUsersExists = function(req, res, next) {

    var members = req.body.members;

    mongoUtils.query(COLLECTIONS.USERS, {email: {$in: members}}, function(error, result) {

        if (error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({errMessage: "Failed to find users"});
        else if (!result || result.length !== members.length)
            return res.status(HttpStatus.BAD_REQUEST).send({errMessage: "Some users do not exists"});

        next();
    });
};

/**
 * Check Team exists in the database
 */
middleware.ensureTeamExists = function(req, res, next) {

    mongoUtils.query(COLLECTIONS.TEAMS, {name: req.body.teamName}, function(error, result) {

        if(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({errMessage: "Failed to find team"});
        else if(!result || !result.length)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({errMessage: "Team does not exists"});

        req.queriedTeam = result[0];
        next();
    })
};

/**
 * Check Renovation exists in the database
 */
middleware.ensureRenovationExists = function(req, res, next) {

    var renovation = {
        addr: {
            city: req.body.city,
            street: req.body.street,
            num: req.body.num
        }
    };

    mongoUtils.query(COLLECTIONS.RENOVATIONS, renovation, function(error, result) {

        if(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({errMessage: "Failed to find renovation"});
        else if(!result || !result.length)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({errMessage: "Renovation does not exists"});

        req.queriedRenovation = result[0];
        next();
    })
};


module.exports = middleware;