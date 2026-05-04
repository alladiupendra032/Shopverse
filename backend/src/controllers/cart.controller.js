const supabase = require('../config/supabase');

const getCart = async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const { data, error } = await supabase
    .from('cart')
    .select('*, products(*)')
    .eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

const addToCart = async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  if (!user_id || !product_id || !quantity)
    return res.status(400).json({ error: 'user_id, product_id, and quantity are required' });

  // If product already in cart, increment quantity
  const { data: existing } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', user_id)
    .eq('product_id', product_id)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('cart')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  const { data, error } = await supabase
    .from('cart')
    .insert([{ user_id, product_id, quantity }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

const removeFromCart = async (req, res) => {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Item removed from cart' });
};

module.exports = { getCart, addToCart, removeFromCart };
