import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'lib', 'data.json');

// Helper function to read data from JSON file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Orders API: Error reading data file:', error);
    return {
      products: [],
      users: [],
      orders: [],
      customerAccounts: [],
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }
}

// Helper function to write data to JSON file
async function writeData(data: any) {
  try {
    data.metadata = {
      ...data.metadata,
      lastUpdated: new Date().toISOString(),
      totalOrders: data.orders?.length || 0
    };
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Orders API: Error writing data file:', error);
    return false;
  }
}

// GET - Retrieve orders for a specific user or all orders
export async function GET(request: NextRequest) {
  console.log('🔍 Orders API: GET /api/orders called');
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const includeProducts = searchParams.get('includeProducts') === 'true';
    
    const data = await readData();
    let orders = data.orders || [];
    
    console.log('📊 Orders API: Query parameters:', { userId, userEmail, orderId, status, includeProducts });
    
    // Filter orders based on query parameters
    if (userId) {
      orders = orders.filter((order: any) => order.userId === userId);
      console.log(`📋 Orders API: Filtered by userId ${userId}`, { count: orders.length });
    }
    
    if (userEmail) {
      orders = orders.filter((order: any) => order.userEmail === userEmail);
      console.log(`📋 Orders API: Filtered by userEmail ${userEmail}`, { count: orders.length });
    }
    
    if (orderId) {
      orders = orders.filter((order: any) => order.id === orderId);
      console.log(`📋 Orders API: Filtered by orderId ${orderId}`, { count: orders.length });
    }
    
    if (status) {
      orders = orders.filter((order: any) => order.status === status);
      console.log(`📋 Orders API: Filtered by status ${status}`, { count: orders.length });
    }
    
    // Include detailed product information if requested
    if (includeProducts && data.products) {
      orders = orders.map((order: any) => ({
        ...order,
        products: order.products?.map((orderProduct: any) => {
          const fullProduct = data.products.find((p: any) => p.id === orderProduct.id);
          return {
            ...orderProduct,
            ...fullProduct,
            orderQuantity: orderProduct.quantity,
            orderPrice: orderProduct.price,
            orderDuration: orderProduct.duration
          };
        }) || []
      }));
      console.log(`📦 Orders API: Enhanced orders with full product details`);
    }
    
    // Sort orders by creation date (newest first)
    orders.sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
    
    console.log(`✅ Orders API: Returning ${orders.length} orders`);
    
    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
      metadata: {
        timestamp: new Date().toISOString(),
        query: { userId, userEmail, orderId, status, includeProducts },
        totalOrders: data.orders?.length || 0
      }
    });
  } catch (error) {
    console.error('❌ Orders API Error in GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order with complete product data after payment
export async function POST(request: NextRequest) {
  console.log('💳 Orders API: POST /api/orders called - Creating order after payment');
  
  try {
    const contentLength = request.headers.get('content-length');
    const contentType = request.headers.get('content-type');
    
    if (!contentLength || contentLength === '0') {
      return NextResponse.json(
        { success: false, error: 'Request body is empty' },
        { status: 400 }
      );
    }
    
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }
    
    let orderData;
    try {
      orderData = await request.json();
    } catch (jsonError) {
      console.error('Orders API: JSON parsing error:', jsonError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    console.log('📦 Orders API: Processing order data:', { orderId: orderData.id, userId: orderData.userId });
    
    const data = await readData();
    
    if (!data.orders) {
      data.orders = [];
    }
    
    // Enhance order with complete product information from data.json
    const enhancedOrder = {
      ...orderData,
      id: orderData.id || `ORD_${Date.now()}`,
      createdAt: orderData.createdAt || new Date().toISOString(),
      date: orderData.date || orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'completed',
      paymentStatus: orderData.paymentStatus || 'completed',
      completedAt: orderData.status === 'completed' ? (orderData.completedAt || new Date().toISOString()) : null,
      
      // Enhanced product information with full details from JSON data
      products: orderData.products?.map((orderProduct: any) => {
        const fullProduct = data.products?.find((p: any) => p.id === orderProduct.id);
        
        return {
          id: orderProduct.id,
          name: orderProduct.name || fullProduct?.name,
          quantity: orderProduct.quantity || 1,
          price: orderProduct.price || fullProduct?.price,
          duration: orderProduct.duration || '1 tháng',
          
          // Include full product details for comprehensive data storage
          category: fullProduct?.category,
          description: fullProduct?.description,
          originalPrice: fullProduct?.originalPrice,
          image: fullProduct?.image,
          color: fullProduct?.color,
          badge: fullProduct?.badge,
          badgeColor: fullProduct?.badgeColor,
          features: fullProduct?.features,
          inStock: fullProduct?.inStock,
          warranty: fullProduct?.warranty,
          rating: fullProduct?.rating,
          reviews: fullProduct?.reviews,
          sales: fullProduct?.sales,
          stock: fullProduct?.stock,
          durations: fullProduct?.durations
        };
      }) || [],
      
      // Order metadata
      orderMetadata: {
        timestamp: new Date().toISOString(),
        source: 'payment_completion',
        version: '2.0.0',
        productDataSnapshot: true
      }
    };
    
    // Check if order already exists to prevent duplicates
    const existingOrderIndex = data.orders.findIndex((order: any) => order.id === enhancedOrder.id);
    
    if (existingOrderIndex >= 0) {
      // Update existing order
      data.orders[existingOrderIndex] = enhancedOrder;
      console.log(`🔄 Orders API: Updated existing order`, { orderId: enhancedOrder.id });
    } else {
      // Add new order
      data.orders.unshift(enhancedOrder); // Add to beginning for latest-first ordering
      console.log(`➕ Orders API: Added new order`, { orderId: enhancedOrder.id });
    }
    
    // Update customer accounts if order is completed
    if (enhancedOrder.status === 'completed' && enhancedOrder.deliveryInfo?.accountCredentials) {
      await updateCustomerAccounts(data, enhancedOrder);
    }
    
    // Update user statistics
    await updateUserStatistics(data, enhancedOrder);
    
    const success = await writeData(data);
    
    if (success) {
      console.log(`✅ Orders API: Successfully saved order to JSON file`, { 
        orderId: enhancedOrder.id,
        productsCount: enhancedOrder.products.length,
        total: enhancedOrder.total
      });
      
      return NextResponse.json({
        success: true,
        message: 'Order saved successfully with complete product data',
        data: enhancedOrder,
        metadata: {
          timestamp: new Date().toISOString(),
          productsEnhanced: true,
          totalOrders: data.orders.length
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save order to JSON file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Orders API Error in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  console.log('📝 Orders API: PUT /api/orders called - Updating order');
  
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId parameter is required' },
        { status: 400 }
      );
    }
    
    const updateData = await request.json();
    const data = await readData();
    
    if (!data.orders) {
      return NextResponse.json(
        { success: false, error: 'No orders found' },
        { status: 404 }
      );
    }
    
    const orderIndex = data.orders.findIndex((order: any) => order.id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Order with id ${orderId} not found` },
        { status: 404 }
      );
    }
    
    // Update order with new data
    data.orders[orderIndex] = {
      ...data.orders[orderIndex],
      ...updateData,
      id: orderId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    console.log(`🔄 Orders API: Updated order ${orderId}`, { newStatus: updateData.status });
    
    const success = await writeData(data);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Order updated successfully',
        data: data.orders[orderIndex]
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save order update' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Orders API Error in PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// Helper function to update customer accounts after order completion
async function updateCustomerAccounts(data: any, order: any) {
  console.log('👥 Orders API: Updating customer accounts for completed order');
  
  if (!data.customerAccounts) {
    data.customerAccounts = [];
  }
  
  const accountCredentials = order.deliveryInfo?.accountCredentials || [];
  
  for (const credential of accountCredentials) {
    const customerAccount = {
      id: `acc_${order.id}_${credential.itemId}`,
      accountEmail: credential.credentials.email,
      accountPassword: credential.credentials.password,
      customerName: order.customerName,
      customerEmail: order.userEmail,
      customerPhone: order.customerPhone || '',
      productType: credential.itemName,
      productIcon: credential.credentials.icon || '📦',
      productColor: credential.credentials.color || 'bg-blue-500',
      purchaseDate: order.completedAt || order.createdAt,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      status: 'active',
      link: credential.credentials.link || '',
      orderId: order.id,
      duration: credential.credentials.duration || '1 năm',
      purchasePrice: order.total,
      totalSpent: order.total,
      totalOrders: 1,
      currentRank: 'bronze'
    };
    
    data.customerAccounts.push(customerAccount);
  }
  
  console.log(`👥 Orders API: Added ${accountCredentials.length} customer accounts`);
}

// Helper function to update user statistics
async function updateUserStatistics(data: any, order: any) {
  console.log('📊 Orders API: Updating user statistics');
  
  if (!data.users || !order.userId) return;
  
  const userIndex = data.users.findIndex((user: any) => user.id === order.userId);
  
  if (userIndex >= 0) {
    const user = data.users[userIndex];
    const userOrders = data.orders.filter((o: any) => o.userId === order.userId);
    
    data.users[userIndex] = {
      ...user,
      totalOrders: userOrders.length,
      totalSpent: userOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
      lastOrderDate: order.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`📊 Orders API: Updated user statistics for ${order.userId}`);
  }
}