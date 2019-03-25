var AWS = require("AWS-sdk");
var fs = require("fs");
var dynamoDbConfig = require("../config/dynamodb-config");

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

console.log("Importing cars into DynamoDB. Please wait...");

var allcar = JSON.parse(fs.readFileSync("../data/movies.json", "utf-8"));
allcar.forEach(function(m) {
  var params = {
    TableName: "Movies",
    Item: {
    id:"movie01",
    title:"Titanic",
    stt:1,
    process:{
      create:{
        creater:["Thanh Lam","lam.truong1996@gmail.com"],
        initdate:"19-03-2019",
        deadline:"30-03-2019",
        createnote:"Thay đổi sẽ thành công"
      },
      registion:{
        register:["Van Hieu","hieuabc@gmail.com"],
        registiondate:"20-03-2019"
      },
      approve:{
        submitiondate:"22-03-2019",
        approver:["Thanh Lam","lam.truong1996@gmail.com"],
        dateofapprove:"24-03-2019",
        complaint:"Sắp rớt môn..."
      }
    },
    info:{
        movietype:["Hài", "Gia đình","Tình cảm"],
        actor:["Thanh Lam", "Van Hieu"],
        director:"Nhất Trung",
        producer:"NT Studio",
        country:"Việt Nam",
        distance: 90,
        posterimage:"url_aaaaa",
        trailer:"l8vTMxuvz6Y",
        content:"ádlkjasoldjhasldjlasdjlasdjlasgsxgbfclhdsgfhsxbfcjhjsdgfjhsdgfjhsdgfljh",
        publicationdate:"17/02/2019"
    }
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to add car",
        m.id,
        " .Error Json: ",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("PutItem succeeded: ", m.title);
    }
  });
});
