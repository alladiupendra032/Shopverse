import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useProduct — fetches a single product by ID
 * @param {string} id - product UUID
 */
const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        setError('Product not found');
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetch();
  }, [id]);

  return { product, loading, error };
};

export default useProduct;
