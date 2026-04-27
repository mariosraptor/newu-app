const Stripe = require('stripe');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { priceId, userId, userEmail } = JSON.parse(event.body);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: 'https://newu-app.netlify.app?upgraded=true',
      cancel_url: 'https://newu-app.netlify.app',
      metadata: { userId },
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
