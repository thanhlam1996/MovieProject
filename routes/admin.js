var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var passport = require("passport");
var dynamoDbConfig = require("../config/dynamodb-config");

// var urlencodedParser = bodyParser.urlencoded({ extended: false })

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});
AWS.config.accessKeyId = "AKIAJ7WBBCXAAFKR4RLA";
AWS.config.secretAccessKey = "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";

var docClient = new AWS.DynamoDB.DocumentClient();
//

// var notes=require('../model/movie')

/* GET home page. */

// ====================== Phần này dành riêng cho trang quản lý thuộc về role của account >2=========
router.get("/pageadmin", function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.render("../views/err-role/err.ejs", {
      roleerr: "Bạn đăng nhập để truy cập đến trang này!"
    });
    // return res.send(false);
  } else {
   
    if (req.session.passport.user.role < 1) {
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
