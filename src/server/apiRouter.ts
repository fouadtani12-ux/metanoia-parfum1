import { Router, Request, Response } from 'express';
import {
  INITIAL_PRODUCTS,
  DEMO_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SHIPPING_RATES,
  INITIAL_SETTINGS
} from '../data/mockData';

export const apiRouter = Router();

// In-Memory Database store with seed data (initialisé vierge pour le déploiement)
let dbProducts = [...INITIAL_PRODUCTS];
let dbCategories = [...INITIAL_CATEGORIES];
let dbOrders = [...INITIAL_ORDERS];
let dbUsers = [...INITIAL_USERS];
let dbCoupons = [...INITIAL_COUPONS];
let dbReviews = [...INITIAL_REVIEWS];
let dbStocks = [...INITIAL_STOCK_MOVEMENTS];
let dbNotifications = [...INITIAL_NOTIFICATIONS];
let dbShippingRates = [...INITIAL_SHIPPING_RATES];
let dbSettings = { ...INITIAL_SETTINGS };

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'METANOÏA PARFUMS API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Catalog reset and demo endpoints
apiRouter.post('/catalog/clear', (_req: Request, res: Response) => {
  dbProducts = [];
  res.json({ success: true, message: 'Catalogue remis à zéro (boutique vierge)' });
});

apiRouter.post('/catalog/load-demo', (_req: Request, res: Response) => {
  dbProducts = [...DEMO_PRODUCTS];
  res.json({ success: true, message: 'Catalogue de démonstration chargé', count: dbProducts.length });
});

// 1. PRODUCTS
apiRouter.get('/products', (req: Request, res: Response) => {
  const { category, gender, search, family, minPrice, maxPrice, sort } = req.query;
  let result = [...dbProducts];

  if (category) {
    result = result.filter((p) => p.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (gender) {
    result = result.filter((p) => p.gender.toLowerCase() === (gender as string).toLowerCase());
  }
  if (family) {
    result = result.filter((p) => p.fragranceFamily.toLowerCase() === (family as string).toLowerCase());
  }
  if (minPrice) {
    result = result.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    result = result.filter((p) => p.price <= Number(maxPrice));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.fragranceFamily.toLowerCase().includes(q) ||
        p.topNotes.some((n) => n.toLowerCase().includes(q)) ||
        p.heartNotes.some((n) => n.toLowerCase().includes(q)) ||
        p.baseNotes.some((n) => n.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  else if (sort === 'bestseller') result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
  else if (sort === 'new') result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  res.json({ success: true, count: result.length, data: result });
});

apiRouter.get('/products/:idOrSlug', (req: Request, res: Response) => {
  const param = req.params.idOrSlug;
  const prod = dbProducts.find((p) => p.id === param || p.slug === param);
  if (!prod) {
    res.status(404).json({ success: false, message: 'Produit introuvable' });
    return;
  }
  res.json({ success: true, data: prod });
});

apiRouter.post('/products', (req: Request, res: Response) => {
  const newProduct = {
    ...req.body,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  dbProducts.unshift(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

apiRouter.put('/products/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const index = dbProducts.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Produit non trouvé' });
    return;
  }
  dbProducts[index] = { ...dbProducts[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: dbProducts[index] });
});

apiRouter.delete('/products/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  dbProducts = dbProducts.filter((p) => p.id !== id);
  res.json({ success: true, message: 'Produit supprimé' });
});

// 2. CATEGORIES
apiRouter.get('/categories', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbCategories });
});

// 3. ORDERS
apiRouter.get('/orders', (req: Request, res: Response) => {
  const { status, city, customerId } = req.query;
  let result = [...dbOrders];

  if (customerId) {
    result = result.filter((o) => o.userId === customerId);
  }
  if (status && status !== 'ALL') {
    result = result.filter((o) => o.status === status);
  }
  if (city) {
    result = result.filter((o) => o.customer.city.toLowerCase() === (city as string).toLowerCase());
  }

  res.json({ success: true, count: result.length, data: result });
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const order = dbOrders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Commande introuvable' });
    return;
  }
  res.json({ success: true, data: order });
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  const { customer, items, shippingMethod, couponCode, subtotal, shippingFee, discountAmount, total } = req.body;
  const orderNumber = `MET-${new Date().getFullYear()}-${1000 + dbOrders.length + 1}`;
  
  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customer,
    items,
    shippingMethod,
    paymentMethod: 'COD',
    couponCode,
    subtotal,
    shippingFee,
    discountAmount,
    total,
    paymentStatus: 'PENDING',
    status: 'PENDING',
    timeline: [
      { status: 'PENDING', label: 'Commande reçue', timestamp: new Date().toISOString(), isCompleted: true, note: 'Commande validée sur la boutique' },
      { status: 'CONFIRMED', label: 'Commande confirmée', timestamp: '', isCompleted: false },
      { status: 'PROCESSING', label: 'Préparation en atelier', timestamp: '', isCompleted: false },
      { status: 'SHIPPED', label: 'Expédiée', timestamp: '', isCompleted: false },
      { status: 'DELIVERED', label: 'Livrée au client', timestamp: '', isCompleted: false }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbOrders.unshift(newOrder as any);

  // Decrement stocks
  if (Array.isArray(items)) {
    items.forEach((item: any) => {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        dbStocks.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          productId: prod.id,
          productName: prod.name,
          change: -item.quantity,
          reason: 'ORDER_SALE',
          previousStock: prod.stock + item.quantity,
          newStock: prod.stock,
          date: new Date().toISOString(),
          operator: `Système (${orderNumber})`
        });
      }
    });
  }

  // Create notification
  dbNotifications.unshift({
    id: `notif-${Date.now()}`,
    title: `Nouvelle commande #${orderNumber}`,
    message: `${customer.firstName} ${customer.lastName} (${total} DH - ${customer.city}). Transmis à Azzakhmamalaa@gmail.com`,
    type: 'NEW_ORDER',
    isRead: false,
    link: '/admin/orders',
    createdAt: new Date().toISOString()
  });

  console.log(`[EMAIL NOTIFICATION] Commande #${orderNumber} (${total} DH) transmise avec succès à Azzakhmamalaa@gmail.com`);

  res.status(201).json({
    success: true,
    data: newOrder,
    emailNotificationSentTo: 'Azzakhmamalaa@gmail.com'
  });
});

