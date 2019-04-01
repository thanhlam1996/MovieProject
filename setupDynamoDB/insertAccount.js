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

var allcar = JSON.parse(fs.readFileSync("../data/account.json", "utf-8"));
allcar.forEach(function(acc) {
  var params = {
    TableName: "Accounts",
    Item: acc
  };
  docClient.put(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to add car",
        acc.info.email,
        " .Error Json: ",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("PutItem succeeded: ", acc.info.email);
    }
  });
});
