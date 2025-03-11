import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../types/order';

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:8000' : undefined,
  region: process.env.IS_OFFLINE ? 'localhost' : 'us-east-1',
  accessKeyId: process.env.IS_OFFLINE ? 'fakeKeyId' : undefined,
  secretAccessKey: process.env.IS_OFFLINE ? 'fakeSecretKey' : undefined,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { customerName, coffeeType } = JSON.parse(event.body || '{}');
    console.log(customerName, coffeeType);
    if (!customerName || !coffeeType) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing required fields' }) };
    }

    const order: Order = {
      orderId: uuidv4(),
      customerName,
      coffeeType,
      createdAt: new Date().toISOString(),
    };

    console.log('TABLE_NAME:', process.env.TABLE_NAME);

    await dynamodb.put({
      TableName: process.env.TABLE_NAME!,
      Item: order,
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify(order),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating order', error }),
    };
  }
};