var AWS = require("aws-sdk");
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
var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "Accounts",
    KeySchema: [       
        { AttributeName: "id", KeyType: "HASH"}  //Partition key
    ],
    AttributeDefinitions: [       
        { AttributeName: "id", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(params, function(err, data) {
  if (err) {
    console.error(
      "Unable to create table. Error JSON:",
      JSON.stringify(err, null, 2)
    );
  } else {
    console.log(
      "Created table. Table description JSON:",
      JSON.stringify(data, null, 2)
    );
  }
});