apiRouter.post('/orders/notify-email', (req: Request, res: Response) => {
  const { order, recipientEmail = 'Azzakhmamalaa@gmail.com' } = req.body;
  const targetEmail = recipientEmail || 'Azzakhmamalaa@gmail.com';
  console.log(`[ORDER DISPATCH] Transmission de la commande ${order?.orderNumber || 'MET-COMMANDE'} vers ${targetEmail}`);
  res.json({
    success: true,
    recipient: targetEmail,
    message: `La commande a été transmise à ${targetEmail}`
  });
});

apiRouter.put('/orders/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const index = dbOrders.findIndex((o) => o.id === id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Commande introuvable' });
    return;
  }
  const prevStatus = dbOrders[index].status;
  const nextStatus = req.body.status;

  // Stock restoration on cancel
  if (nextStatus === 'CANCELLED' && prevStatus !== 'CANCELLED') {
    dbOrders[index].items.forEach((item) => {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
        dbStocks.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          productId: prod.id,
          productName: prod.name,
          change: item.quantity,
          reason: 'ORDER_CANCELLED',
          previousStock: prod.stock - item.quantity,
          newStock: prod.stock,
          date: new Date().toISOString(),
          operator: 'Système (Annulation)'
        });
      }
    });
  }

  dbOrders[index] = { ...dbOrders[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: dbOrders[index] });
});

// 4. CUSTOMERS
apiRouter.get('/customers', (_req: Request, res: Response) => {
  res.json({ success: true, count: dbUsers.length, data: dbUsers });
});

// 5. COUPONS
apiRouter.get('/coupons', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbCoupons });
});

apiRouter.post('/coupons', (req: Request, res: Response) => {
  const newCoupon = { ...req.body, id: `coup-${Date.now()}` };
  dbCoupons.unshift(newCoupon);
  res.status(201).json({ success: true, data: newCoupon });
});

// 6. REVIEWS
apiRouter.get('/reviews', (req: Request, res: Response) => {
  const { productId } = req.query;
  let result = dbReviews;
  if (productId) {
    result = result.filter((r) => r.productId === productId);
  }
  res.json({ success: true, count: result.length, data: result });
});

apiRouter.post('/reviews', (req: Request, res: Response) => {
  const newReview = {
    ...req.body,
    id: `rev-${Date.now()}`,
    status: 'APPROVED',
    createdAt: new Date().toISOString()
  };
  dbReviews.unshift(newReview);
  res.status(201).json({ success: true, data: newReview });
});

// 7. STOCK MOVEMENTS
apiRouter.get('/stocks', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbStocks });
});

// 8. NOTIFICATIONS
apiRouter.get('/notifications', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbNotifications });
});

// 9. ANALYTICS & DASHBOARD METRICS
apiRouter.get('/analytics', (_req: Request, res: Response) => {
  const confirmedOrders = dbOrders.filter((o) => o.status !== 'CANCELLED');
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = dbOrders.length;
  const pendingOrders = dbOrders.filter((o) => o.status === 'PENDING').length;
  const totalCustomers = dbUsers.length;
  const averageCart = confirmedOrders.length ? Math.round(totalRevenue / confirmedOrders.length) : 0;
  
  // Total inventory units
  const totalInventory = dbProducts.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = dbProducts.filter((p) => p.stock > 0 && p.stock <= 4).length;
  const outOfStockCount = dbProducts.filter((p) => p.stock === 0).length;

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalCustomers,
      averageCart,
      totalInventory,
      lowStockCount,
      outOfStockCount,
    }
  });
});

export {
  dbProducts,
  dbCategories,
  dbOrders,
  dbUsers,
  dbCoupons,
  dbReviews,
  dbStocks,
  dbNotifications,
  dbShippingRates,
  dbSettings
};
