var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var uuid4 = require("uuid4");
var dateFormat = require("dateformat");
var multer = require("multer");
var multerS3 = require("multer-s3");
var upload = multer({ dest: "uploads/" });
var dynamoDbConfig = require("../config/dynamodb-config");
var deleteS3 = require('s3fs')
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

if (dynamoDbConfig.isDev) {
  AWS.config.update({
    region: dynamoDbConfig.localConfig.region,
    endpoint: dynamoDbConfig.localConfig.endpoint
  });
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

// ==============================function check login====================================
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
// ======================================================================================

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
  docClient.query(params, function (err, data) {
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
// ========Create============= role=3
router.get("/create-movie", function (req, res, next) {
  if(CheckLogin(3,res,req)){
   return res.render("movies/createMovie-admin.ejs");
  }else
  {
    return false; //ERR 500;
  };
});

// ================Multer==============
var imgname = ""; //Bien khai bao static chua ten anh bia


var s3 = new AWS.S3();

s3.config.endpoint = "s3.us-west-2.amazonaws.com";

var s3upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "movies-images",
    key: function (req, file, cb) {
      var fileName = file.fieldname + "-" + Date.now() + file.originalname;
      imgname = fileName;
      // imgname = "https://s3-us-west-2.amazonaws.com/movies-images/" + fileName;
      cb(null, fileName); //use Date.now() for unique file keys
    }
  })
});

// ====================Hàm Xóa hình ảnh từ S3==============================

var s3Options = {
  region: dynamoDbConfig.region,
  accessKeyId: dynamoDbConfig.accessKeyId,
  secretAccessKey: dynamoDbConfig.secretAccessKey
};

var s3Fs = new deleteS3('movies-images', s3Options);


// ========================================================================

//=========================================================================
// ========================================================================
//=========================================================================
//***************** Phần multer này dùng dể test local vs folder save là updates============
// ================Multer==============
var imgname="";//Bien khai bao static chua ten anh bia
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      var fileName = file.fieldname + "-" + Date.now() + file.originalname;
      imgname = fileName;
      cb(null, fileName)
    }
});
var upload = multer({storage: storage});
// ====================================
//*****************************************************************************************/
// =========================================================================
//==========================================================================
// =========================================================================







