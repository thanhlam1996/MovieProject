var AWS = require("aws-sdk");
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
var dynamodb = new AWS.DynamoDB();

var params = {
  TableName: "Accounts"
};

dynamodb.scan(params, function(err, data) {
  if (err) {
    console.error(
      "Unable to scan table. Error JSON:",
      JSON.stringify(err, null, 2)
    );
  } else {
    console.log(
      "Scaning table. Table description JSON:",
      JSON.stringify(data, null, 2)
    );
  }
});
