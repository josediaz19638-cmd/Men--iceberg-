import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const CATEGORY_ORDER = [
  'Tamaños', 'Sabores', 'Cervezas', 'Micheladas', 'Cocteles', 'Tragos', 
  'Otras bebidas', 'Peceras', 'Vaper'
];

export default function ClientView() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tamaños');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setProducts(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    let filtered = products.filter(p => p.category === selectedCategory);
    if (selectedCategory === 'Sabores') filtered = filtered.filter(p => p.available);
    if (search.trim()) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      <header className="container header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo.png" alt="Logo Iceberg" style={{ height: '60px', width: 'auto' }} />
          <div className="logo">ICEBERG</div>
        </div>
      </header>
      <div className="container">
        <div style={{ marginBottom: '30px' }}>
          <input type="text" className="input" placeholder="Buscar en el menú..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: '20px' }} />
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
            {CATEGORY_ORDER.map(cat => (
              <button key={cat} className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-gray'}`} style={{ whiteSpace: 'nowrap', borderRadius: '25px' }} onClick={() => setSelectedCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Cargando menú desde la nube...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {getFilteredProducts().map(product => (
              <div key={product.id} className="glass product-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '18px', margin: 0 }}>{product.name}{product.category === 'Sabores' && product.licor && (<span style={{ display: 'block', fontSize: '13px', color: 'var(--color-secondary)', fontWeight: 'normal', marginTop: '4px' }}>({product.licor})</span>)}</h3>
                  <span className={`badge ${product.available ? 'badge-success' : 'badge-danger'}`}>{product.available ? 'Disponible' : 'Agotado'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>{product.price > 0 ? `$${Number(product.price).toLocaleString()}` : (product.category === 'Tamaños' ? '$0' : '')}</span>
                  <button className="btn btn-gray" style={{ fontSize: '12px' }}>Ir a barra para ordenar</button>
                </div>
              </div>
            ))}
            {getFilteredProducts().length === 0 && (<div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>No hay productos disponibles en esta categoría.</div>)}
          </div>
        )}
      </div>
      <footer style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)', marginTop: '40px' }}>
        <p style={{ fontWeight: '500' }}>Debes ir a barra para ordenar</p>
      </footer>
    </div>
  );
}
