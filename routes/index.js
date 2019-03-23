var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
// var passport = require("passport");
var dynamoDbConfig = require("../config/dynamodb-config");

// var urlencodedParser = bodyParser.urlencoded({ extended: false })

AWS.config.update({
  region: "us-west-2",
  endpoint: "dynamodb.us-west-2.amazonaws.com"
});
AWS.config.accessKeyId = "AKIAII56X4EHJSADC2KA";
AWS.config.secretAccessKey = "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";
var docClient = new AWS.DynamoDB.DocumentClient();
//

// ======================Check Login=============================
function CheckLogin(role, res, req) {
  if (req.isAuthenticated()) {
    res.render("../views/err-role/err.ejs", {
      roleerr: "Bạn đăng nhập để truy cập đến trang này!"
    });
    return false;
  } else {
    if (req.session.passport.user.role < role) {
      res.render("../views/err-role/err.ejs", {
        roleerr: "Bạn cần được cấp quyền để truy cập đến trang này!"
      });
      return false;
    } else {
      return true;
    }
  }
}


// ======================End Check Login=========================

/* GET home page. */
// <<<<<<< Updated upstream
router.get("/", function (req, res, next) {
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

  docClient.scan(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      res.render("main/index", { title: "Movie", data });
    }
  });
});
  // =======
  router.get("/", function (req, res, next) {
    res.render("main/index", { title: "Movie" });
    // >>>>>>> Stashed changes
  });
  // ===========Search============
  router.post("/search-movie", function (req, res, next) {
    var title = req.body.txtsearch;
    var params = {
      TableName: "Movies",
      FilterExpression: "(contains(#title,:title) OR contains(#typemovie,:title)) AND (#stt=:stt)",

      ExpressionAttributeNames: {
        "#stt": "stt",
        "#title": "title",
        "#typemovie": "typemovie",
      },
      ExpressionAttributeValues: {
        ":title": title,
        ":stt": 1
      }
    };
    docClient.scan(params, function (err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
        return res.render("../views/movies/result-search-movie.ejs", { txtsearch: title, data });
      }
    });
  });
  // ==========End Search============

  // =====GET LOGIN==========
  router.get("/login-register", function (req, res, next) {
    return res.render("../views/account/login-register-account.ejs");
  });
  // =====END GET LOGIN======
  // ========Get Session=============

  router.get("/getsession", function (req, res, next) {
    if (req.isAuthenticated()) {
      return res.send(false);
    } else {
      var sess={
        role:req.session.passport.user.role,
        fullname:req.session.passport.user.fullname,
        id:req.session.passport.user.id,
        email:req.session.passport.user.email
      };
      return res.send(sess);
    }
  });

  // =======================================================

  // ========Create=============

  // ========GET MOVIE======
  router.get("/detail-movie", function (req, res, next) {
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
    docClient.query(params, function (err, data) {
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
  router.get("/pageadmin", function (req, res, next) {
    if (req.isAuthenticated()) {
      return res.render("../views/err-role/err.ejs", {
        roleerr: "Bạn đăng nhập để truy cập đến trang này!"
      });
      // return res.send(false);
    } else {
      if (req.session.passport.user.role < 2) {
        return res.render("../views/err-role/err.ejs", {
          roleerr: "Bạn cần được cấp quyền để truy cập đến trang này!"
        });
      } else {
        if(req.session.passport.user.role==2)
        {
          return res.redirect("/movie/get-list-writed-member");
        }
        else
        {
          return res.redirect("/movie/get-list-movie-admin");
        }
      }
      // return res.send(sess);
    }
  });
// =============GET DETAIL ACC ALL OBJECT================
router.get("/get-detail-account", function (req, res, next) {
  if(CheckLogin(1,res,req)){
   var _id = req.session.passport.user.id;
   var params = {
    TableName: "Accounts",
    KeyConditionExpression: "id=:id",
    ExpressionAttributeValues: {
      ":id": _id
    }
  };
  docClient.query(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      var ck=_id.substring(0, 2); ; 
      if(ck=="GG"|| ck=="FB")
      {
        return res.render("../views/account/detail-acc-owner.ejs",{data,ck:"no"});
      }
      else
      {
        return res.render("../views/account/detail-acc-owner.ejs",{data,ck:"yes"});
      }
    }
  });
  }else{
    return false; //ERR 500
  }
 });
// ===========================================
// ==============UPDATE ACCOUNT===============
router.get("/get-update-account", function(req,res,next){
  if(CheckLogin(1,res,req)){
    var _id = req.session.passport.user.id;
    var params = {
     TableName: "Accounts",
     KeyConditionExpression: "id=:id",
     ExpressionAttributeValues: {
       ":id": _id
     }
   };
   docClient.query(params, function (err, data) {
     if (err) {
       console.error(
         "Unable to read item. Error JSON:",
         JSON.stringify(err, null, 2)
       );
     } else {
      return res.render("../views/account/update-account.ejs",{data})
     }
   });
   }else{
     return false; //ERR 500
   }
})
// ===========================================

  module.exports = router;
