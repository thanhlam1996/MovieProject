var aws = require("aws-sdk");
var fs = require("fs");

aws.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"

});
//Access key

aws.config.accessKeyId = "AKIAJ7WBBCXAAFKR4RLA";
aws.config.secretAccessKey = "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";
var docClient = new aws.DynamoDB.DocumentClient();

console.log("Importing cars into DynamoDB. Please wait...");

var allcar = JSON.parse(fs.readFileSync("../data/account.json", "utf-8"));
allcar.forEach(function (acc) {
    var params = {
        TableName: "Accounts",
        Item: {

            "email": acc.email,
            "fullname": acc.fullname,
            "sex": acc.sex,
            "password": acc.password,
            "phone": acc.phone,
            "adress": acc.adress,
            "totalmovies": acc.totalmovies,
            "role": acc.role,
            "movies": acc.movies
        }
    };
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add car", acc.email, " .Error Json: ", JSON.stringify(err, null, 2));
        }
        else {
            console.log("PutItem succeeded: ", acc.email);
        }
    });
});