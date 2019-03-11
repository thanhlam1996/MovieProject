var express = require('express');
var router = express.Router();
var AWS = require("aws-sdk");
var uuid4 = require('uuid4');
var dateFormat = require('dateformat');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
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
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});
AWS.config.accessKeyId = "AKIAJ7WBBCXAAFKR4RLA";
AWS.config.secretAccessKey = "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";
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
    docClient.query(params, function (err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            if (data.Count > 0) {
                return false;
            }
            else {
                return true;
            }

        }
    });
}


// ================Multer==============
var imgname="";//Bien khai bao static chua ten anh bia
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
        imgname+=file.fieldname + '-' + Date.now()+file.originalname;
      cb(null, imgname)
    }
});
var upload = multer({storage: storage});
// ====================================
router.post("/createmovie", function (req, res, next) {
    if (req.session.email.role == 4) {
        if (req.body.title instanceof Array) {
            for (var i = 0; i < req.body.title.length; i++) {
                // console.log(req.body.title[i] + "====" + req.body.producer[i] + "====" + req.body.deadline[i])
                var id = createID();
                var params = {
                    TableName: "Movies",
                    Item: {
                        "id": id,
                        "title": req.body.title[i],
                        "producer": req.body.producer[i],
                        "deadline": req.body.deadline[i],
                        "stt": 4,
                        "creater": req.session.email.fullname,
                        "emailcreater": req.session.email.email
                    }
                };
                docClient.put(params, function (err, data) {
                    if (err) {
                        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        //  return res.redirect("/getlistregister");
                    }
                });

            }
            // console.log(params)
            return res.redirect("/getlistregister");
        }
        else {
            var id = createID();
            var params = {
                TableName: "Movies",
                Item: {
                    "id": id,
                    "title": req.body.title,
                    "producer": req.body.producer,
                    "deadline": req.body.deadline,
                    "stt": 4,
                    "creater": req.session.email.fullname,
                    "emailcreater": req.session.email.email
                }
            };
            docClient.put(params, function (err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    return res.redirect("/getlistregister");
                }
            });
        }

    }
    else {
        return false;
    }
});
// =========Register movie=========
router.post("/registermoviewriter", function (req, res, next) {
    var id = req.body.id;
    var email = req.session.email.email;
    var fullname = req.session.email.fullname;
    var now = new Date();
    var registiondate = dateFormat(now, "isoDate");
    var title = req.body.title;
    var params = {
        TableName: "Movies",
        Key: {
            "id": id,
            "title": title
        },
        UpdateExpression: "set stt=:st, writer=:wr, writeremail=:email, registiondate=:reg",
        ExpressionAttributeValues: {
            ":st": 3,
            ":wr": fullname,
            ":email": email,
            ":reg": registiondate
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            return res.send(true);
        }
    });
})
// =========Register movie=========
// =========Writing Movie of writer===============
router.post("/submitmovie",upload.single('posterimage'),function(req,res,next){
    var title=req.body.title;
    var id=req.body.id;
    var director=req.body.director;
    var distance=req.body.distance;
    var publicationdate=req.body.publicationdate;
    var actor=req.body.actor;
    var typemovie=req.body.typemovie;
    var country=req.body.country;
    var posterimage=imgname;
    var trailer=req.body.trailer;
    var content=req.body.content;
    var now = new Date();
    var dateofwrite = dateFormat(now, "isoDate");
    var params = {
        TableName: "Movies",
        Key: {
            "id": id,
            "title": title
        },
        UpdateExpression: "set stt=:st, director=:a, distance=:b, publicationdate=:c, actor=:d, typemovie=:e, posterimage=:g, trailer=:h, content=:i, dateofwrite=:j, country=:l",
        ExpressionAttributeValues: {
            ":st": 2,
            ":a":director,
            ":b":distance,
            ":c":publicationdate,
            ":d":actor,
            ":e":typemovie,
            ":l":country,
            ":g":posterimage,
            ":h":trailer,
            ":i":content,
            ":j":dateofwrite

        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            return res.redirect("/getlistregister");
            imgname="";
        }
    });
})
// ================Approved=======================
router.post("/approved",function(req,res,next){
    var approver=req.session.email.fullname;
    var approveremail=req.session.email.email;
    var title=req.body.title;
    var id=req.body.id;
    var now = new Date();
    var dateofapproved = dateFormat(now, "isoDate");
    var params = {
        TableName: "Movies",
        Key: {
            "id": id,
            "title": title
        },
        UpdateExpression: "set stt=:st, dateofapproved=:a, approver=:b, approveremail=:c",
        ExpressionAttributeValues: {
            ":st": 1,
            ":a":dateofapproved,
            ":b":approver,
            ":c":approveremail
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            return res.send(true);
        }
    });
})
// =============end Approved======================
// ================Unapprove=======================
router.post("/unapprove",function(req,res,next){
    var unapprover=req.session.email.fullname;
    var unapproveremail=req.session.email.email;
    var title=req.body.title;
    var id=req.body.id;
    var now = new Date();
    var undateofapprove = dateFormat(now, "isoDate");
    var note=req.body.note;
    var params = {
        TableName: "Movies",
        Key: {
            "id": id,
            "title": title
        },
        UpdateExpression: "set note=:note, unapprover=:a, unapproveremail=:b, undateofapprove=:c",
        ExpressionAttributeValues: {
            ":note": note,
            ":a":unapprover,
            ":b":unapproveremail,
            ":c":undateofapprove
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            return res.send(true);
        }
    });
})
// =============end Unapprove======================
// ================Delete Movie=======================
router.post("/deletemovie",function(req,res,next){
    var title=req.body.title;
    var id=req.body.id;
    var role=req.session.email.role;
    if(role>2)
    {
        var params = {
            TableName: "Movies",
            Key: {
                "id": id,
                "title": title
            }
        };
        docClient.delete(params, function (err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                return res.send(true);
            }
        });
    }
    else
    {
        return res.send("ERROR ROLE UNVALID");
    }
})
// =============End delete movie======================
// =============Unregister============================
router.post("/unregistermoviewriter", function (req, res, next) {
    var id = req.body.id;
    var unemail = req.session.email.email;
    var unfullname = req.session.email.fullname;
    var now = new Date();
    var unregistiondate = dateFormat(now, "isoDate");
    var title = req.body.title;
  
    var params = {
        TableName: "Movies",
        Key: {
            "id": id,
            "title": title
        },
        UpdateExpression: "set stt=:st, unwriter=:wr, unwriteremail=:email, unregistiondate=:reg",
        ExpressionAttributeValues: {
            ":st": 4,
            ":wr": unfullname,
            ":email": unemail,
            ":reg": unregistiondate
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            return res.send(true);
        }
    });
})
// =============End Unregister============================
// ==========Update Movie Member==========================
router.post("/update-movie-member",upload.single('posterimage'),function(req,res,next){
    var title=req.body.title;
    var id=req.body.id;
    var director=req.body.director;
    var distance=req.body.distance;
    var publicationdate=req.body.publicationdate;
    var actor=req.body.actor;
    var typemovie=req.body.typemovie;
    var country=req.body.country;
    var posterimage=imgname;
    var trailer=req.body.trailer;
    var content=req.body.content;
    var now = new Date();
    var dateofwrite = dateFormat(now, "isoDate");
    if(imgname=="")
    {
        var params = {
            TableName: "Movies",
            Key: {
                "id": id,
                "title": title
            },
            UpdateExpression: "set stt=:st, director=:a, distance=:b, publicationdate=:c, actor=:d, typemovie=:e, trailer=:h, content=:i, dateofwrite=:j, country=:l",
            ExpressionAttributeValues: {
                ":st": 2,
                ":a":director,
                ":b":distance,
                ":c":publicationdate,
                ":d":actor,
                ":e":typemovie,
                ":l":country,
                ":h":trailer,
                ":i":content,
                ":j":dateofwrite
    
            },
            ReturnValues: "UPDATED_NEW"
        };
    }
    else
    {
        var params = {
            TableName: "Movies",
            Key: {
                "id": id,
                "title": title
            },
            UpdateExpression: "set stt=:st, director=:a, distance=:b, publicationdate=:c, actor=:d, typemovie=:e, posterimage=:g, trailer=:h, content=:i, dateofwrite=:j, country=:l",
            ExpressionAttributeValues: {
                ":st": 2,
                ":a":director,
                ":b":distance,
                ":c":publicationdate,
                ":d":actor,
                ":e":typemovie,
                ":l":country,
                ":g":posterimage,
                ":h":trailer,
                ":i":content,
                ":j":dateofwrite
    
            },
            ReturnValues: "UPDATED_NEW"
        };
    }
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            return res.redirect("/getlistregister");
            imgname="";
        }
    });
})
// =======================================================
module.exports = router;