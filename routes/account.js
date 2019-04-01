var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var passport = require("passport");
var passportfb = require("passport-facebook").Strategy;
var ggstrategy = require("passport-google-oauth").OAuth2Strategy;
var localStratery = require("passport-local").Strategy;
var dynamoDbConfig = require("../config/dynamodb-config");
var uuid4 = require("uuid4");
var moment = require('moment');
// =========================Role===========================

// ============
// Account
// Admin=>4
// SubAdmin=>3
// Member=>2
// User=>1

// =====================End role===========================

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
// =======================================================================================================
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

// Create ID:
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
    TableName: "Accounts",
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
// ==========


// ==========Register==============
router.post("/register-account", function (req, res, next) {
  var _id = createID();
  //var _birthday=moment(req.body.birthday).format('DD/MM/YYYY');
  var params = {
    TableName: "Accounts",
    Item: {
      id: _id,
      info: {
        email: req.body.email,
        fullname: req.body.fullname,
        birthday: req.body.birthday,
        sex: req.body.sex,
        adress: req.body.adress,
        phone: req.body.phone
      },
      password: req.body.password,
      role: 4
    }
  };
  docClient.put(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      return res.redirect("/");
    }
  });
});
// =======End Register=============
// ==========Register==============

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/", successRedirect: "/" })
);

passport.use(
  new localStratery(
    {
      usernameField: "email",
      passwordField: "password"
    },
    (email, password, done) => {
      var params = {
        TableName: "Accounts",
        FilterExpression: "info.email=:email AND password=:pass",
        ExpressionAttributeValues: {
          ":email": email,
          ":pass": password
        }
      };
      docClient.scan(params, function (err, user) {
        if (err) {
          console.error(
            "Unable to query. Error:",
            JSON.stringify(err, null, 2)
          );
        } else {
          if (user.Count > 0) {
            var sess = {};
            user.Items.forEach(function (j) {
              sess = {
                email: j.info.email,
                fullname: j.info.fullname,
                role: j.role,
                id: j.id
              };
            })
            return done(null, sess);
          } else {
            return done(null, false);
          }
        }
      });
    }
  )
);
// =======End Register=============
// =======Check Email==============
router.get("/checkemail", function (req, res, next) {
  var _email = req.query.email;
  var params = {
    TableName: "Accounts",
    FilterExpression: "info.email=:email",
    ExpressionAttributeValues: {
      ":email": _email
    }
  };

  docClient.scan(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      if (data.Count > 0) {
        return res.send(false); //ton tai
      } else {
        return res.send(true);
      }
    }
  });
});
// =======End Check Email==========
//========Sign out session==============
router.get("/signout", function (req, res, next) {
  req.session.destroy();
  return res.end();
});

//   =========== LOGIN VS FACEBOOK===============
router.get(
  "/loginfb",
  passport.authenticate("facebook", { scope: ["email"] }),
  function (req, res, next) { }
);
router.get(
  "/loginfb/cb",
  passport.authenticate("facebook", {
    failureRedirect: "/hihi",
    successRedirect: "/"
  })
);

passport.use(
  new passportfb(
    {
      clientID: "257002525186870",
      clientSecret: "994485da2b9a29fe8c80c80bd0d3ea1f",
      callbackURL: dynamoDbConfig.address + "/account/loginfb/cb",
      profileFields: ["email", "name"]
    },
    (accessToken, refreshToken, profile, done) => {
      var _email = "";
      var _id = "FB-" + profile.id;
      profile.emails.forEach(function (i) {
        _email = i.value;
      });

      var _fullname = profile.name.givenName + " " + profile.name.familyName;
      var params = {
        TableName: "Accounts",
        KeyConditionExpression: "id=:id",
        ExpressionAttributeValues: {
          ":id": _id
        }
      };

      docClient.query(params, function (err, user) {
        if (err) {
          console.error(
            "Unable to query. Error:",
            JSON.stringify(err, null, 2)
          );
        } else {
          if (user.Count > 0) {
            return done(null, user);
          } else {
            var param = {
              TableName: "Accounts",
              Item: {
                id: _id,
                role: 1,
                info: {
                  email: _email,
                  fullname: _fullname
                }
              }
            };
            docClient.put(param, function (error, user) {
              if (err) {
                console.error(
                  "Unable to update item. Error JSON:",
                  JSON.stringify(err, null, 2)
                );
              } else {
                return done(null, user);
              }
            });
          }
        }
      });
    }
  )
);
// ==========================End Login Facebook=======================================

// ===============LOGIN VS GG=====================================================

router.get(
  "/logingg",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  function (req, res, next) { }
);

router.get(
  "/logingg/cb",
  passport.authenticate("google", {
    failureRedirect: "/hihi",
    successRedirect: "/"
  })
);

