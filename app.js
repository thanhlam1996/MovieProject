var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");
var app = express();
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static(__dirname + '/public/images/icon/'));
app.use(express.static(__dirname + '/public/images/movie/'));
app.use(express.static(__dirname + '/public/images/img_animation/'));
app.use(express.static(__dirname + '/public/javascripts/'));
app.use(express.static(__dirname + '/public/stylesheets/'));
app.use(express.static(__dirname + '/public/images/'));

// Route----------------------------------------------------------
// var searchRouter=require('./routes/route_search');
// ---------------------------------------------------------------

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('views', path.join(__dirname, 'viewspartials'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  maxAge: 1000 * 60 * 60 * 24,
  cookie: {}
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// =================================================Movies==================================================
// app.use('/search', searchRouter);

// ========================================================================================================= 
module.exports = app;
