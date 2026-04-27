const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;
  try {
    // Use rawBody if available, otherwise use body
    const rawBody = event.isBase64Encoded 
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
      
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const userId = session.metadata?.userId || session.client_reference_id;
    
    if (userId) {
      const { error } = await supabase.from('subscription_status').upsert({
        user_id: userId,
        is_premium: true,
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString()
      });
      if (error) console.error('Supabase error:', error);
      else console.log('User upgraded to premium:', userId);
    }
  }

  if (stripeEvent.type === 'customer.subscription.deleted') {
    const subscription = stripeEvent.data.object;
    const customerId = subscription.customer;
    const { data } = await supabase
      .from('subscription_status')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    if (data?.user_id) {
      await supabase.from('subscription_status').update({
        is_premium: false
      }).eq('user_id', data.user_id);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
