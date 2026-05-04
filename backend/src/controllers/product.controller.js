const supabase = require('../config/supabase');

const getAllProducts = async (req, res) => {
  const { category, search } = req.query;
  let query = supabase.from('products').select('*');

  if (category) query = query.eq('category', category);
  if (search)   query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

const getProductById = async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Product not found' });
  res.json(data);
};

const createProduct = async (req, res) => {
  const { name, description, price, stock, category, image_url } = req.body;
  const { data, error } = await supabase
    .from('products')
    .insert([{ name, description, price, stock, category, image_url }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

const updateProduct = async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

const deleteProduct = async (req, res) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Product deleted successfully' });
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