// ====================================role=3
router.post("/create-movie-admin", function (req, res, next) {
  if(CheckLogin(3,res,req)){
    if (req.body.title instanceof Array) {
      for (var i = 0; i < req.body.title.length; i++) {
        var id = createID();
        var note = "no";
        if (req.body.note[i]) {
          note += req.body.note[i]
        }
        var now = new Date();
        var initdate = dateFormat(now, "isoDate");
        var params = {
          TableName: "Movies",
          Item: {
            id: id,
            title: req.body.title[i],
            process: {
              create: {
                "creater": [req.session.passport.user.fullname, req.session.passport.user.email],
                "initdate": initdate,
                "deadline": req.body.deadline[i],
                "createnote": note
              }
            },
            info: {
              "producer": req.body.producer[i]
            },
            stt: 4
          }
        };
        docClient.put(params, function (err, data) {
          if (err) {
            console.error(
              "Unable to update item. Error JSON:",
              JSON.stringify(err, null, 2)
            );
          } else {
          }
        });
        // console.log(JSON.stringify(params))
      }
      return res.redirect("/movie/list-movie-waiting-register-write");
    } else {
      var id = createID();
      var note = "no";
      if (req.body.note) {
        note = req.body.note
      }
      var now = new Date();
      var initdate = dateFormat(now, "isoDate");
      var params = {
        TableName: "Movies",
        Item: {
          id: id,
          title: req.body.title,
          process: {
            create: {
              "creater": [req.session.passport.user.fullname, req.session.passport.user.email],
              "init date": initdate,
              "deadline": req.body.deadline,
              "createnote": note
            }
          },
          info: {
            "producer": req.body.producer
          },
          stt: 4
        }
      };
      
      docClient.put(params, function (err, data) {
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
  }else
  {
    return false; //ERR 500
  }
});
// =========Update Movie Admin================== role=2
router.get("/update-movie-admin", function (req, res, next) {
 if(CheckLogin(2,res,req)){
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
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      if (data.Count > 0) {
        return res.render("../views/movies/admin-update-movie.ejs", { data });
      }
    }
  });
 }else
 {
   return false; //ERR 500
 }
})
// role=2
router.post("/update-movie-admin", function (req, res, next) {
  if(CheckLogin(2,res,req)){
    var _id = req.body.id;
      var _title = req.body.title;
      var _producer = req.body.producer;
      var _deadline = req.body.deadline;
      var _createnote = req.body.note;
      var _oldtitle = req.body.oldtitle;
      var params = {
        TableName: "Movies",
        Key: {
          id: _id
        },
        UpdateExpression:
          "set #a=:a, #b=:b, #c=:c, #d=:d",
        ExpressionAttributeNames: {
          "#a": "title",
          "#b": "info.producer",
          "#c": "process.create.deadline",
          "#d": "process.create.createnote"
        },
        ExpressionAttributeValues: {
          ":a": _title,
          ":b": _producer,
          ":c": _deadline,
          ":d": _createnote
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
          return res.redirect("/movie/list-movie-waiting-register-write");
        }
      });
  }else
  {
    return false; //ERR 500
  }
})
// =============================================
// Get All List Register role=2
router.get("/list-movie-registed", function (req, res, next) {
  if(CheckLogin(2,res,req)){
    var email = req.session.passport.user.email;
      var params = {
        TableName: "Movies",
        // ProjectionExpression: "#status",
        FilterExpression: "(#stt=:stt) AND (process.registion.register[1]=:email) ",
        ExpressionAttributeNames: {
          "#stt": "stt",
        },
        ExpressionAttributeValues: {
          ":stt": 3,
          ":email": email
        }
      };
      docClient.scan(params, function (error, result) {
        if (error) {
          console.error(
            "Unable to query. Error:",
            JSON.stringify(error, null, 2)
          );
        } else {
          // console.log(JSON.stringify(result))
          res.render("../views/movies/list-movie-registed.ejs", { result });
        }
      });
  }else
  {
    return false;//ERR 500
  }
});
// ==end==
// GET List movie waiting register write ==role=2
router.get("/list-movie-waiting-register-write", function (req, res, next) {
  if(CheckLogin(2,res,req)){
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
    docClient.scan(params, function (error, result) {
      if (error) {
        console.error(
          "Unable to query. Error:",
          JSON.stringify(error, null, 2)
        );
      } else {
        res.render("../views/movies/list-movie-waiting-register-write.ejs", {
          result,
          role: req.session.passport.user.role
        });
      }
    });
  }else{
    return false; //ERR 500
  }
});
// =========Register movie========= role=2
router.post("/member-register-movie", function (req, res, next) {
 if(CheckLogin(2,res,req)){

  var id = req.body.id;
  var email = req.session.passport.user.email;
  var fullname = req.session.passport.user.fullname;
  var now = new Date();
  var registiondate = dateFormat(now, "isoDate");
  var title = req.body.title;
  var params = {
    TableName: "Movies",
    Key: {
      id: id
    },
    UpdateExpression:
      "set stt=:st, process.registion=:wr",
    ExpressionAttributeValues: {
      ":st": 3,
      ":wr": {
        "register": [fullname, email],
        "registion date": registiondate
      }
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
      return res.send(true);
    }
  });
 }else
 {
   return false;//ERR 500
 }
});

// ========= Get writing movie===== role=2
router.get("/member-writing-movie", function (req, res, next) {
  if(CheckLogin(2,res,req)){
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
  }else{
    return false; //ERR 500
  }
});

// =========Register movie=========
// =========Writing Movie of writer=============== role=2
router.post("/member-submit-movie",upload.single("posterimage"), function (req, res, next) { 
  if(CheckLogin(2,res,req)){
    
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
  var params = {
    TableName: "Movies",
    Key: {
      id: id
    },
    UpdateExpression:
      "set stt=:st, info.movietype=:a,info.actor=:b,info.director=:c,info.country=:d,info.distance=:e,info.posterimage=:f,info.trailer=:g,info.content=:h,info.publicationdate=:i, process.approve=:ap",
    ExpressionAttributeValues: {
      ":st": 2,
      ":a": [typemovie],
      ":b": [actor],
      ":c": director,
      ":d": country,
      ":e": distance,
      ":f": posterimage,
      ":g": trailer,
      ":h": content,
      ":i": publicationdate,

      ":ap": {
        "submitiondate": dateofwrite,
      }
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
      
      return res.redirect("/movie/list-movie-registed");
      imgname = "";
    }
  });
  }else{
    return false; //ERR 500
  }
});

