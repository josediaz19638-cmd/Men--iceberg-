import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'Tamaños', 'Sabores', 'Cervezas', 'Micheladas', 'Cocteles', 'Tragos', 
  'Otras bebidas', 'Peceras', 'Vaper'
];

export default function AdminView() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tamaños');
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Form states
  const [newSabor, setNewSabor] = useState({ name: '', licor: 'Sin licor' });
  const [newGeneral, setNewGeneral] = useState({ name: '', price: 0 });

  useEffect(() => {
    if (localStorage.getItem('iceberg_admin_auth') === 'true') {
      setIsAuthenticated(true);
      fetchProducts();
    } else {
      setLoading(false);
    }
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

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('iceberg_admin_auth', 'true');
      fetchProducts();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const showNotification = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  };

  const updateProduct = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
      showNotification('Cambio guardado');
    } catch (error) {
      console.error(error);
      alert('Error al guardar en Supabase');
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      setProducts(products.map(p => p.id === id ? { ...p, available: !currentStatus } : p));
      showNotification(!currentStatus ? 'Disponible' : 'Agotado');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar disponibilidad');
    }
  };

  const addProduct = async (e, customData) => {
    e.preventDefault();
    if (!customData.name.trim()) return;

    // Prevent duplicate sabores (case-insensitive)
    if (activeTab === 'Sabores') {
      const exists = products.some(p => p.category === 'Sabores' && p.name && p.name.trim().toLowerCase() === customData.name.trim().toLowerCase());
      if (exists) {
        showNotification('Ese sabor ya existe');
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          category: activeTab,
          ...customData,
          available: true
        }])
        .select();
        
      if (error) throw error;
      if (data) {
        setProducts([...products, data[0]]);
        showNotification('Agregado con éxito');
        setNewSabor({ name: '', licor: 'Sin licor' });
        setNewGeneral({ name: '', price: 0 });
      }
    } catch (error) {
      console.error(error);
      alert('Error al agregar a Supabase. Asegúrate de haber creado la tabla.');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', confirmDelete);
        
      if (error) throw error;
      setProducts(products.filter(p => p.id !== confirmDelete));
      showNotification('Eliminado correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al eliminar');
    } finally {
      setConfirmDelete(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Conectando a la nube...</div>;

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <form onSubmit={handleLogin} className="glass" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>ICEBERG Admin</h2>
          <input 
            type="password" className="input" placeholder="Contraseña (admin123)" 
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Entrar</button>
        </form>
      </div>
    );
  }

  let filteredProducts = products.filter(p => p.category === activeTab);
  if (filter === 'available') filteredProducts = filteredProducts.filter(p => p.available);
  if (filter === 'soldout') filteredProducts = filteredProducts.filter(p => !p.available);
  if (searchQuery.trim()) filteredProducts = filteredProducts.filter(p => p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const availableCount = filteredProducts.filter(p => p.available).length;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: '100vh', padding: '20px', backgroundColor: 'var(--color-bg)' }}>
      <header className="container header" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="Logo Iceberg" style={{ height: '40px', width: 'auto' }} />
          <div className="logo" style={{ fontSize: '24px' }}>ICEBERG ADMIN</div>
        </div>
        <button onClick={() => {
          localStorage.removeItem('iceberg_admin_auth');
          setIsAuthenticated(false);
          navigate('/');
        }} className="btn btn-gray" style={{ fontSize: '12px' }}>Cerrar Sesión</button>
      </header>

      {message && (
        <div style={{ 
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-secondary)', color: 'var(--color-bg)', padding: '10px 25px', 
          borderRadius: '30px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
          {message}
        </div>
      )}

      <div className="container" style={{ maxWidth: '1000px', padding: 0 }}>
        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '10px', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat} onClick={() => setActiveTab(cat)}
              className={`btn ${activeTab === cat ? 'btn-primary' : 'btn-gray'}`}
              style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2 style={{ fontSize: '20px' }}>{activeTab}</h2>
            <input
              type="text"
              className="input"
              placeholder="Buscar ítem..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '220px' }}
            />
            <select 
              className="btn btn-gray" style={{ fontSize: '12px', padding: '5px 15px', borderRadius: '20px' }}
              value={filter} onChange={e => setFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="soldout">Agotados</option>
            </select>
          </div>
          <span style={{ fontSize: '13px', opacity: 0.7 }}>
            {availableCount} de {filteredProducts.length} mostrados
          </span>
        </div>

        {activeTab === 'Sabores' ? (
          <form onSubmit={e => addProduct(e, { name: newSabor.name, licor: newSabor.licor, price: 0 })} className="glass" style={{ padding: '20px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '11px', display: 'block', marginBottom: '5px', opacity: 0.7 }}>Nombre</label>
              <input type="text" className="input" value={newSabor.name} onChange={e => setNewSabor({...newSabor, name: e.target.value})} placeholder="Ej. Mango" />
            </div>
            <div>
              <label style={{ fontSize: '11px', display: 'block', marginBottom: '5px', opacity: 0.7 }}>Licor</label>
              <input type="text" className="input" value={newSabor.licor} onChange={e => setNewSabor({...newSabor, licor: e.target.value})} placeholder="Ej. Smirnoff" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 25px' }}>Agregar</button>
          </form>
        ) : (
          <form onSubmit={e => addProduct(e, { name: newGeneral.name, price: Number(newGeneral.price) })} className="glass" style={{ padding: '20px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '11px', display: 'block', marginBottom: '5px', opacity: 0.7 }}>Nuevo Ítem</label>
              <input type="text" className="input" value={newGeneral.name} onChange={e => setNewGeneral({...newGeneral, name: e.target.value})} placeholder="Nombre del ítem" />
            </div>
            <div>
              <label style={{ fontSize: '11px', display: 'block', marginBottom: '5px', opacity: 0.7 }}>Precio ($)</label>
              <input type="number" className="input" style={{ width: '110px' }} value={newGeneral.price} onChange={e => setNewGeneral({...newGeneral, price: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 25px' }}>Agregar</button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredProducts.map(product => (
            <div key={product.id} className="glass" style={{ padding: '12px 15px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: 0 }}>
                <input 
                  className="input" style={{ border: 'none', background: 'transparent', padding: '5px', fontSize: '15px', flexGrow: 1, minWidth: 0 }}
                  defaultValue={product.name}
                  onBlur={(e) => updateProduct(product.id, { name: e.target.value })}
                />
                {activeTab === 'Sabores' && (
                  <input 
                    className="input" style={{ border: 'none', background: 'transparent', padding: '5px', color: 'var(--color-secondary)', width: '100px', fontSize: '13px' }}
                    defaultValue={product.licor || 'Sin licor'}
                    onBlur={(e) => updateProduct(product.id, { licor: e.target.value })}
                  />
                )}
              </div>

              {activeTab !== 'Sabores' && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ opacity: 0.4, marginRight: '2px', fontSize: '14px' }}>$</span>
                  <input 
                    type="number" className="input" style={{ width: '85px', border: 'none', background: 'rgba(255,255,255,0.05)', textAlign: 'right', padding: '8px' }}
                    defaultValue={product.price}
                    onBlur={(e) => updateProduct(product.id, { price: Number(e.target.value) })}
                  />
                </div>
              )}

              <button 
                onClick={() => toggleAvailability(product.id, product.available)}
                className={`btn ${product.available ? 'badge-success' : 'badge-danger'}`}
                style={{ minWidth: '100px', padding: '8px', borderRadius: '8px', color: 'white', fontWeight: 'bold', border: 'none', fontSize: '12px' }}
              >
                {product.available ? 'Disponible' : 'Agotado'}
              </button>

              <button 
                onClick={() => setConfirmDelete(product.id)}
                className="btn" style={{ background: 'transparent', border: '1px solid rgba(230,57,70,0.2)', color: 'var(--color-danger)', padding: '8px 12px', fontSize: '12px' }}
              >
                ✕
              </button>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.4, fontSize: '14px' }}>No hay ítems para mostrar.</div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="glass" style={{ width: '90%', maxWidth: '350px', padding: '30px', textAlign: 'center', border: '1px solid var(--color-primary)' }}>
            <h3 style={{ marginBottom: '15px' }}>¿Eliminar ítem?</h3>
            <p style={{ opacity: 0.7, fontSize: '14px', marginBottom: '25px' }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDelete(null)} className="btn btn-gray" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={handleDeleteConfirmed} className="btn btn-primary" style={{ flex: 1, backgroundColor: 'var(--color-danger)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