passport.use(
  new ggstrategy(
    {
      clientID:
        "521863593219-huk578luuc200pca4oiv83qh6vkm4gvm.apps.googleusercontent.com",
      clientSecret: "PdlgOMiHdkXTy1lZL7DIQkFT",
      callbackURL: dynamoDbConfig.address + "/account/logingg/cb",
      profileFields: ["email"]
    },
    (accessToken, refreshToken, profile, done) => {
      var _fullname = profile.name.givenName + " " + profile.name.familyName;

      var _email = "";
      var _id = "GG-" + profile.id;
      profile.emails.forEach(function (i) {
        _email = i.value;
      });
      var params = {
        TableName: "Accounts",
        KeyConditionExpression: "id=:id",
        ExpressionAttributeValues: {
          ":id": _id
        }
      };

      docClient.query(params, function (err, user) {
        if (err) {
          console.error(
            "Unable to query. Error:",
            JSON.stringify(err, null, 2)
          );
        } else {
          if (user.Count > 0) {
            return done(null, user);
          } else {
            var param = {
              TableName: "Accounts",
              Item: {
                id: _id,
                role: 1,
                info: {
                  email: _email,
                  fullname: _fullname
                }
              }
            };
            docClient.put(param, function (error, user) {
              if (err) {
                console.error(
                  "Unable to update item. Error JSON:",
                  JSON.stringify(err, null, 2)
                );
              } else {
                return done(null, user);
              }
            });
          }
        }
      });
    }
  )
);
// ===========================END LOGIN VS GG=====================================

// ===============PAssport==================================

// Passport online
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  var _email = user.Items.id;

  var params = {
    TableName: "Accounts",
    KeyConditionExpression: "id=:id",
    ExpressionAttributeValues: {
      ":id": id
    }
  };

  docClient.query(params, function (err, user) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      if (user.Count > 0) {
        var sess = {};
        user.Items.forEach(j)
        {
          sess = {
            email: j.info.email,
            fullname: j.info.fullname,
            role: j.role,
            id: j.id
          };
        }

        return done(null, sess);
      } else {
        return done(null, false);
      }
    }
  });
});
// Passport local

// ===========================================================
// =======================================================================================================
router.get("/admin-decentralization", function (req, res, next) {
  if (CheckLogin(4, res, req)) {
    // var role=req.session.passport.user.role;
    // var id=req.session.passport.user.id;
    var params = {
      TableName: "Accounts"
    };

    docClient.scan(params, function (err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
        // if(role>1){
        return res.render("../views/account/admin-decentralization.ejs", { data })
        // }
      }
    });
  }
  else {
    return false; //ERR 500
  }
})
// ========Delete ACC Admin
router.post("/delete-acc-admin", function (req, res, next) {
  if (CheckLogin(4, res, req)) {
    var id = req.body.id;
    var params = {
      TableName: "Accounts",
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
    return false; //ERR 500
  }
})
// ========================
// ============Change Role Admin==============
router.post("/change-role-admin", function (req, res, next) {
  if (CheckLogin(4, res, req)) {
    var id = req.body.id;
    var role = req.body.role;

    var params = {
      TableName: "Accounts",
      Key: {
        id: id
      },
      UpdateExpression:
        "set #role=:a",
      ExpressionAttributeNames: { "#role": "role" },
      ExpressionAttributeValues: {
        ":a": role
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
  } else {
    return false; //ERR 500
  }
});
// ===========================================


// =============GET DETAIL ACC= ADMIN===============
router.get("/get-acc-detail-admin", function (req, res, next) {
  if (CheckLogin(4, res, req)) {
    var id = req.query.id;
    var params = {
      TableName: "Accounts",
      KeyConditionExpression: "id=:id",
      ExpressionAttributeValues: {
        ":id": id
      }
    };
    docClient.query(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to read item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        return res.send(data);
      }
    });
  } else {
    return false; //ERR 500
  }
});
// ===========================================
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
        return res.render("../views/account/detail-acc-owner.ejs", { data });
      }
    });
  } else {
    return false; //ERR 500
  }
});
// ===========================================
// =============GET DETAIL ACC ALL OBJECT================
router.get("/check-password", function (req, res, next) {
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
        if (data.Count > 0) {
          var oldpass = "";
          data.Items.forEach((i) => {
            oldpass = i.password;
          })
          return res.send(oldpass);
        }
        else {
          return res.send(false);
        }
      }
    });
  } else {
    return false; //ERR 500
  }
});
// ===========================================
// ============Change Role Admin==============
router.post("/change-password", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var id = req.session.passport.user.id;
    //  var oldpass=req.body.oldpass;
    var newpass = req.body.newpass;

    var params = {
      TableName: "Accounts",
      Key: {
        id: id
      },
      UpdateExpression:
        "set #pass=:a",
      ExpressionAttributeNames: { "#pass": "password" },
      ExpressionAttributeValues: {
        ":a": newpass
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
  } else {
    return false; //ERR 500
  }
});
// ===========================================
// ==============UPDATE ACCOUNT===============
// =============GET Update ACC ALL OBJECT================
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
        return res.render("../views/account/update-account.ejs");
      }
    });
  } else {
    return false; //ERR 500
  }
});
// ===========================================
// ==========Update Acc==============
router.post("/update-acc", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var adress = req.body.adress;
    var birthday = req.body.birthday;
    var fullname = req.body.fullname;
    var phone = req.body.phone;
    var sex = req.body.sex;
    var id = req.session.passport.user.id;
    var params = {
      TableName: "Accounts",
      Key: {
        id: id
      },
      UpdateExpression: "set info.adress=:a, info.birthday=:b, info.fullname=:c, info.phone=:d, info.sex=:g",
      ExpressionAttributeValues: {
        ":a": adress,
        ":b": birthday,
        ":c": fullname,
        ":d": phone,
        ":g": sex
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
        return res.send(true);
      }
    });
  } else {
    return false; //ERR 500
  }
});
// =======End Update ACC=============
// ===========================================

module.exports = router;
