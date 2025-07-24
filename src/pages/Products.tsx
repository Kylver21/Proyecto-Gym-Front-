import React, { useState, useEffect } from 'react';
import { Product, Membership } from '../types';
import { GymApiService } from '../services/api';
import { Plus, Edit, Trash2, Search, Package, AlertTriangle, CreditCard, Clock, Star, ShoppingCart } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Products: React.FC = () => {
  const { isClient } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'memberships'>('products');
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
    if (isClient) {
      // Para clientes, cargar tanto productos como membresías
      fetchProductsAndMemberships();
    } else {
      // Para admin/empleados, solo productos
      fetchProducts();
    }
  }, [isClient]);

  const fetchProductsAndMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsData, membershipsData] = await Promise.all([
        GymApiService.getProducts(),
        GymApiService.getMemberships()
      ]);
      setProducts(productsData);
      setMemberships(membershipsData);
    } catch (err) {
      setError('Error al cargar la tienda');
      console.error('Error fetching store data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await GymApiService.getProducts();
      setProducts(products);
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
      setLoading(true);
      setError(null);
      
      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
      };

      if (editingProduct) {
        // Update product
        const updatedProduct = await GymApiService.updateProduct(editingProduct.id, productData);
        if (updatedProduct) {
          setProducts(products.map(product => 
            product.id === editingProduct.id ? updatedProduct : product
          ));
        }
      } else {
        // Create product
        const newProduct = await GymApiService.createProduct(productData);
        if (newProduct) {
          setProducts([...products, newProduct]);
        }
      }
      
      resetForm();
    } catch (err) {
      setError(editingProduct ? 'Error al actualizar el producto' : 'Error al crear el producto');
      console.error('Error submitting product:', err);
    } finally {
      setLoading(false);
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
        setLoading(true);
        await GymApiService.deleteProduct(confirmDialog.productId);
        setProducts(products.filter(product => product.id !== confirmDialog.productId));
        setConfirmDialog({ isOpen: false, productId: null, productName: '' });
      } catch (err) {
        setError('Error al eliminar el producto');
        console.error('Error deleting product:', err);
      } finally {
        setLoading(false);
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

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { color: 'bg-red-100 text-red-800', text: 'Sin stock', icon: AlertTriangle };
    } else if (stock <= 5) {
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Stock bajo', icon: AlertTriangle };
    } else {
      return { color: 'bg-green-100 text-green-800', text: 'En stock', icon: Package };
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header diferente para clientes vs admin/empleados */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {isClient ? 'Tienda' : 'Gestión de Productos'}
        </h1>
        {!isClient && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Agregar Producto</span>
          </button>
        )}
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      )}

      {/* Tabs para clientes (Productos y Membresías) */}
      {isClient && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Productos</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('memberships')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'memberships'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Membresías</span>
              </div>
            </button>
          </nav>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder={`Buscar ${activeTab === 'products' ? 'productos' : 'membresías'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Contenido según tab activo */}
      {(activeTab === 'products' || !isClient) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            const StockIcon = stockStatus.icon;
            
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.nombre}</h3>
                  </div>
                  {!isClient && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Editar producto"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Eliminar producto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-gray-600 text-sm">{product.descripcion}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      S/{product.precio.toFixed(2)}
                    </span>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      <StockIcon className="w-3 h-3 mr-1" />
                      {stockStatus.text}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Cantidad: {product.stock}
                  </div>

                  {isClient && product.stock > 0 && (
                    <button 
                      onClick={() => addToCart(product, 'product', product.precio)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Agregar al Carrito</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Membresías Grid (solo para clientes) */}
      {isClient && activeTab === 'memberships' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memberships
            .filter(membership =>
              membership.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              membership.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((membership) => (
              <div key={membership.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Membresía {membership.tipo}</h3>
                  </div>
                  {membership.tipo === 'ANUAL' && (
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3 inline mr-1" />
                      Popular
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-gray-600 text-sm">{membership.descripcion}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      S/{membership.precio.toFixed(2)}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {membership.duracion_dias} días
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    {membership.tipo === 'MENSUAL' && 'Acceso por 30 días'}
                    {membership.tipo === 'TRIMESTRAL' && 'Acceso por 90 días'}
                    {membership.tipo === 'ANUAL' && 'Acceso por 365 días'}
                    {membership.tipo === 'DIARIO' && 'Acceso por 1 día'}
                  </div>

                  <button 
                    onClick={() => addToCart(membership, 'membership', membership.precio)}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Comprar Membresía</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Form Modal para admin/empleados */}
      {showForm && !isClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear')}
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
