import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Collection references
export const collections = {
  users: 'users',
  orders: 'orders',
  products: 'products',
  addresses: 'addresses',
  reviews: 'reviews',
  faqs: 'faqs',
  banners: 'banners',
  loyalty: 'loyalty',
  wishlist: 'wishlist',
  config: 'config',
};

// User operations
export const userService = {
  async getUser(uid) {
    const docRef = doc(db, collections.users, uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async createUser(uid, userData) {
    const docRef = doc(db, collections.users, uid);
    await setDoc(docRef, {
      ...userData,
      createdAt: serverTimestamp(),
      role: 'customer',
      addresses: [],
    });
  },

  async updateUser(uid, updates) {
    const docRef = doc(db, collections.users, uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async getAllUsers() {
    const querySnapshot = await getDocs(collection(db, collections.users));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
  },

  async isAdmin(uid) {
    const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID;
    return uid === adminUid;
  },
};

// Order operations
export const orderService = {
  async createOrder(orderData) {
    // We save the document under our human-readable orderId string to guarantee clean, direct lookups
    const docRef = doc(db, collections.orders, orderData.orderId);
    const order = {
      ...orderData,
      createdAt: serverTimestamp(),
      status: 'pending_verification',
    };
    await setDoc(docRef, order);
    return docRef.id;
  },

  async getOrder(orderId) {
    // 1. First, try to fetch directly by Document ID
    const docRef = doc(db, collections.orders, orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || null,
        estimatedDelivery: data.estimatedDelivery?.toDate?.() || null,
      };
    }

    // 2. If not found, search the collection where the internal 'orderId' field matches
    const q = query(
      collection(db, collections.orders),
      where('orderId', '==', orderId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || null,
        estimatedDelivery: data.estimatedDelivery?.toDate?.() || null,
      };
    }

    return null;
  },

  async getUserOrders(userId) {
    const q = query(
      collection(db, collections.orders),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || null,
        estimatedDelivery: data.estimatedDelivery?.toDate?.() || null,
      };
    });
  },

  async getAllOrders() {
    const q = query(collection(db, collections.orders), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || null,
        estimatedDelivery: data.estimatedDelivery?.toDate?.() || null,
      };
    });
  },

  async updateOrder(orderId, updates) {
    const docRef = doc(db, collections.orders, orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async getPendingOrders() {
    const q = query(
      collection(db, collections.orders),
      where('status', '==', 'pending_verification'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });
  },
};

// Product operations
export const productService = {
  async getProducts() {
    const querySnapshot = await getDocs(collection(db, collections.products));
    if (querySnapshot.empty) {
      await this.initializeProducts();
      return await this.getProducts();
    }
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async initializeProducts() {
    const defaultProducts = [
      {
        id: 'polaroid',
        name: 'Polaroid',
        type: 'standard',
        price: 50,
        description: 'Classic polaroid print',
        size: '3.5" x 4.25"',
        minResolution: { width: 800, height: 1000 },
      },
      {
        id: 'polaroid-custom',
        name: 'Custom Polaroid',
        type: 'custom',
        price: 80,
        description: 'Personalized polaroid with your design',
        size: '3.5" x 4.25"',
        minResolution: { width: 800, height: 1000 },
      },
      {
        id: 'poster-a5',
        name: 'A5 Poster',
        type: 'standard',
        price: 100,
        description: 'Compact A5 size poster',
        size: '5.8" x 8.3"',
        minResolution: { width: 1748, height: 2480 },
      },
      {
        id: 'poster-a5-custom',
        name: 'Custom A5 Poster',
        type: 'custom',
        price: 150,
        description: 'Personalized A5 poster',
        size: '5.8" x 8.3"',
        minResolution: { width: 1748, height: 2480 },
      },
      {
        id: 'poster-a3',
        name: 'A3 Poster',
        type: 'standard',
        price: 250,
        description: 'Large format A3 poster',
        size: '11.7" x 16.5"',
        minResolution: { width: 3508, height: 4960 },
      },
      {
        id: 'poster-a3-custom',
        name: 'Custom A3 Poster',
        type: 'custom',
        price: 350,
        description: 'Personalized large A3 poster',
        size: '11.7" x 16.5"',
        minResolution: { width: 3508, height: 4960 },
      },
    ];

    for (const product of defaultProducts) {
      await setDoc(doc(db, collections.products, product.id), product);
    }
  },

  async updateProduct(productId, updates) {
    const docRef = doc(db, collections.products, productId);
    await updateDoc(docRef, updates);
  },

  async getProduct(productId) {
    const docRef = doc(db, collections.products, productId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  // NEW: Create Product Method
  async createProduct(productData) {
    // If no explicit ID is provided, auto-generate a slug from the name
    const id = productData.id || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const docRef = doc(db, collections.products, id);
    await setDoc(docRef, productData);
    return id;
  },

  // NEW: Delete Product Method
  async deleteProduct(productId) {
    const docRef = doc(db, collections.products, productId);
    await deleteDoc(docRef);
  }
};

// Address operations
export const addressService = {
  async getAddresses() {
    const querySnapshot = await getDocs(collection(db, collections.addresses));
    if (querySnapshot.empty) {
      await this.initializeAddresses();
      return await this.getAddresses();
    }
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async initializeAddresses() {
    const defaultAddresses = [
      {
        name: 'Saveetha University',
        type: 'campus',
        address: 'Saveetha Nagar, Thandalam',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '602105',
      },
      {
        name: 'Saveetha Dental College',
        type: 'campus',
        address: '162, Poonamallee High Road, Velappanchavadi',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600077',
      },
      {
        name: 'Sathyabama University',
        type: 'campus',
        address: 'Jeppiaar Nagar, Rajiv Gandhi Salai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600119',
      },
      {
        name: 'Loyola College',
        type: 'campus',
        address: 'Sterling Road, Nungambakkam',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600034',
      },
    ];

    for (const address of defaultAddresses) {
      const docRef = doc(collection(db, collections.addresses));
      await setDoc(docRef, address);
    }
  },

  async addAddress(addressData) {
    const docRef = doc(collection(db, collections.addresses));
    await setDoc(docRef, addressData);
    return docRef.id;
  },

  async updateAddress(addressId, updates) {
    const docRef = doc(db, collections.addresses, addressId);
    await updateDoc(docRef, updates);
  },

  async deleteAddress(addressId) {
    const docRef = doc(db, collections.addresses, addressId);
    await deleteDoc(docRef);
  },
};

// FAQ operations
export const faqService = {
  async getFAQs() {
    const q = query(collection(db, collections.faqs), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      await this.initializeFAQs();
      return await this.getFAQs();
    }
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async initializeFAQs() {
    const defaultFAQs = [
      {
        question: 'What is the typical delivery time?',
        answer: 'Standard delivery takes 3-5 business days. Express delivery is available for select locations and takes 1-2 business days.',
        order: 1,
      },
      {
        question: 'What is your refund policy?',
        answer: 'We offer a full refund if there is a printing defect or error on our part. Refunds are processed within 5-7 business days of approval.',
        order: 2,
      },
      {
        question: 'How do you ensure print quality?',
        answer: 'We use professional-grade printers and premium paper stock. Every print is quality-checked before shipping. We also validate image resolution before accepting orders.',
        order: 3,
      },
      {
        question: 'Can I pick up my order instead of delivery?',
        answer: 'Yes, self-pickup is available. You will be notified when your order is ready for collection.',
        order: 4,
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept UPI payments. You pay 50% upfront and submit the transaction ID. The remaining amount is collected on delivery.',
        order: 5,
      },
    ];

    for (const faq of defaultFAQs) {
      const docRef = doc(collection(db, collections.faqs));
      await setDoc(docRef, faq);
    }
  },

  async updateFAQ(faqId, updates) {
    const docRef = doc(db, collections.faqs, faqId);
    await updateDoc(docRef, updates);
  },

  async addFAQ(faqData) {
    const docRef = doc(collection(db, collections.faqs));
    await setDoc(docRef, faqData);
    return docRef.id;
  },

  async deleteFAQ(faqId) {
    const docRef = doc(db, collections.faqs, faqId);
    await deleteDoc(docRef);
  },
};

// Review operations
export const reviewService = {
  async getReviews() {
    const q = query(collection(db, collections.reviews), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      await this.initializeReviews();
      return await this.getReviews();
    }
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });
  },

  async initializeReviews() {
    const defaultReviews = [
      {
        name: 'Priya Sharma',
        rating: 5,
        text: 'Absolutely stunning print quality. The polaroid came out exactly as I imagined. Highly recommend SnapNest.',
        createdAt: serverTimestamp(),
      },
      {
        name: 'Arjun Patel',
        rating: 5,
        text: 'Fast delivery and excellent customer service. The custom poster design process was so easy.',
        createdAt: serverTimestamp(),
      },
      {
        name: 'Sneha Reddy',
        rating: 4,
        text: 'Great experience overall. The A3 poster looks amazing on my wall. Minor delay in shipping but worth the wait.',
        createdAt: serverTimestamp(),
      },
    ];

    for (const review of defaultReviews) {
      const docRef = doc(collection(db, collections.reviews));
      await setDoc(docRef, review);
    }
  },

  async addReview(reviewData) {
    const docRef = doc(collection(db, collections.reviews));
    await setDoc(docRef, {
      ...reviewData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async deleteReview(reviewId) {
    const docRef = doc(db, collections.reviews, reviewId);
    await deleteDoc(docRef);
  },
};

// Banner operations
export const bannerService = {
  async getBanner() {
    const docRef = doc(db, collections.banners, 'main');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await this.initializeBanner();
      return await this.getBanner();
    }
    return docSnap.data();
  },

  async initializeBanner() {
    await setDoc(doc(db, collections.banners, 'main'), {
      active: true,
      text: 'New Year Special - Get 20% off on all custom posters',
      color: 'mint',
    });
  },

  async updateBanner(bannerData) {
    const docRef = doc(db, collections.banners, 'main');
    await setDoc(docRef, bannerData, { merge: true });
  },
};

// Loyalty operations
export const loyaltyService = {
  async getLoyalty(userId) {
    const docRef = doc(db, collections.loyalty, userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await this.initializeLoyalty(userId);
      return await this.getLoyalty(userId);
    }
    return { id: docSnap.id, ...docSnap.data() };
  },

  async initializeLoyalty(userId) {
    const referralCode = 'SNAP' + Math.random().toString(36).substring(2, 8).toUpperCase();
    await setDoc(doc(db, collections.loyalty, userId), {
      points: 0,
      referralCode,
      referrals: [],
      createdAt: serverTimestamp(),
    });
  },

  async updatePoints(userId, points) {
    const docRef = doc(db, collections.loyalty, userId);
    await updateDoc(docRef, {
      points: increment(points),
    });
  },

  async addReferral(userId, referredUserId) {
    const docRef = doc(db, collections.loyalty, userId);
    const docSnap = await getDoc(docRef);
    const currentReferrals = docSnap.data()?.referrals || [];
    await updateDoc(docRef, {
      referrals: [...currentReferrals, referredUserId],
    });
  },

  async redeemPoints(userId, points) {
    const docRef = doc(db, collections.loyalty, userId);
    await updateDoc(docRef, {
      points: increment(-points),
    });
  },
};

// Wishlist operations
export const wishlistService = {
  async getWishlist(userId) {
    const q = query(
      collection(db, collections.wishlist),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });
  },

  async addToWishlist(userId, itemData) {
    const docRef = doc(collection(db, collections.wishlist));
    await setDoc(docRef, {
      userId,
      ...itemData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async removeFromWishlist(wishlistId) {
    const docRef = doc(db, collections.wishlist, wishlistId);
    await deleteDoc(docRef);
  },
};

// Config operations
export const configService = {
  async getConfig() {
    const docRef = doc(db, collections.config, 'main');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await this.initializeConfig();
      return await this.getConfig();
    }
    return docSnap.data();
  },

  async initializeConfig() {
    await setDoc(doc(db, collections.config, 'main'), {
      upiId: 'snapnest@upi',
      mobileNumber: '+91 9876543210',
      pointsPerOrder: 10,
      pointsPerReferral: 50,
    });
  },

  async updateConfig(configData) {
    const docRef = doc(db, collections.config, 'main');
    await updateDoc(docRef, configData);
  },
};

// Stats
export const statsService = {
  async getStats() {
    const [orders, users] = await Promise.all([
      orderService.getAllOrders(),
      userService.getAllUsers(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(o => {
      const orderDate = o.createdAt;
      return orderDate && orderDate >= today;
    });

    const pendingOrders = orders.filter(o => o.status === 'pending_verification');
    
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalOrders: orders.length,
      totalUsers: users.length,
      todayOrders: todayOrders.length,
      pendingVerifications: pendingOrders.length,
      totalRevenue,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    };
  },
};