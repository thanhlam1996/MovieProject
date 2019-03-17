var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var passport = require("passport");
var passportfb = require("passport-facebook").Strategy;
var ggstrategy = require("passport-google-oauth").OAuth2Strategy;
var localStratery = require("passport-local").Strategy;
var dynamoDbConfig = require("../config/dynamodb-config");
// =========================Role===========================

// ============
// Account
// Admin=>4
// SubAdmin=>3
// Member=>2
// User=>1

// =====================End role===========================

AWS.config.update({
  region: dynamoDbConfig.region,
  endpoint: dynamoDbConfig.endpoint
});
AWS.accessKeyId = dynamoDbConfig.accessKeyId;
AWS.secretAccessKey = dynamoDbConfig.secretAccessKey;
var docClient = new AWS.DynamoDB.DocumentClient();
// =======================================================================================================
// ==========Register==============
router.post("/register-account", function(req, res, next) {
  var params = {
    TableName: "Accounts",
    Item: {
      email: req.body.email,
      fullname: req.body.fullname,
      password: req.body.password,
      birthday: req.body.birthday,
      sex: req.body.sex,
      adress: req.body.adress,
      phone: req.body.phone,
      role: 2
    }
  };
  docClient.put(params, function(err, data) {
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
        KeyConditionExpression: "#user =:email",
        ExpressionAttributeNames: {
          "#user": "email"
        },
        ExpressionAttributeValues: {
          ":email": email
        }
      };
      docClient.query(params, function(err, user) {
        if (err) {
          console.error(
            "Unable to query. Error:",
            JSON.stringify(err, null, 2)
          );
        } else {
          if (user.Count > 0) {
            user.Items.forEach(function(i) {
              if (i.password == password) {
                return done(null, user);
              } else {
                return done(null, false);
              }
            });
          }
        }
      });
    }
  )
);
// =======End Register=============
// =======Check Email==============
router.get("/checkemail", function(req, res, next) {
  var _email = req.query.email;

  var params = {
    TableName: "Accounts",
    KeyConditionExpression: "email=:email",
    ExpressionAttributeValues: {
      ":email": _email
    }
  };

  docClient.query(params, function(err, data) {
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
router.get("/signout", function(req, res, next) {
  req.session.destroy();
  return res.end();
});

//   =========== LOGIN VS FACEBOOK===============
router.get(
  "/loginfb",
  passport.authenticate("facebook", { scope: ["email"] }),
  function(req, res, next) {}
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
      var _id = profile.id;
      profile.emails.forEach(function(i) {
        _email = i.value;
      });

      var _fullname = profile.name.givenName + " " + profile.name.familyName;
      var params = {
        TableName: "Accounts",
        KeyConditionExpression: "email=:email",
        ExpressionAttributeValues: {
          ":email": _id
        }
      };

      docClient.query(params, function(err, user) {
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
                email: _id,
                fullname: _fullname,
                role: 2,
                id: _email
              }
            };
            docClient.put(param, function(error, user) {
              if (err) {
                console.error(
                  "Unable to update item. Error JSON:",
                  JSON.stringify(err, null, 2)
                );
              } else {
                console.log("Mơi tạo xong" + user);
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
  function(req, res, next) {}
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
      var _id = profile.id;
      profile.emails.forEach(function(i) {
        _email = i.value;
      });
      var params = {
        TableName: "Accounts",
        KeyConditionExpression: "email=:email",
        ExpressionAttributeValues: {
          ":email": _id
        }
      };

      docClient.query(params, function(err, user) {
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
                email: _id,
                fullname: _fullname,
                role: 2,
                id: _email
              }
            };
            docClient.put(param, function(error, user) {
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
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  var _email = user.Items.email;

  var params = {
    TableName: "Accounts",
    KeyConditionExpression: "email=:email",
    ExpressionAttributeValues: {
      ":email": _email
    }
  };

  docClient.query(params, function(err, user) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      if (user.Count > 0) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    }
  });
});
// Passport local

// ===========================================================
// =======================================================================================================

module.exports = router;
