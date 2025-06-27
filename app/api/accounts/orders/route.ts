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
    console.error('Account Orders API: Error reading data file:', error);
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

// GET - Display account orders with comprehensive data
export async function GET(request: NextRequest) {
  console.log('👤 Account Orders API: GET /api/accounts/orders called');
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    const includeProducts = searchParams.get('includeProducts') !== 'false'; // Default true
    const includeAccounts = searchParams.get('includeAccounts') !== 'false'; // Default true
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    console.log('🔍 Account Orders API: Query parameters:', { 
      userId, userEmail, includeProducts, includeAccounts, status, limit 
    });
    
    if (!userId && !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Either userId or userEmail is required' },
        { status: 400 }
      );
    }
    
    const data = await readData();
    let orders = data.orders || [];
    
    // Filter orders by user
    if (userId) {
      orders = orders.filter((order: any) => order.userId === userId);
    } else if (userEmail) {
      orders = orders.filter((order: any) => order.userEmail === userEmail);
    }
    
    // Filter by status if specified
    if (status) {
      orders = orders.filter((order: any) => order.status === status);
    }
    
    console.log(`📋 Account Orders API: Found ${orders.length} orders for user`);
    
    // Enhance orders with additional data
    const enhancedOrders = orders.map((order: any) => {
      let enhancedOrder = { ...order };
      
      // Include full product details if requested
      if (includeProducts && data.products) {
        enhancedOrder.products = order.products?.map((orderProduct: any) => {
          const fullProduct = data.products.find((p: any) => p.id === orderProduct.id);
          
          return {
            // Order-specific product data
            id: orderProduct.id,
            name: orderProduct.name,
            quantity: orderProduct.quantity,
            price: orderProduct.price,
            duration: orderProduct.duration,
            
            // Full product information
            ...(fullProduct && {
              category: fullProduct.category,
              description: fullProduct.description,
              originalPrice: fullProduct.originalPrice,
              image: fullProduct.image,
              color: fullProduct.color,
              badge: fullProduct.badge,
              badgeColor: fullProduct.badgeColor,
              features: fullProduct.features,
              inStock: fullProduct.inStock,
              warranty: fullProduct.warranty,
              rating: fullProduct.rating,
              reviews: fullProduct.reviews,
              sales: fullProduct.sales,
              stock: fullProduct.stock,
              durations: fullProduct.durations
            })
          };
        }) || [];
      }
      
      // Include related customer accounts if requested
      if (includeAccounts && data.customerAccounts) {
        enhancedOrder.customerAccounts = data.customerAccounts.filter(
          (account: any) => account.orderId === order.id
        );
      }
      
      // Add order analytics
      enhancedOrder.analytics = {
        totalItems: order.products?.length || 0,
        avgItemPrice: order.products?.length > 0 
          ? order.total / order.products.length 
          : 0,
        discountPercentage: order.originalTotal && order.originalTotal > 0 
          ? Math.round(((order.originalTotal - order.total) / order.originalTotal) * 100)
          : 0,
        daysSinceOrder: Math.floor(
          (Date.now() - new Date(order.createdAt || order.date).getTime()) / (1000 * 60 * 60 * 24)
        )
      };
      
      return enhancedOrder;
    });
    
    // Sort orders by creation date (newest first)
    enhancedOrders.sort((a: any, b: any) => 
      new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
    );
    
    // Apply limit if specified
    const finalOrders = limit ? enhancedOrders.slice(0, limit) : enhancedOrders;
    
    // Calculate user statistics
    const userStats = {
      totalOrders: enhancedOrders.length,
      completedOrders: enhancedOrders.filter((o: any) => o.status === 'completed').length,
      totalSpent: enhancedOrders
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0),
      totalSaved: enhancedOrders
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + (o.discount || 0), 0),
      averageOrderValue: enhancedOrders.length > 0 
        ? enhancedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0) / enhancedOrders.length
        : 0,
      lastOrderDate: enhancedOrders.length > 0 
        ? enhancedOrders[0].createdAt || enhancedOrders[0].date
        : null,
      favoriteProducts: calculateFavoriteProducts(enhancedOrders),
      customerAccounts: includeAccounts 
        ? data.customerAccounts?.filter((acc: any) => 
            enhancedOrders.some((order: any) => order.id === acc.orderId)
          ).length || 0
        : undefined
    };
    
    console.log(`✅ Account Orders API: Returning ${finalOrders.length} enhanced orders with statistics`);
    
    return NextResponse.json({
      success: true,
      data: {
        orders: finalOrders,
        statistics: userStats,
        metadata: {
          userId: userId || 'unknown',
          userEmail: userEmail || 'unknown',
          timestamp: new Date().toISOString(),
          query: { includeProducts, includeAccounts, status, limit },
          totalOrdersInDatabase: data.orders?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Account Orders API Error in GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve account orders' },
      { status: 500 }
    );
  }
}

// Helper function to calculate favorite products based on order history
function calculateFavoriteProducts(orders: any[]): any[] {
  const productCounts: { [key: string]: any } = {};
  
  orders.forEach((order: any) => {
    if (order.status === 'completed' && order.products) {
      order.products.forEach((product: any) => {
        const key = product.id.toString();
        if (!productCounts[key]) {
          productCounts[key] = {
            id: product.id,
            name: product.name,
            category: product.category,
            totalQuantity: 0,
            totalSpent: 0,
            orderCount: 0,
            avgPrice: 0
          };
        }
        
        productCounts[key].totalQuantity += product.quantity || 1;
        productCounts[key].totalSpent += product.price || 0;
        productCounts[key].orderCount += 1;
        productCounts[key].avgPrice = productCounts[key].totalSpent / productCounts[key].totalQuantity;
      });
    }
  });
  
  // Sort by total quantity and return top 5
  return Object.values(productCounts)
    .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);
}

// POST - Mark order as viewed/read
export async function POST(request: NextRequest) {
  console.log('👁️ Account Orders API: POST /api/accounts/orders called - Mark as read');
  
  try {
    const { orderId, userId, action } = await request.json();
    
    if (!orderId || !userId) {
      return NextResponse.json(
        { success: false, error: 'orderId and userId are required' },
        { status: 400 }
      );
    }
    
    if (action === 'mark_read') {
      // For now, just return success as this is a simple read marker
      // In a real app, you might want to track read status in the JSON
      console.log(`📖 Account Orders API: Marked order ${orderId} as read for user ${userId}`);
      
      return NextResponse.json({
        success: true,
        message: 'Order marked as read',
        data: { orderId, userId, markedAt: new Date().toISOString() }
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Account Orders API Error in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}