var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var uuid4 = require("uuid4");
var dateFormat = require("dateformat");
var multer = require("multer");
var upload = multer({ dest: "uploads/" });
var dynamoDbConfig = require("../config/dynamodb-config");
// =========================Role===========================
// Movie
// 1=>Da duyet
// 2=>Chua duyet
// 3=>Da duoc dang ky
// 4=>Cho dang ky
// 5=>Het han dang ky
// ============
// Account
// Admin=>4
// SubAdmin=>3
// Member=>2
// User=>1

// =====================End role===========================

// var urlencodedParser = bodyParser.urlencoded({ extended: false })

AWS.config.update({
  region: dynamoDbConfig.region,
  endpoint: dynamoDbConfig.endpoint
});
AWS.accessKeyId = dynamoDbConfig.accessKeyId;
AWS.secretAccessKey = dynamoDbConfig.secretAccessKey;
var docClient = new AWS.DynamoDB.DocumentClient();
//
// =====function create and check uuid4===========
//Khi mot uuid dc tao ra no se kiem tra xem tai csdl co ton tai cai id nay chua neu co thi lay cai khac va tiep tuc check
function createID() {
  var id = uuid4();
  while (checkidmovie(id) == true) {
    id = uuid4();
  }
  return id;
}

//Function check id tu database
function checkidmovie(id) {
  var params = {
    TableName: "Movies",
    KeyConditionExpression: "#id =:id",
    ExpressionAttributeNames: {
      "#id": "id"
    },
    ExpressionAttributeValues: {
      ":id": id
    }
  };
  docClient.query(params, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      if (data.Count > 0) {
        return false;
      } else {
        return true;
      }
    }
  });
}
// ========Create=============
router.get("/create-movie", function(req, res, next) {
  res.render("movies/createMovie-admin.ejs");
});

// ================Multer==============
var imgname = ""; //Bien khai bao static chua ten anh bia
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/uploads");
  },
  filename: (req, file, cb) => {
    imgname += file.fieldname + "-" + Date.now() + file.originalname;
    cb(null, imgname);
  }
});
var upload = multer({ storage: storage });
// ====================================
router.post("/create-movie-admin", function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.render("../views/err-role/err.ejs", {
      roleerr: "Bạn đăng nhập để truy cập đến trang này!"
    });
    // return res.send(false);
  } else {
    var sess = {};
    req.session.passport.user.Items.forEach(function(j) {
      sess = {
        email: j.email,
        fullname: j.fullname,
        role: j.role
      };
    });
    if (sess.role < 3) {
      return res.render("../views/err-role/err.ejs", {
        roleerr: "Bạn cần được cấp quyền để truy cập đến trang này!"
      });
    } else {
      if (req.body.title instanceof Array) {
        for (var i = 0; i < req.body.title.length; i++) {
          // console.log(req.body.title[i] + "====" + req.body.producer[i] + "====" + req.body.deadline[i])
          var id = createID();
          var params = {
            TableName: "Movies",
            Item: {
              id: id,
              title: req.body.title[i],
              producer: req.body.producer[i],
              deadline: req.body.deadline[i],
              note: req.body.note[i],
              stt: 4,
              creater: sess.fullname,
              emailcreater: sess.email
            }
          };
          docClient.put(params, function(err, data) {
            if (err) {
              console.error(
                "Unable to update item. Error JSON:",
                JSON.stringify(err, null, 2)
              );
            } else {
            }
          });
        }
        return res.redirect("/movie/list-movie-waiting-register-write");
      } else {
        var id = createID();
        var params = {
          TableName: "Movies",
          Item: {
            id: id,
            title: req.body.title,
            producer: req.body.producer,
            deadline: req.body.deadline,
            note: req.body.note,
            stt: 4,
            creater: sess.fullname,
            emailcreater: sess.email
          }
        };
        docClient.put(params, function(err, data) {
          if (err) {
            console.error(
              "Unable to update item. Error JSON:",
              JSON.stringify(err, null, 2)
            );
          } else {
            return res.redirect("/movie/list-movie-waiting-register-write");
          }
        });
      }
    }
    // return res.send(sess);
  }
});

