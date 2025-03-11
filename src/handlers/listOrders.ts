import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:8000' : undefined,
  region: process.env.IS_OFFLINE ? 'localhost' : 'us-east-1',
  accessKeyId: process.env.IS_OFFLINE ? 'fakeKeyId' : undefined,
  secretAccessKey: process.env.IS_OFFLINE ? 'fakeSecretKey' : undefined,
});

export const handler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const result = await dynamodb.scan({
      TableName: process.env.TABLE_NAME!,
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error listing orders', error }),
    };
  }
};