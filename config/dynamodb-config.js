module.exports = {
  isDev: true,
  localConfig: {
    region: "us-west-2",
    endpoint: "http://localhost:8000"
  },
  onlineConfig: {
    region: "us-west-2",
    endpoint: "dynamodb.us-west-2.amazonaws.com",

    accessKeyId: "AKIAJ7UU6INTSMSYUCMQ",
    secretAccessKey: "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"
  },

  address: "http://moviesinfo.us-west-2.elasticbeanstalk.com"
};
