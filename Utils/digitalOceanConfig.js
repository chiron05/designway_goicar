const dotenv = require('dotenv')
dotenv.config()
const AWS = require("aws-sdk");
var fs = require('fs');
const s3 = new AWS.S3({
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
    endpoint: process.env.DO_SPACES_ENDPOINT,
    // s3BucketEndpoint: false,
    // signatureVersion: 'v4'
});


function setDigitalOceanSpaceConfig() {
    AWS.config.update({
        endpoint: 'https://nyc3.digitaloceanspaces.com',
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET,
        region: process.env.DO_SPACES_ENDPOINT
    });
}

const uploadToS3 = (file, fieldname) => {
    const params = {
      ACL: 'public-read',
      Bucket: process.env.DO_SPACES_NAME,
      Body: fs.createReadStream(file.path),
      Key: `${fieldname}/${file.originalname}`
    };
  
    return s3.upload(params).promise();
  };
  



module.exports = {
    setDigitalOceanSpaceConfig,
    uploadToS3

};

