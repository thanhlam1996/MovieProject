var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var dateFormat = require("dateformat");
// var passport = require("passport");
var dynamoDbConfig = require("../config/dynamodb-config");
var moment = require('moment');
var arraySort = require('array-sort');//Phuong thuc dung de sap xep nhuwng chuaw kha thi hihi
var descending = require('sort-desc');//Phuong thuc sorf theo thu tu gia, dan

// var urlencodedParser = bodyParser.urlencoded({ extended: false })

// AWS.config.update({
//   region: "us-west-2",
//   endpoint: "http://localhost:8000"
// });
// AWS.config.accessKeyId = "AKIAJ7WBBCXAAFKR4RLA";
// AWS.config.secretAccessKey = "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";
if (dynamoDbConfig.isDev) {
  AWS.config.update({
    region: dynamoDbConfig.localConfig.region,
    endpoint: dynamoDbConfig.localConfig.endpoint
  });
  AWS.accessKeyId = dynamoDbConfig.localConfig.accessKeyId;
  AWS.secretAccessKey = dynamoDbConfig.localConfig.secretAccessKey;
} else {
  AWS.config.update({
    region: dynamoDbConfig.onlineConfig.region,
    endpoint: dynamoDbConfig.onlineConfig.endpoint
  });
  AWS.accessKeyId = dynamoDbConfig.onlineConfig.accessKeyId;
  AWS.secretAccessKey = dynamoDbConfig.onlineConfig.secretAccessKey;
}
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
      // ==========Xử lý js trả về index=============

      var now=new Date();
      var nowdate = dateFormat(now, "isoDate");
      var movietop=[];
      var movienew=[];
      var movieplaying=[];//Phim dang chieu duoc tinhs dua tren ngay phat hanh phai nho hon ngay hien tai trong khoang 30 ngay
      var moviecoming=[];
      data.Items.forEach((i)=>{
        if(i.countlike && i.ratings)
        {
          movietop.push(i)
        }
        movienew.push(i);
        if(Math.ceil(Math.abs(new Date(i.info.publicationdate) - new Date(nowdate)) / (1000 * 3600 * 24))<=30&&Math.ceil(Math.abs(new Date(i.info.publicationdate) - new Date(nowdate)) / (1000 * 3600 * 24))>=0){
          movieplaying.push(i);
        }
        if(new Date(i.info.publicationdate)> new Date(nowdate)){
          moviecoming.push(i);
        }
        
      })
      movietop.sort((a,b)=>{
        var ar=0;
        var br=0;
        a.ratings.forEach((m)=>{
          ar+=m;
        })
        b.ratings.forEach((n)=>{
          br+=n;
        })
        return (b.countlike+(br/b.ratings.length)+b.movieview)-(a.countlike+(ar/a.ratings.length)+a.movieview);
      })
      movienew.sort((a,b)=>{
        return new Date(b.info.publicationdate)-new Date(a.info.publicationdate);
      })
      movieplaying.sort((a,b)=>{
        return new Date(b.info.publicationdate)-new Date(a.info.publicationdate);
      })
      console.log(movietop)
      res.render("main/index", {movietop,movienew,moviecoming,movieplaying});
    }
  });
});
// =======
// router.get("/", function (req, res, next) {
//   res.render("main/index", { title: "Movie" });

// });
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
    var sess = {
      role: req.session.passport.user.role,
      fullname: req.session.passport.user.fullname,
      id: req.session.passport.user.id,
      email: req.session.passport.user.email
    };
    return res.send(sess);
  }
});

// =======================================================
// =============Update View movie=====================
function AddViewMovie(id) {
  var params = {
    TableName: "Movies",
    Key: {
      id: id
    },
    UpdateExpression:
      "set movieview=movieview+:cnt",
   
    ExpressionAttributeValues: {
      ":cnt": 1
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log(JSON.stringify(data));
      return true;
    }
  });
}
function CreateViewMovie(id) {
  var params = {
    TableName: "Movies",
    Key: {
      id: id
    },
    UpdateExpression:
      "set movieview=:cnt",
   
    ExpressionAttributeValues: {
      ":cnt": 1
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log(JSON.stringify(data));
      return true;
    }
  });
}
// =============End Update View Movie=================
// ========GET MOVIE======
router.get("/detail-movie",function (req, res, next) {
  // var _title = req.body.title;
  var _id = req.query.id;
  var id='no';
  var role='no';
  if(req.session.passport)
  {
    id=req.session.passport.user.id;
  }
 if(req.session.passport)
 {
   role=req.session.passport.user.role;
 }
 
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
      var isview=false;
      data.Items.forEach((j)=>{
        if(j.movieview)
        {
          isview=true;
        }
      })
      if(isview==true)
      {
        AddViewMovie(_id);
      }
      else
      {
        CreateViewMovie(_id);
      }
      if (_role == "ad") {
        return res.render("../views/movies/movie-detail.ejs", {
          data,
          role: "ad",
          moment: moment,
          descending: descending,
          id_owner: id,
          role_owner: role
        });
      } else if (_role == "mb") {
        return res.render("../views/movies/movie-detail.ejs", {
          data,
          role: "mb",
          moment: moment,
          descending: descending,
          id_owner: id,
          role_owner: role
        });
      } else {
        return res.render("../views/movies/movie-detail.ejs", {
          data,
          role: "none",
          moment: moment,
          descending: descending,
          id_owner: id,
          role_owner: role
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
      if (req.session.passport.user.role == 2) {
        return res.redirect("/movie/get-list-writed-member");
      }
      else {
        return res.redirect("/movie/get-list-movie-admin");
      }
    }
    // return res.send(sess);
  }
});
// =============GET DETAIL ACC ALL OBJECT================
router.get("/get-detail-account", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
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
        console.log(JSON.stringify(data))
        var ck = _id.substring(0, 2);;
        if (ck == "GG" || ck == "FB") {
          return res.render("../views/account/detail-acc-owner.ejs", { data, ck: "no", moment: moment });
        }
        else {
          return res.render("../views/account/detail-acc-owner.ejs", { data, ck: "yes", moment: moment });
        }
      }
    });
  } else {
    return false; //ERR 500
  }
});
// ===========================================
// ==============UPDATE ACCOUNT===============
router.get("/get-update-account", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
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
        return res.render("../views/account/update-account.ejs", { data })
      }
    });
  } else {
    return false; //ERR 500
  }
})
// ===========================================

module.exports = router;