// ========Approve======== role=3
router.get("/get-admin-approve-movie", function (req, res, next) {
  if(CheckLogin(3,res,req)){
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
  docClient.scan(params, function (error, result) {
    if (error) {
      console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
    } else {
      res.render("../views/movies/admin-approve-movie.ejs", { result });
    }
  });
  }else
  {
    return false; //ERR 500
  }
});
// ========End Approve====
// ================Approved======================= role=3
router.post("/admin-approve-movie", function (req, res, next) {
 if(CheckLogin(3,res,req)){
  var approver = req.session.passport.user.fullname;
  var approveremail = req.session.passport.user.email;
  var id = req.body.id;
  var now = new Date();
  var dateofapproved = dateFormat(now, "isoDate");
  var params = {
    TableName: "Movies",
    Key: {
      id: id
    },
    UpdateExpression:
      "set stt=:st, process.approve.approver=:a, process.approve.dateofapprove=:b",
    ExpressionAttributeValues: {
      ":st": 1,
      ":a": [approver, approveremail],
      ":b": dateofapproved,
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
      return res.send(true);
    }
  });
 }else{
   return false; //ERR 500
 }
});

// =============end Approved======================

// ================== Get List approving member=== role=2

router.get("/list-approving-member", function (req, res, next) {
  if(CheckLogin(2,res,req)){
    var email = req.session.passport.user.email;
    var params = {
      TableName: "Movies",
      // ProjectionExpression: "#status",
      FilterExpression: "(#stt=:stt) AND (process.registion.register[1]=:email) ",
      ExpressionAttributeNames: {
        "#stt": "stt"
      },
      ExpressionAttributeValues: {
        ":stt": 2,
        ":email": email
      }
      // Limit: 30
    };
    docClient.scan(params, function (error, data) {
      if (error) {
        console.error(
          "Unable to query. Error:",
          JSON.stringify(error, null, 2)
        );
      } else {
        console.log(JSON.stringify(data));
        res.render("../views/movies/list-approving-member.ejs", { data });
      }
    });
  }else{
    return false; //ERR 500
  }
});

// ===============================================

