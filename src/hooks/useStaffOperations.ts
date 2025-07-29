
import { supabase } from '@/integrations/supabase/client';

export const useStaffOperations = () => {
  // Simple operations without any authentication checks since RLS is disabled
  const insertProduct = async (productData: any) => {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateProduct = async (id: string, productData: any) => {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  };

  const insertImportLog = async (logData: any) => {
    const { data, error } = await supabase
      .from('product_import_logs')
      .insert(logData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const bulkInsertProducts = async (products: any[]) => {
    const { data, error } = await supabase
      .from('products')
      .insert(products)
      .select();
    
    if (error) throw error;
    return data;
  };

  const getAllProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  const getImportLogs = async () => {
    const { data, error } = await supabase
      .from('product_import_logs')
      .select('*')
      .order('imported_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  return {
    insertProduct,
    updateProduct,
    deleteProduct,
    insertImportLog,
    bulkInsertProducts,
    getAllProducts,
    getImportLogs
  };
};
