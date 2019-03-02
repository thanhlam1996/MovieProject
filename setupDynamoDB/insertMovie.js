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

var allcar = JSON.parse(fs.readFileSync("../data/movies.json", "utf-8"));
allcar.forEach(function (m) {
    var params = {
        TableName: "Movies",
        Item: {
            "id":m.id,
            "title":m.title,
            "type":m.type,
            "actor":m.actor,
            "director":m.director,
            "producer":m.producer,
            "country":m.country,
            "distance": m.distance,
            "releasedate":m.releasedate,
            "posterimage":m.posterimage,
            "trailer":m.trailer,
            "content":m.content,
            "author":m.content,
            "publicationdate":m.publicationdate,
            "status":m.status,
            "comment":m.comment,
            "like":m.like,
            "countview":m.countview
        }
    };
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add car", m.id, " .Error Json: ", JSON.stringify(err, null, 2));
        }
        else {
            console.log("PutItem succeeded: ", m.title);
        }
    });
});