// Get All List Register
router.get("/list-movie-registed", function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.render("../views/err-role/err.ejs", {
      roleerr: "Bạn đăng nhập để truy cập đến trang này!"
    });
    // return res.send(false);
  } else {
    var sess = {};
    req.session.passport.user.Items.forEach(function(j) {
      sess = {
        email: j.email,
        fullname: j.fullname,
        role: j.role
      };
    });
    if (sess.role < 2) {
      return res.render("../views/err-role/err.ejs", {
        roleerr: "Bạn cần được cấp quyền để truy cập đến trang này!"
      });
    } else {
      var email = sess.email;
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
      };
      docClient.scan(params, function(error, result) {
        if (error) {
          console.error(
            "Unable to query. Error:",
            JSON.stringify(error, null, 2)
          );
        } else {
          res.render("../views/movies/list-movie-registed.ejs", { result });
        }
      });
    }
  }
});
// ==end==
// GET List movie waiting register write
router.get("/list-movie-waiting-register-write", function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.render("../views/err-role/err.ejs", {
      roleerr: "Bạn đăng nhập để truy cập đến trang này!"
    });
    // return res.send(false);
  } else {
    var sess = {};
    req.session.passport.user.Items.forEach(function(j) {
      sess = {
        email: j.email,
        fullname: j.fullname,
        role: j.role
      };
    });
    if (sess.role < 2) {
      return res.render("../views/err-role/err.ejs", {
        roleerr: "Bạn cần được cấp quyền để truy cập đến trang này!"
      });
    } else {
      var params = {
        TableName: "Movies",
        // ProjectionExpression: "#status",
        FilterExpression: "#stt=:stt OR #stt=:stt1",
        ExpressionAttributeNames: {
          "#stt": "stt"
        },
        ExpressionAttributeValues: {
          ":stt": 4,
          ":stt1": 3
        }
        // Limit: 30
      };
      docClient.scan(params, function(error, result) {
        if (error) {
          console.error(
            "Unable to query. Error:",
            JSON.stringify(error, null, 2)
          );
        } else {
          res.render("../views/movies/list-movie-waiting-register-write.ejs", {
            result,
            role: sess.role
          });
        }
      });
    }
  }
});
// =========Register movie=========
router.post("/member-register-movie", function(req, res, next) {
  var sess = {};
  req.session.passport.user.Items.forEach(function(j) {
    sess = {
      email: j.email,
      fullname: j.fullname,
      role: j.role
    };
  });
  var id = req.body.id;
  var email = sess.email;
  var fullname = sess.fullname;
  var now = new Date();
  var registiondate = dateFormat(now, "isoDate");
  var title = req.body.title;
  var params = {
    TableName: "Movies",
    Key: {
      id: id,
      title: title
    },
    UpdateExpression:
      "set stt=:st, writer=:wr, writeremail=:email, registiondate=:reg",
    ExpressionAttributeValues: {
      ":st": 3,
      ":wr": fullname,
      ":email": email,
      ":reg": registiondate
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      return res.send(true);
    }
  });
});

// ========= Get writing movie=====
router.get("/member-writing-movie", function(req, res, next) {
  // var _title = req.body.title;
  var _id = req.query.id;
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
      if (data.Count > 0) {
        return res.render("../views/movies/member-writing-movie.ejs", { data });
      }
    }
  });
});

// =========Register movie=========
// =========Writing Movie of writer===============
router.post("/member-submit-movie", upload.single("posterimage"), function(
  req,
  res,
  next
) {
  var title = req.body.title1;
  console.log("title==" + title);
  var id = req.body.id1;
  console.log("id==" + id);
  var director = req.body.director;
  var distance = req.body.distance;
  var publicationdate = req.body.publicationdate;
  var actor = req.body.actor;
  var typemovie = req.body.typemovie;
  var country = req.body.country;
  var posterimage = imgname;
  var trailer = req.body.trailer;
  var content = req.body.content;
  var now = new Date();
  var dateofwrite = dateFormat(now, "isoDate");
  var params = {
    TableName: "Movies",
    Key: {
      id: id,
      title: title
    },
    UpdateExpression:
      "set stt=:st, director=:a, distance=:b, publicationdate=:c, actor=:d, typemovie=:e, posterimage=:g, trailer=:h, content=:i, dateofwrite=:j, country=:l",
    ExpressionAttributeValues: {
      ":st": 2,
      ":a": director,
      ":b": distance,
      ":c": publicationdate,
      ":d": actor,
      ":e": typemovie,
      ":l": country,
      ":g": posterimage,
      ":h": trailer,
      ":i": content,
      ":j": dateofwrite
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      return res.redirect("/movie/list-movie-registed");
      imgname = "";
    }
  });
});

// ========Approve========
router.get("/get-admin-approve-movie", function(req, res, next) {
  var role = 2;
  var params = {
    TableName: "Movies",
    // ProjectionExpression: "#status",
    FilterExpression: "#stt=:stt",
    ExpressionAttributeNames: {
      "#stt": "stt"
    },
    ExpressionAttributeValues: {
      ":stt": role
    }
    // Limit: 30
  };
  docClient.scan(params, function(error, result) {
    if (error) {
      console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
    } else {
      res.render("../views/movies/admin-approve-movie.ejs", { result });
    }
  });
});
// ========End Approve====
// ================Approved=======================
router.post("/admin-approve-movie", function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.render("../views/err-role/err.ejs", {
      roleerr: "Bạn đăng nhập để truy cập đến trang này!"
    });
    // return res.send(false);
  } else {
    var sess = {};
    req.session.passport.user.Items.forEach(function(j) {
      sess = {
        email: j.email,
        fullname: j.fullname,
        role: j.role
      };
    });
    if (sess.role < 2) {
      return res.render("../views/err-role/err.ejs", {
        roleerr: "Bạn cần được cấp quyền để truy cập đến trang này!"
      });
    } else {
      var approver = sess.fullname;
      var approveremail = sess.email;
      var title = req.body.title;
      var id = req.body.id;
      var now = new Date();
      var dateofapproved = dateFormat(now, "isoDate");
      var params = {
        TableName: "Movies",
        Key: {
          id: id,
          title: title
        },
        UpdateExpression:
          "set stt=:st, dateofapproved=:a, approver=:b, approveremail=:c",
        ExpressionAttributeValues: {
          ":st": 1,
          ":a": dateofapproved,
          ":b": approver,
          ":c": approveremail
        },
        ReturnValues: "UPDATED_NEW"
      };
      docClient.update(params, function(err, data) {
        if (err) {
          console.error(
            "Unable to update item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        } else {
          return res.send(true);
        }
      });
    }
  }
});

