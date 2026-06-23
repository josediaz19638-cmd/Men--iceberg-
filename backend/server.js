const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const dataFile = path.join(__dirname, 'products.json');

app.use(cors());
app.use(express.json());

// Helper function to read data
const readData = () => {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products.json:', error);
    return { products: [] };
  }
};

// Helper function to write data
const writeData = (data) => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to products.json:', error);
  }
};

// GET /api/products
app.get('/api/products', (req, res) => {
  const data = readData();
  res.json(data.products);
});

// POST /api/products
app.post('/api/products', (req, res) => {
  const data = readData();
  const newProduct = {
    ...req.body,
    id: `${req.body.category[0].toLowerCase()}${Date.now()}`,
    available: req.body.available ?? true,
    updatedAt: new Date().toISOString()
  };
  data.products.push(newProduct);
  writeData(data);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  const index = data.products.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  data.products[index] = {
    ...data.products[index],
    ...req.body,
    id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };

  writeData(data);
  res.json(data.products[index]);
});

// PATCH /api/products/:id/availability
app.patch('/api/products/:id/availability', (req, res) => {
  const { id } = req.params;
  const { available } = req.body;
  const data = readData();
  const index = data.products.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  if (typeof available !== 'boolean') {
    return res.status(400).json({ error: 'El campo available debe ser un booleano' });
  }

  data.products[index].available = available;
  data.products[index].updatedAt = new Date().toISOString();

  writeData(data);
  res.json(data.products[index]);
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  const initialLength = data.products.length;
  
  data.products = data.products.filter(p => p.id !== id);
  
  if (data.products.length === initialLength) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  writeData(data);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
