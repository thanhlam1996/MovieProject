var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var passport = require("passport");
var dynamoDbConfig = require("../config/dynamodb-config");

// var urlencodedParser = bodyParser.urlencoded({ extended: false })

AWS.config.update({
  region: dynamoDbConfig.region,
  endpoint: dynamoDbConfig.endpoint
});
AWS.accessKeyId = dynamoDbConfig.accessKeyId;
AWS.secretAccessKey = dynamoDbConfig.secretAccessKey;
var docClient = new AWS.DynamoDB.DocumentClient();
//

// var notes=require('../model/movie')

/* GET home page. */
router.get("/", function(req, res, next) {
  var params = {
    TableName: "Movies",
    FilterExpression: "#stt=:stt",
    ExpressionAttributeNames: {
      "#stt": "stt"
    },
    ExpressionAttributeValues: {
      ":stt": 1
    }
  };

  docClient.scan(params, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      res.render("main/index", { title: "Movie", data });
    }
  });
});
// ===========Search============
router.get("/search", function(req, res, next) {
  var title = req.query.title;
  var params = {
    TableName: "Movies",
    ProjectionExpression: "#posterimage, #title, #id",
    FilterExpression:
      "(contains(#title,:title) OR contains(#typemovie,:title)) AND (#stt=:stt)",

    ExpressionAttributeNames: {
      "#stt": "stt",
      "#title": "title",
      "#typemovie": "typemovie",
      "#posterimage": "posterimage",
      "#id": "id"
    },
    ExpressionAttributeValues: {
      ":title": title,
      ":stt": 1
    }
  };
  docClient.scan(params, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      return res.render("../views/movies/searchresult.ejs", {
        title: "Tìm kiếm",
        data
      });
    }
  });
});
// ==========End Search============

// =====GET LOGIN==========
router.get("/login-register", function(req, res, next) {
  return res.render("../views/account/login-register-account.ejs");
});
// =====END GET LOGIN======
// ========Get Session=============

router.get("/getsession", function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.send(false);
  } else {
    var sess = {};
    req.session.passport.user.Items.forEach(function(i) {
      sess = {
        email: i.email,
        fullname: i.fullname,
        role: i.role
      };
    });
    return res.send(sess);
  }
});

// =======================================================

// ========Create=============

// ========GET MOVIE======
router.get("/detail-movie", function(req, res, next) {
  // var _title = req.body.title;
  var _id = req.query.id;
  var _role = req.query.role;
  var params = {
    TableName: "Movies",
    KeyConditionExpression: "id=:id",
    ExpressionAttributeValues: {
      ":id": _id
    }
  };
  docClient.query(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      if (_role == "ad") {
        return res.render("../views/movies/movie-detail.ejs", {
          data,
          role: "ad"
        });
      } else if (_role == "mb") {
        return res.render("../views/movies/movie-detail.ejs", {
          data,
          role: "mb"
        });
      } else {
        return res.render("../views/movies/movie-detail.ejs", {
          data,
          role: "none"
        });
      }
    }
  });
});
// ========End GET MOVIE==

// ====================== Phần này dành riêng cho trang quản lý thuộc về role của account >2=========
router.get("/pageadmin", function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.render("../views/err-role/err.ejs", {
      roleerr: "Bạn đăng nhập để truy cập đến trang này!"
    });
    // return res.send(false);
  } else {
    var sess = {};
    req.session.passport.user.Items.forEach(function(i) {
      sess = {
        email: i.email,
        fullname: i.fullname,
        role: i.role
      };
    });
    if (sess.role < 3) {
      return res.render("../views/err-role/err.ejs", {
        roleerr: "Bạn cần được cấp quyền để truy cập đến trang này!"
      });
    } else {
      return res.render("../views/admin/pageadmin.ejs");
    }
    // return res.send(sess);
  }
});

module.exports = router;