// =============end Approved======================
// ================Unapprove=======================
router.post("/unapprove", function(req, res, next) {
  var unapprover = req.session.email.fullname;
  var unapproveremail = req.session.email.email;
  var title = req.body.title;
  var id = req.body.id;
  var now = new Date();
  var undateofapprove = dateFormat(now, "isoDate");
  var note = req.body.note;
  var params = {
    TableName: "Movies",
    Key: {
      id: id,
      title: title
    },
    UpdateExpression:
      "set note=:note, unapprover=:a, unapproveremail=:b, undateofapprove=:c",
    ExpressionAttributeValues: {
      ":note": note,
      ":a": unapprover,
      ":b": unapproveremail,
      ":c": undateofapprove
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      return res.send(true);
    }
  });
});
// =============end Unapprove======================
// ================Delete Movie=======================
router.post("/deletemovie", function(req, res, next) {
  var title = req.body.title;
  var id = req.body.id;
  var role = req.session.email.role;
  if (role > 2) {
    var params = {
      TableName: "Movies",
      Key: {
        id: id,
        title: title
      }
    };
    docClient.delete(params, function(err, data) {
      if (err) {
        console.error(
          "Unable to delete item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        return res.send(true);
      }
    });
  } else {
    return res.send("ERROR ROLE UNVALID");
  }
});
// =============End delete movie======================
// =============Unregister============================
router.post("/unregistermoviewriter", function(req, res, next) {
  var id = req.body.id;
  var unemail = req.session.email.email;
  var unfullname = req.session.email.fullname;
  var now = new Date();
  var unregistiondate = dateFormat(now, "isoDate");
  var title = req.body.title;

  var params = {
    TableName: "Movies",
    Key: {
      id: id,
      title: title
    },
    UpdateExpression:
      "set stt=:st, unwriter=:wr, unwriteremail=:email, unregistiondate=:reg",
    ExpressionAttributeValues: {
      ":st": 4,
      ":wr": unfullname,
      ":email": unemail,
      ":reg": unregistiondate
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      return res.send(true);
    }
  });
});
// =============End Unregister============================
// ==========Update Movie Member==========================
router.post("/update-movie-member", upload.single("posterimage"), function(
  req,
  res,
  next
) {
  var title = req.body.title;
  var id = req.body.id;
  var director = req.body.director;
  var distance = req.body.distance;
  var publicationdate = req.body.publicationdate;
  var actor = req.body.actor;
  var typemovie = req.body.typemovie;
  var country = req.body.country;
  var posterimage = imgname;
  var trailer = req.body.trailer;
  var content = req.body.content;
  var now = new Date();
  var dateofwrite = dateFormat(now, "isoDate");
  if (imgname == "") {
    var params = {
      TableName: "Movies",
      Key: {
        id: id,
        title: title
      },
      UpdateExpression:
        "set stt=:st, director=:a, distance=:b, publicationdate=:c, actor=:d, typemovie=:e, trailer=:h, content=:i, dateofwrite=:j, country=:l",
      ExpressionAttributeValues: {
        ":st": 2,
        ":a": director,
        ":b": distance,
        ":c": publicationdate,
        ":d": actor,
        ":e": typemovie,
        ":l": country,
        ":h": trailer,
        ":i": content,
        ":j": dateofwrite
      },
      ReturnValues: "UPDATED_NEW"
    };
  } else {
    var params = {
      TableName: "Movies",
      Key: {
        id: id,
        title: title
      },
      UpdateExpression:
        "set stt=:st, director=:a, distance=:b, publicationdate=:c, actor=:d, typemovie=:e, posterimage=:g, trailer=:h, content=:i, dateofwrite=:j, country=:l",
      ExpressionAttributeValues: {
        ":st": 2,
        ":a": director,
        ":b": distance,
        ":c": publicationdate,
        ":d": actor,
        ":e": typemovie,
        ":l": country,
        ":g": posterimage,
        ":h": trailer,
        ":i": content,
        ":j": dateofwrite
      },
      ReturnValues: "UPDATED_NEW"
    };
  }
  docClient.update(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      return res.redirect("/getlistregister");
      imgname = "";
    }
  });
});
// =======================================================
module.exports = router;
