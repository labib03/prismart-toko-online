import { Role, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned up existing data.');

  // Create Users
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordUser = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@prismart.com',
      password: hashedPasswordAdmin,
      name: 'Admin Utama',
      role: Role.ADMIN,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'budi@prismart.com',
      password: hashedPasswordUser,
      name: 'Budi Santoso',
      role: Role.USER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'siti@prismart.com',
      password: hashedPasswordUser,
      name: 'Siti Rahma',
      role: Role.USER,
    },
  });

  console.log(`👤 Created ${3} users.`);

  // Create Products
  const productsData = [
    {
      name: 'Laptop Gaming ROG Strix G16',
      description: 'Laptop gaming berperforma tinggi dengan Intel Core i9 Gen-14, RTX 4070, RAM 32GB DDR5, dan layar 240Hz Nebula Display.',
      price: 24999000,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Smartphone Flagship Ultra 5G 512GB',
      description: 'Layar Dynamic AMOLED 2X 120Hz, kamera utama 200MP, baterai 5000mAh dengan pengisian cepat 65W.',
      price: 14499000,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Monitor Gaming OLED Curved 34"',
      description: 'Monitor lengkung UWQHD (3440x1440), waktu respon 0.03ms GTG, refresh rate 175Hz, HDR1000 True Black.',
      price: 11250000,
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Wireless Mechanical Keyboard RGB',
      description: 'Keyboard mekanik nirkabel Tri-Mode (Bluetooth, 2.4GHz, Type-C) dengan hot-swappable tactile switch.',
      price: 1450000,
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Ergonomic Wireless Gaming Mouse',
      description: 'Sensor optik 26.000 DPI, desain ergonomis ultra-ringan 63 gram, ketahanan baterai hingga 90 jam.',
      price: 899000,
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Headphones Active Noise-Canceling Pro',
      description: 'Headphone nirkabel premium dengan peredam bising aktif (ANC) adaptif, audio Hi-Res, dan baterai 30 jam.',
      price: 3299000,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Smartwatch Fitness & Health Tracker',
      description: 'Jam tangan pintar dengan pelacak SpO2, detak jantung 24/7, GPS terintegrasi, dan kecerdasan analisis tidur.',
      price: 2199000,
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'External SSD Portable NVMe 1TB',
      description: 'Kecepatan transfer hingga 1050MB/s, bodi aluminium tahan guncangan dan cipratan air IP55.',
      price: 1650000,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Webcam 4K Ultra HD AI Autofocus',
      description: 'Kamera web resolusi 4K 30fps dengan mikrofon ganda pengurangan kebisingan dan penutup privasi fisik.',
      price: 1299000,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Smart Speaker Assistant Home Pro',
      description: 'Speaker pintar berbasis suara AI dengan kualitas bass mendalam dan kontrol perangkat smart home.',
      price: 799000,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const createdProducts = [];
  for (const productData of productsData) {
    const product = await prisma.product.create({
      data: productData,
    });
    createdProducts.push(product);
  }

  console.log(`📦 Created ${createdProducts.length} products.`);

  // Create Dummy Order
  const dummyOrder = await prisma.order.create({
    data: {
      userId: customer1.id,
      totalAmount: 2398000,
      status: OrderStatus.PAID,
      orderItems: {
        create: [
          {
            productId: createdProducts[3].id, // Wireless Keyboard
            quantity: 1,
            price: createdProducts[3].price,
          },
          {
            productId: createdProducts[4].id, // Gaming Mouse
            quantity: 1,
            price: createdProducts[4].price,
          },
        ],
      },
    },
  });

  console.log(`🛒 Created dummy order ID: ${dummyOrder.id}`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
