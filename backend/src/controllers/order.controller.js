const supabase = require('../config/supabase');

const createOrder = async (req, res) => {
  const { user_id, items, total_price } = req.body;
  // items = [{ product_id, quantity }]
  if (!user_id || !items || !total_price)
    return res.status(400).json({ error: 'user_id, items, and total_price are required' });

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{ user_id, total_price, status: 'pending' }])
    .select()
    .single();
  if (orderError) return res.status(500).json({ error: orderError.message });

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
  }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) return res.status(500).json({ error: itemsError.message });

  // Clear user's cart
  await supabase.from('cart').delete().eq('user_id', user_id);

  res.status(201).json({ message: 'Order placed successfully', order });
};

const getOrders = async (req, res) => {
  const { user_id } = req.query;
  let query = supabase.from('orders').select('*, order_items(*, products(*))');
  if (user_id) query = query.eq('user_id', user_id);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

const updateOrder = async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

module.exports = { createOrder, getOrders, updateOrder };
