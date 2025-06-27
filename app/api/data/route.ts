import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'lib', 'data.json');

// Helper function to read data from JSON file
async function readData() {
  try {
    console.log(`📁 Reading data from: ${DATA_FILE_PATH}`);
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const parsedData = JSON.parse(data);
    console.log('📊 Data read successfully:', { 
      orders: parsedData.orders?.length || 0,
      users: parsedData.users?.length || 0,
      products: parsedData.products?.length || 0
    });
    return parsedData;
  } catch (error) {
    console.error('❌ Error reading data file:', error);
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
      lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

// GET - Retrieve data
export async function GET(request: NextRequest) {
  console.log('API: GET /api/data called');
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const data = await readData();
    
    if (type && data[type]) {
      console.log(`📋 API: Returning ${type} data`, { 
        count: data[type].length,
        hasData: !!data[type],
        dataType: typeof data[type],
        isArray: Array.isArray(data[type]),
        sampleIds: data[type].slice(0, 3).map((item: any) => item.id || item.name || 'no-id')
      });
      return NextResponse.json({ 
        success: true, 
        data: data[type],
        metadata: data.metadata 
      });
    }
    
    console.log('API: Returning all data');
    return NextResponse.json({ 
      success: true, 
      data,
      metadata: data.metadata 
    });
  } catch (error) {
    console.error('API Error in GET /api/data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read data' },
      { status: 500 }
    );
  }
}

// POST - Add new item or bulk update
export async function POST(request: NextRequest) {
  console.log('API: POST /api/data called');
  
  try {
    // Check if request has body content
    const contentLength = request.headers.get('content-length');
    const contentType = request.headers.get('content-type');
    
    console.log('API: Request headers:', { contentLength, contentType });
    
    if (!contentLength || contentLength === '0') {
      console.warn('API: Empty request body received');
      return NextResponse.json(
        { success: false, error: 'Request body is empty' },
        { status: 400 }
      );
    }
    
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('API: Invalid content type:', contentType);
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }
    
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('API: JSON parsing error:', jsonError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    if (!body || typeof body !== 'object') {
      console.warn('API: Request body is not a valid object:', body);
      return NextResponse.json(
        { success: false, error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }
    
    const { type, item, items, action } = body;
    
    const data = await readData();
    
    if (action === 'bulk_update' && items && type) {
      // Bulk update for admin sync
      console.log(`API: Bulk updating ${type}`, { count: items.length });
      data[type] = items;
    } else if (type && item) {
      // Add single item
      console.log(`API: Adding item to ${type}`, { itemId: item.id });
      
      if (!data[type]) {
        data[type] = [];
      }
      
      // Generate ID if not provided
      if (!item.id) {
        item.id = type === 'products' ? Date.now() : `${type.toUpperCase()}_${Date.now()}`;
      }
      
      data[type].push(item);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const success = await writeData(data);
    
    if (success) {
      console.log(`API: Successfully updated ${type} data`);
      return NextResponse.json({ 
        success: true, 
        message: `${type} data updated successfully`,
        data: data[type]
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error in POST /api/data:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// PUT - Update existing item
export async function PUT(request: NextRequest) {
  console.log('API: PUT /api/data called');
  
  try {
    // Check if request has body content
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
    
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('API: JSON parsing error in PUT:', jsonError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { type, id, item } = body;
    
    if (!type || !id || !item) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, id, item' },
        { status: 400 }
      );
    }
    
    const data = await readData();
    
    if (!data[type]) {
      return NextResponse.json(
        { success: false, error: `Type ${type} not found` },
        { status: 404 }
      );
    }
    
    console.log(`API: Updating ${type} item`, { id });
    
    const index = data[type].findIndex((existingItem: any) => 
      existingItem.id === id || existingItem.id === parseInt(id)
    );
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: `Item with id ${id} not found` },
        { status: 404 }
      );
    }
    
    data[type][index] = { ...data[type][index], ...item, id };
    
    const success = await writeData(data);
    
    if (success) {
      console.log(`API: Successfully updated ${type} item`, { id });
      return NextResponse.json({ 
        success: true, 
        message: `${type} item updated successfully`,
        data: data[type][index]
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error in PUT /api/data:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// DELETE - Remove item
export async function DELETE(request: NextRequest) {
  console.log('API: DELETE /api/data called');
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: type, id' },
        { status: 400 }
      );
    }
    
    const data = await readData();
    
    if (!data[type]) {
      return NextResponse.json(
        { success: false, error: `Type ${type} not found` },
        { status: 404 }
      );
    }
    
    console.log(`API: Deleting ${type} item`, { id });
    
    const initialLength = data[type].length;
    data[type] = data[type].filter((item: any) => 
      item.id !== id && item.id !== parseInt(id)
    );
    
    if (data[type].length === initialLength) {
      return NextResponse.json(
        { success: false, error: `Item with id ${id} not found` },
        { status: 404 }
      );
    }
    
    const success = await writeData(data);
    
    if (success) {
      console.log(`API: Successfully deleted ${type} item`, { id });
      return NextResponse.json({ 
        success: true, 
        message: `${type} item deleted successfully`,
        data: data[type]
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error in DELETE /api/data:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}