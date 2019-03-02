var express = require('express');
var router = express.Router();
var AWS = require("aws-sdk");
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
router.get('/', function (req, res, next) {
  res.render('main/index', { title: 'Movie' });
});
// ===========Search============
router.get('/search', function (req, res, next) {
  var id = req.query.title;
  var params = {
    TableName: "Movies",
    KeyConditionExpression: "#id = :id",
    ExpressionAttributeNames: {
      "#id": "id"
    },
    ExpressionAttributeValues: {
      ":id": id
    }
  };
  var movie = {};
  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach(function (item) {
        movie = item;
      });
      res.render("../views/movies/detailmovie.ejs", { title: "Detail", movie })
    }
  });
});
// ==========End Search============
// ==========Register==============
router.post('/register', function (req, res, next) {
  var birthday = req.body.day + "/" + req.body.month + "/" + req.body.year;

  var params = {
    TableName: "Accounts",
    Item: {
      "email": req.body.email,
      "fullname": req.body.fullname,
      "password": req.body.password,
      "birthday": birthday,
      "sex": req.body.sex,
      "adress": req.body.adress,
      "phone": req.body.phone,
      "role": 1
    }
  };
  docClient.put(params, function (err, data) {
    if (err) {
      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      return res.redirect("/");
    }
  });
});
// =======End Register=============
// ==========Register==============
router.post('/login', function (req, res, next) {
  var params = {
    TableName: "Accounts",
    KeyConditionExpression: "#user =:email",
    ExpressionAttributeNames: {
      "#user": "email"
    },
    ExpressionAttributeValues: {
      ":email": req.body.email
    }
  };
  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      if (data.Count > 0) {
        var acc = {};
          data.Items.forEach(function (i) {
          acc.fullname = i.fullname;
          acc.email = i.email;
          acc.role=i.role;
          if (i.password == req.body.password) {
            req.session.email = {
              "email": acc.email, "fullname": acc.fullname, "role": acc.role
            };
            
            var sess={
              "email":req.session.email.email,
              "fullname":req.session.email.fullname,
              "role":req.session.email.role
            }
            // console.log(sess);
            return res.send(sess);
          }
          else {
          return  res.send(false);

          }
        });
      }
      else {
       return res.send(false);
      }
    }
  });
});
// =======End Register=============
// =======Check Email==============
router.get("/checkemail", function(req,res, next){
  var _email = req.query.email;

  var params = {
      TableName: "Accounts",
      KeyConditionExpression: "email=:email",
      ExpressionAttributeValues: {
          ":email": _email
      }
  };

  docClient.query(params, function (err, data) {
      if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {

          if (data.Count > 0) {
              return res.send(false);//ton tai
          }
          else {
            return  res.send(true);
          }
      }
  });
})
// =======End Check Email==========
//========Sign out session==============
router.get("/signout",function(req,res,next){
  req.session.destroy();
  return res.end();
});

// ================================
// ========Get Session=============
router.get("/getsession", function(req,res,next){
  if(req.session.email)
  {
    var sess={
      "email":req.session.email.email,
      "fullname":req.session.email.fullname,
      "role":req.session.email.role
    }
    return res.send(sess);
  }
  else
  {
    return res.send(false);
  }
})
// ========End Get Session=========
// ========Create=============
router.get("/create", function(req,res,next){
   res.render("movies/create",{title:"Tạo bài viết"});
})
// ========End Create=========
module.exports = router;
