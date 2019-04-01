var AWS = require("AWS-sdk");
var fs = require("fs");
var dynamoDbConfig = require("../config/dynamodb-config");

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

console.log("Importing cars into DynamoDB. Please wait...");

var allcar = JSON.parse(fs.readFileSync("../data/movies.json", "utf-8"));

allcar.forEach(function(m) {
  var params = {
    TableName: "Movies",
    Item: m
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
