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
  var title = req.query.title;
  var params = {
    TableName: "Movies",
    ProjectionExpression: "#posterimage, #title,#id",
    FilterExpression: "(contains(#title,:title) OR contains(#typemovie,:title)) AND (#stt=:stt)",

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
    },

  };
  docClient.scan(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      return res.render("../views/movies/searchresult.ejs", { title: "Tìm kiếm", data })
    }
  });
});
// ==========End Search============

// ================================

router.get("/getsessionfb", function (req, res, next) {
  if (req.session.passport.user) {
    // var sess = {
    //   "email": req.Items.email,
    //   "fullname": req.Items.fullname,
    //   "role": req.Items.role
    // }
    res.send(req.session.passport.user);
    // return res.send(sess);
  }
  else {
    return res.send(false);
  }
})

// ========Get Session=============

router.get("/getsession", function (req, res, next) {
  if (req.session.passport.user) {
    var sess = {};
    req.session.passport.user.Items.forEach(function(i){
      sess = {
      
        "email": i.email,
        "fullname": i.fullname,
        "role": i.role
      }
    })
    
    return res.send(sess);
  }
  else {
    return res.send(false);
  }
})
// router.get("/getsession", function (req, res, next) {
//   if (req.session.email) {
//     var sess = {
//       "email": req.session.email.email,
//       "fullname": req.session.email.fullname,
//       "role": req.session.email.role
//     }
//     return res.send(sess);
//   }
//   else {
//     return res.send(false);
//   }
// })
// ========End Get Session=========



// ==============Test  req.isAuthenticated================
router.get("/islogin", function(req,res,next){
  console.log(req.session.passport.user)
  if(req.isAuthenticated())
  {
    return res.send(true);
  }
  else
  {
   
    return res.send(false);
  }
})
// =======================================================

router.get('/hihi', function(req,res,next){
  var params={
      TableName: "Accounts"
    }
    docClient.scan(params, onScan);
    function onScan(err, data) {
      if (err) {
          console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          // print all the movies
        
        console.log(JSON.stringify(data))
      }
    }
})





// ========Create=============
router.get("/create", function (req, res, next) {
  res.render("movies/create", { title: "Tạo bài viết" });
})
// Get All List Register
router.get('/getlistregister', function (req, res, next) {
  var params = {
    TableName: "Movies",
    // ProjectionExpression: "#status",
    FilterExpression: "#stt=:stt",
    ExpressionAttributeNames: {
      "#stt": "stt",
    },
    ExpressionAttributeValues: {
      ":stt": 4
    }
    // Limit: 30
  };
  docClient.scan(params, function (error, result) {
    if (error) {
      console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
    } else {

      res.render("../views/movies/registerlist_admin.ejs", { title: "Danh sách bài đăng", result });
    }
  });

})
// ==end==
// Get All List Register
router.get('/getlistregisteraccout', function (req, res, next) {
  var email = req.session.email.email;
  var params = {
    TableName: "Movies",
    // ProjectionExpression: "#status",
    FilterExpression: "(#stt=:stt) AND (#writeremail=:email) ",
    ExpressionAttributeNames: {
      "#stt": "stt",
      "#writeremail": "writeremail"
    },
    ExpressionAttributeValues: {
      ":stt": 3,
      ":email": email
    }
    // Limit: 30
  };
  docClient.scan(params, function (error, result) {
    if (error) {
      console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
    } else {
      res.render("../views/movies/listmovieregisted.ejs", { title: "Danh sách bài viết", result });
    }
  });

})
// ==end==
// ========= Get writing movie=====
router.get("/getwriting", function (req, res, next) {
  // var _title = req.body.title;
  var _id = req.query.id;
  var params = {
    TableName: "Movies",
    KeyConditionExpression: "id=:id",
    ExpressionAttributeValues: {
      ":id": _id
    }
  };
  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    }
    else {
      if (data.Count > 0) {
        return res.render("../views/movies/writingmovie.ejs", { title: "Viết bài", data })
      }
    }
  });
})
// ========Approve========
router.get("/approve", function (req, res, next) {
  var role = 2;
  var params = {
    TableName: "Movies",
    // ProjectionExpression: "#status",
    FilterExpression: "#stt=:stt",
    ExpressionAttributeNames: {
      "#stt": "stt"
    },
    ExpressionAttributeValues: {
      ":stt": role,
    }
    // Limit: 30
  };
  docClient.scan(params, function (error, result) {
    if (error) {
      console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
    } else {
      res.render("../views/movies/approve.ejs", { title: "Duyệt bài", result });
    }
  });
})
// ========End Approve====
// ========GET MOVIE======
router.get("/getmovie", function (req, res, next) {
  // var _title = req.body.title;
  var _id = req.query.id;
  var params = {
    TableName: "Movies",
    KeyConditionExpression: "id=:id",
    ExpressionAttributeValues: {
      ":id": _id
      
    }
  };
  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    }
    else {
      return res.render("../views/movies/detailmovie.ejs", { title:"PHIM", data})
    }
  });
})
// ========End GET MOVIE==
// ===========Get list waiting approve=========
router.get('/waitingapprove', function(req,res, next)
{
  var email = req.session.email.email;
  var params = {
    TableName: "Movies",
    // ProjectionExpression: "#status",
    FilterExpression: "(#stt=:stt) AND (#writeremail=:email) ",
    ExpressionAttributeNames: {
      "#stt": "stt",
      "#writeremail": "writeremail"
    },
    ExpressionAttributeValues: {
      ":stt": 2,
      ":email": email
    }
    // Limit: 30
  };
  docClient.scan(params, function (error, data) {
    if (error) {
      console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
    } else {
      res.render("../views/movies/waiting-list-member.ejs", { title: "Danh sách chờ duyệt", data });
    }
  });
});
// ============================================
// ========Update Movie========================
router.get("/update-movie", function (req, res, next) {
  // var _title = req.body.title;
  var _id = req.query.id;
  var params = {
    TableName: "Movies",
    KeyConditionExpression: "id=:id",
    ExpressionAttributeValues: {
      ":id": _id
     
    }
  };
  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    }
    else {
      return res.render("../views/movies/update-movie-member.ejs", { title:"Sửa bài viết", data})
    }
  });
})
// ============================================
module.exports = router;
