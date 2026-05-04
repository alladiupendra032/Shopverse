import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useProducts — fetches product list from Supabase with optional filters
 * @param {object} filters - { category, search, minPrice, maxPrice, minRating, sortBy }
 */
const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [categories, setCategories] = useState([]);

  const { category, search, minPrice, maxPrice, minRating, sortBy } = filters;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Filters
      if (category) query = query.eq('category', category);
      if (search)   query = query.ilike('name', `%${search}%`);
      if (minPrice !== undefined) query = query.gte('price', minPrice);
      if (maxPrice !== undefined) query = query.lte('price', maxPrice);
      if (minRating !== null && minRating !== undefined && Number(minRating) > 0)
        query = query.gte('rating', minRating);

      // Sort
      switch (sortBy) {
        case 'price_asc':  query = query.order('price', { ascending: true });  break;
        case 'price_desc': query = query.order('price', { ascending: false }); break;
        case 'rating':     query = query.order('rating', { ascending: false }); break;
        case 'newest':     query = query.order('created_at', { ascending: false }); break;
        default:           query = query.order('created_at', { ascending: false }); break;
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [category, search, minPrice, maxPrice, minRating, sortBy]);

  // Fetch distinct categories for filter sidebar
  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);
    if (data) {
      const unique = [...new Set(data.map((p) => p.category))].sort();
      setCategories(unique);
    }
  }, []);

  useEffect(() => { fetchProducts(); },  [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return { products, loading, error, categories, refetch: fetchProducts };
};

export default useProducts;
