import { Handler } from '@netlify/functions';
import { handleStripeWebhook } from '../stripe-webhook-handler';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const signature = event.headers['stripe-signature'];
  
  if (!signature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing stripe-signature header' }),
    };
  }

  const result = await handleStripeWebhook(event.body || '', signature);

  if (result.success) {
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: result.error }),
    };
  }
};