// ================Unapprove======================= role=3
router.post("/unapprove-movie-admin", function (req, res, next) {
  if(CheckLogin(3,res,req)){
    var id = req.body.id;
    var complaint = req.body.note;
    var params = {
      TableName: "Movies",
      Key: {
        id: id
      },
      UpdateExpression:
        "set process.approve.complaint=:a",
      ExpressionAttributeValues: {
        ":a": complaint
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
        return res.send(true);
      }
    });
  }else{
    return false; //ERR 500
  }
});
// =============end Unapprove======================
// ================Delete Movie======================= role 3
router.post("/delete-movie-admin", function (req, res, next) {
  if(CheckLogin(3,res,req)){
    var id = req.body.id;
    var role = req.session.passport.user.role;
    if (role > 2) {
      var params = {
        TableName: "Movies",
        Key: {
          id: id
        }
      };
      var param1s = {
        TableName: "Movies",
        KeyConditionExpression: "id=:id",
        ExpressionAttributeValues: {
          ":id": id
        }
      };
      docClient.query(param1s, function (err, result) { //lay file hinh
        if (err) {
          console.error(
            "Unable to read item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        } else {
          var img = "";
          var stt = "";
          result.Items.forEach(function (i) {
            img = i.info.posterimage;
            stt = i.stt;
          })
          if (stt == 4 || stt == 3) {

            docClient.delete(params, function (err, data) {
              if (err) {
                console.error(
                  "Unable to delete item. Error JSON:",
                  JSON.stringify(err, null, 2)
                );
              } else {
                return res.send(true);
              }
            });


          }
          else {
            s3Fs.unlink(img, function (err, data) {//Xoa img s3
              if (err) {
                throw err;
              }
              else { //Xoa dynamodb
                docClient.delete(params, function (err, data) {
                  if (err) {
                    console.error(
                      "Unable to delete item. Error JSON:",
                      JSON.stringify(err, null, 2)
                    );
                  } else {
                    return res.send(true);
                  }
                });
              }
            })
          }
        }
      });
    } else {
      return res.send("ERROR ROLE UNVALID");
    }
  }else
  {
    return false; //ERR 500
  }
  
});
// =============End delete movie======================
// =============Unregister============================role=2
router.post("/unregister-movie-member", function (req, res, next) {
  if(CheckLogin(2,res,req)){
    var id = req.body.id;
      var now = new Date();
      var params = {
        TableName: "Movies",
        Key: {
          id: id
        },
        UpdateExpression: "remove process.registion",
        // ExpressionAttributeValues: {
        //   ":st": 2
        // },
        ReturnValues: "UPDATED_NEW"
      };
      docClient.update(params, function (err, data) {
        if (err) {
          console.error(
            "Unable to update item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        } else {
          var params1 = {
            TableName: "Movies",
            Key: {
              id: id

            },
            UpdateExpression: "set stt=:st",
            ExpressionAttributeValues: {
              ":st": 4
            },
            ReturnValues: "UPDATED_NEW"
          };
          docClient.update(params1, function (err, data) {
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
      });
  }else
  {
    return false; //ERR 500
  }
});
// =============End Unregister============================
// ==========Update Movie Member========================== role=2

router.get("/get-update-movie-member", function (req, res, next) {
  if(CheckLogin(2,res,req)){
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
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      return res.render("../views/movies/update-movie-member.ejs", { data });
    }
  });
  }else{
    return false; //ERR 500
  }
});
// ============ Role =3
router.get("/get-update-movie-admin", function (req, res, next) {
 if(CheckLogin(3,res,req)){
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
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      return res.render("../views/movies/admin-update-content-movie.ejs", { data });
    }
  });
 }else
 {
   return false; //ERR 500
 }
});
// =========== role=2
router.post("/update-movie-member", upload.single("posterimage"), function (req, res, next) {
 if(CheckLogin(2,res,req)){
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
  var imgold = req.body.imgold; //bien nay luu ten cua img cu khi co su thay doi ve hinh anh.. de xoa trong s3

  if (imgname == "") {
    var params = {
      TableName: "Movies",
      Key: {
        id: id
      },
      UpdateExpression:
        "set stt=:st, info.director=:a, info.distance=:b, info.publicationdate=:c, info.actor=:d, info.movietype=:e, info.trailer=:h, info.content=:i, info.country=:l",
      ExpressionAttributeValues: {
        ":st": 2,
        ":a": director,
        ":b": distance,
        ":c": publicationdate,
        ":d": actor,
        ":e": typemovie,
        ":l": country,
        ":h": trailer,
        ":i": content
      },
      ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {
      if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        return res.redirect("/movie/list-approving-member");
        imgname = "";
      }
    });
  } else {
    var params = {
      TableName: "Movies",
      Key: {
        id: id
      },
      UpdateExpression:
        "set stt=:st, info.director=:a, info.distance=:b, info.publicationdate=:c, info.actor=:d, info.movietype=:e, info.posterimage=:g, info.trailer=:h, info.content=:i,  info.country=:l",
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
      },
      ReturnValues: "UPDATED_NEW"
    };
  }

  s3Fs.unlink(imgold, function (err, data) {//Xoa img s3
    if (err) {
      throw err;
    }
    else { //Xoa dynamodb
      docClient.update(params, function (err, data) {
        if (err) {
          console.error(
            "Unable to update item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        } else {
          return res.redirect("/movie/list-approving-member");
          imgname = "";
        }
      });
    }
  })
 }else
 {
   return false; //ERR 500
 }

  //Hướng phát triển: Sau này nếu member update trong trường hợp bài viết đã được approve .Khi update lại sẽ tạo ra 1 bản mới và 1 bản củ để admin lựa chọn dữ lại bản củ hay lấy bản mới.
})
// ========role=3
router.post("/update-content-movie-admin", upload.single("posterimage"), function (req, res, next) {
 if(CheckLogin(3)){
  var title = req.body.title;
  var producer=req.body.producer;
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
  var imgold = req.body.imgold; //bien nay luu ten cua img cu khi co su thay doi ve hinh anh.. de xoa trong s3

  if (imgname == ""){      
        var params = {
          TableName: "Movies",
          Key: {
            id: id
          },
          UpdateExpression:"set title=:g, info.producer=:f, info.director=:a, info.distance=:b, info.publicationdate=:c, info.actor=:d, info.movietype=:e, info.trailer=:h, info.content=:i, info.country=:l",
            ExpressionAttributeValues: {
            
            ":a": director,
            ":b": distance,
            ":c": publicationdate,
            ":d": actor,
            ":e": typemovie,
            ":l": country,
            ":h": trailer,
            ":i": content,
            ":g": title,
            ":f": producer
          },
          ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function (err, data) {
          if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          } else {
            
            imgname = "";
            return res.redirect("/pageadmin");
          }
        });
  } else {
    var params = {
      TableName: "Movies",
      Key: {
        id: id
      },
      UpdateExpression:"remove title, info.producer, info.directo, info.distance, info.publicationdate, info.actor, info.movietype, info.posterimage, info.trailer, info.content,  info.country",
      ReturnValues: "UPDATED_NEW"
    };
  }

  s3Fs.unlink(imgold, function (err, data) {//Xoa img s3
    if (err) {
      throw err;
    }
    else { //Xoa dynamodb
      docClient.update(params, function (err, data) {
        if (err) {
          console.error(
            "Unable to update item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        } else {
          var params = {
            TableName: "Movies",
            Key: {
              id: id
            },
            UpdateExpression:"set title=:k, info.producer=:f, info.director=:a, info.distance=:b, info.publicationdate=:c, info.actor=:d, info.movietype=:e, info.posterimage=:g, info.trailer=:h, info.content=:i,  info.country=:l",
              ExpressionAttributeValues: {
             
              ":a": director,
              ":b": distance,
              ":c": publicationdate,
              ":d": actor,
              ":e": typemovie,
              ":l": country,
              ":g": posterimage,
              ":h": trailer,
              ":i": content,
              ":k":title,
              ":f":producer
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
              imgname = "";
              return res.redirect("/pageadmin");
            }
          });    
        }
      });
    }
  })
 }else{
   return false; //ERR 500
 }

  //Hướng phát triển: Sau này nếu member update trong trường hợp bài viết đã được approve .Khi update lại sẽ tạo ra 1 bản mới và 1 bản củ để admin lựa chọn dữ lại bản củ hay lấy bản mới.
})
// =================Delete Create Admin====================== role =3
router.post("/delete-create-movie-admin", function (req, res, next) {
  if(CheckLogin(3,res,req)){
    var id = req.body.id;
      var role = req.session.passport.user.role;
      if (role > 2) {
        var params = {
          TableName: "Movies",
          Key: {
            id: id
          }
        };

        docClient.delete(params, function (err, data) {
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
  }else
  {
    return false; //ERR 500;
  }
});
// ==========================================================


//  ===========List Movie of Member writed===============role =2
router.get("/get-list-writed-member", function (req, res, next) {
 if(CheckLogin(2,res,req)){
  var email = req.session.passport.user.email;
  var params = {
    TableName: "Movies",
    // ProjectionExpression: "#status",
    FilterExpression: "(#stt<=:stt) AND (process.registion.register[1]=:email)",
    ExpressionAttributeNames: {
      "#stt": "stt"
    },
    ExpressionAttributeValues: {
      ":stt": 3,
      ":email": email
    }
    // Limit: 30
  };
  docClient.scan(params, function (error, data) {
    if (error) {
      console.error(
        "Unable to query. Error:",
        JSON.stringify(error, null, 2)
      );
    } else {
      res.render("../views/movies/list-movie-member-writed.ejs", { data });
    }
  });
 }else
 {
   return false; //ERR 500
 }
})
// ==========Get all movie for Admin list manager======== role=3
router.get("/get-list-movie-admin", function (req, res, next) {
if(CheckLogin(3,res,req)){
  var email = req.session.passport.user.email;
  var params = {
    TableName: "Movies"
  };
  docClient.scan(params, function (error, data) {
    if (error) {
      console.error(
        "Unable to query. Error:",
        JSON.stringify(error, null, 2)
      );
    } else {
      res.render("../views/movies/manager-movie-admin.ejs", { data });
    }
  });
}else
{
  return false; //ERR 500
}
})
// ======================================================
// >>>>>>> Stashed changes
// =======================================================


// =========== Comment=================================== chua test=== function rating and comment for user ... and developing
// router.post("/comment-movie", function(res,req,next){
//   var movie_id=req.body.id;
//   var start=req.body.rating;
//   var title_cmt=req.body.title_cmt;
//   var content_cmt=req.body.content_
//})
// ======================================================
module.exports = router;
