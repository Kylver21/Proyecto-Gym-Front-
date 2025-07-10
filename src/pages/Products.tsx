import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import ConfirmDialog from '../components/Common/ConfirmDialog';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    productId: number | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: '',
  });

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockProducts: Product[] = [
        {
          id: 1,
          nombre: 'Proteína Whey',
          descripcion: 'Suplemento proteico de alta calidad',
          precio: 45.00,
          stock: 25
        },
        {
          id: 2,
          nombre: 'Creatina',
          descripcion: 'Creatina monohidrato para rendimiento',
          precio: 25.00,
          stock: 15
        },
        {
          id: 3,
          nombre: 'BCAA',
          descripcion: 'Aminoácidos de cadena ramificada',
          precio: 35.00,
          stock: 20
        },
        {
          id: 4,
          nombre: 'Pre-entreno',
          descripcion: 'Suplemento pre-entreno con cafeína',
          precio: 30.00,
          stock: 10
        },
        {
          id: 5,
          nombre: 'Multivitamínico',
          descripcion: 'Complejo vitamínico y mineral',
          precio: 20.00,
          stock: 30
        }
      ];
      setProducts(mockProducts);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
      };

      if (editingProduct) {
        // Update product
        const updatedProduct = { ...editingProduct, ...productData };
        setProducts(products.map(product => 
          product.id === editingProduct.id ? updatedProduct : product
        ));
      } else {
        // Create new product
        const newProduct: Product = {
          id: Math.max(...products.map(p => p.id)) + 1,
          ...productData,
        };
        setProducts([...products, newProduct]);
      }
      
      resetForm();
    } catch (err) {
      setError('Error al guardar el producto');
      console.error('Error saving product:', err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio.toString(),
      stock: product.stock.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = (product: Product) => {
    setConfirmDialog({
      isOpen: true,
      productId: product.id,
      productName: product.nombre,
    });
  };

  const confirmDelete = async () => {
    if (confirmDialog.productId) {
      try {
        setProducts(products.filter(product => product.id !== confirmDialog.productId));
        setConfirmDialog({ isOpen: false, productId: null, productName: '' });
      } catch (err) {
        setError('Error al eliminar el producto');
        console.error('Error deleting product:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Agregar Producto</span>
        </button>
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{product.nombre}</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{product.descripcion}</p>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-green-600">
                ${product.precio.toFixed(2)}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                product.stock > 10 
                  ? 'bg-green-100 text-green-800' 
                  : product.stock > 0 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                Stock: {product.stock}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Proteína Whey"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe el producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (USD)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="45.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="25"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, productId: null, productName: '' })}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro de que deseas eliminar el producto "${confirmDialog.productName}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Products;