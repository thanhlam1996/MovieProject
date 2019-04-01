module.exports = {
  isDev: false,
  localConfig: {
    region: "us-west-2",
    endpoint: "http://localhost:8000",
    accessKeyId: "AKIAII56X4EHJSADC2KA",
    secretAccessKey: "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"
  },
  onlineConfig: {
    region: "us-west-2",
    endpoint: "dynamodb.us-west-2.amazonaws.com",
    accessKeyId: "AKIAVGUQY2NNBJRQE774",
    secretAccessKey: "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"
  },
  address: "http://moviesinfo.us-west-2.elasticbeanstalk.com",
  bucketName:"movies-project-bucket"
};
