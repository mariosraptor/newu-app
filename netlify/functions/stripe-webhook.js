const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (body.type === 'checkout.session.completed') {
      const session = body.data.object;
      const userId = session.metadata?.userId || session.client_reference_id;
      
      if (userId) {
        const { error } = await supabase.from('subscription_status').upsert({
          user_id: userId,
          is_premium: true,
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString()
        });
        if (error) console.error('Supabase error:', error);
        else console.log('User upgraded:', userId);
      }
    }

    if (body.type === 'customer.subscription.deleted') {
      const customerId = body.data.object.customer;
      const { data } = await supabase
        .from('subscription_status')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();
      if (data?.user_id) {
        await supabase.from('subscription_status')
          .update({ is_premium: false })
          .eq('user_id', data.user_id);
      }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: err.message };
  }
};
