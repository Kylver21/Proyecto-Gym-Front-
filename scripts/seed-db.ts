import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Datos de ejemplo
const sampleMemberships = [
  {
    name: 'Membresía Básica',
    description: 'Acceso a la zona de pesas y cardio',
    price: 500,
    durationDays: 30,
    active: true
  },
  {
    name: 'Membresía Premium',
    description: 'Acceso a todas las áreas, incluyendo clases grupales',
    price: 800,
    durationDays: 30,
    active: true
  },
  {
    name: 'Membresía Anual',
    description: 'Acceso completo por un año con descuento',
    price: 5000,
    durationDays: 365,
    active: true
  }
];

const sampleProducts = [
  {
    name: 'Proteína en Polvo',
    description: 'Proteína de suero de leche sabor vainilla',
    price: 800,
    stock: 50,
    category: 'Suplementos'
  },
  {
    name: 'Botella de Agua',
    description: 'Botella deportiva de 1L',
    price: 150,
    stock: 100,
    category: 'Accesorios'
  },
  {
    name: 'Toalla de Gimnasio',
    description: 'Toalla deportiva absorbente',
    price: 200,
    stock: 75,
    category: 'Accesorios'
  }
];

const sampleUsers = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@gym.com',
    firstName: 'Administrador',
    lastName: 'Sistema',
    phone: '1234567890',
    role: 'ADMIN',
    active: true
  },
  {
    username: 'entrenador1',
    password: 'entrenador123',
    email: 'entrenador1@gym.com',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    phone: '0987654321',
    role: 'TRAINER',
    active: true
  },
  {
    username: 'cliente1',
    password: 'cliente123',
    email: 'cliente1@email.com',
    firstName: 'María',
    lastName: 'González',
    phone: '0991234567',
    role: 'MEMBER',
    active: true
  }
];

async function seedDatabase() {
  console.log('Iniciando la carga de datos iniciales...');
  
  try {
    // Crear usuarios
    console.log('Creando usuarios...');
    const createdUsers = [];
    for (const user of sampleUsers) {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, user);
      createdUsers.push(response.data);
      console.log(`Usuario creado: ${user.username}`);
    }

    // Crear membresías
    console.log('\nCreando membresías...');
    const createdMemberships = [];
    for (const membership of sampleMemberships) {
      const response = await axios.post(`${API_BASE_URL}/memberships`, membership);
      createdMemberships.push(response.data);
      console.log(`Membresía creada: ${membership.name}`);
    }

    // Crear productos
    console.log('\nCreando productos...');
    for (const product of sampleProducts) {
      const response = await axios.post(`${API_BASE_URL}/products`, product);
      console.log(`Producto creado: ${product.name}`);
    }

    console.log('\n¡Base de datos poblada exitosamente!');
  } catch (error) {
    console.error('Error al poblar la base de datos:', error.response?.data || error.message);
  }
}

// Ejecutar el script
seedDatabase();
