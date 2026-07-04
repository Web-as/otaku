import { Handler } from '@netlify/functions';
import { createCheckoutSession } from '../stripe-webhook-handler';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, userEmail, purchaseType } = body;

    if (!userId || !userEmail || !purchaseType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const session = await createCheckoutSession(userId, userEmail, purchaseType);

    return {
      statusCode: 200,
      body: JSON.stringify(session),
    };
  } catch (error) {
    const err = error as Error;
    console.error('Error creating checkout session:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
