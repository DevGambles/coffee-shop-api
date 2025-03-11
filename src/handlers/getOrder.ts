import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:8000' : undefined,
  region: process.env.IS_OFFLINE ? 'localhost' : 'us-east-1',
  accessKeyId: process.env.IS_OFFLINE ? 'fakeKeyId' : undefined,
  secretAccessKey: process.env.IS_OFFLINE ? 'fakeSecretKey' : undefined,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const orderId = event.pathParameters?.orderId;
  if (!orderId) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Order ID is required' }) };
  }

  try {
    const result = await dynamodb.get({
      TableName: process.env.TABLE_NAME!,
      Key: { orderId },
    }).promise();

    if (!result.Item) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Order not found' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching order', error }),
    };
  }
};