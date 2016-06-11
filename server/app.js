var express = require('express');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var app = express();
var debug = require('debug')('app');
var bodyParser = require('body-parser');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var config = require('../config.json');
var store = new MongoDBStore(
    {
        uri: process.env.MONGODB_URL || config.mongoDBUrl,
        collection: 'sessions'
    });

store.on('error', function (error) {
    debug('Mongo SessionStore error:', error);
});

/**
 * Static Routes
 */
app.use(express.static(__dirname + '/../client')); //Static route for client side
app.use('/vendor', express.static(__dirname + '/../node_modules/')); //Static Route for node_modules

/**
 * App Configuration
 */
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || config.SECRETS.sessionSecret,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

require('./passport')(passport);

/**
 * Middleware to assign action id according to request url
 * @link ensurePermission will check user permission against the DB using the action id
 */
app.use(require('./utils/acl'));

/**
 * API Routes
 */
app.use('/api/database', require('./routes/database'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/status', require('./routes/status'));
app.use('/api/dataexchange', require('./routes/dataexchange'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/readability', require('./routes/readability'));
app.use('/api/statistics', require('./routes/statistics'));
app.use('/api/renovation', require('./routes/renovation'));
app.use('/api/user', require('./routes/user'));
app.use('/api/team', require('./routes/team'));


/**
 * Route to Fix express rewrites since UI Router is in html5Mode
 */
app.all('*', function (request, response, next) {
    // Just send the index.html for other files to support HTML5Mode
    response.sendFile('index.html', {root: __dirname + '/../client'});
});


/**
 * Redirect any unmatched urls (404 Not Found). keep this as the last app.use()
 */
app.use(function (request, response) {
    response.redirect('/');
});

app.io = require('./socketio');

module.exports = app;
