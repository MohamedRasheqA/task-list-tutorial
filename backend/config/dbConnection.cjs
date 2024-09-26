const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
require('dotenv').config(); // Load environment variables from .env

// Configure AWS SDK
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

const connectDb = async () => {
  try {
    const command = new ScanCommand({
      TableName: 'Contacts',
      Limit: 1
    });

    await docClient.send(command);
    console.log('Connected to DynamoDB');
  } catch (err) {
    console.error('Error connecting to DynamoDB:', err.message);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = { docClient, connectDb };