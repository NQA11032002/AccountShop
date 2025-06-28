import { NextRequest, NextResponse } from 'next/server';

// Mock payment gateway integrations
class PaymentGateway {
  
  // Mock Stripe/Card payment processing
  static async processCardPayment(paymentData: any) {
    console.log("Processing card payment via Stripe", paymentData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    // Simulate success/failure (95% success rate)
    const success = Math.random() > 0.05;
    
    if (success) {
      return {
        success: true,
        transactionId: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed',
        method: 'card',
        amount: paymentData.amount,
        fee: paymentData.fee || 2500,
        cardLast4: paymentData.cardNumber?.slice(-4) || '****',
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error("Card declined by issuing bank");
    }
  }

  // Mock MoMo payment processing
  static async processMoMoPayment(paymentData: any) {
    console.log("Processing MoMo payment", paymentData);
    
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 500));
    
    const success = Math.random() > 0.02; // 98% success rate
    
    if (success) {
      return {
        success: true,
        transactionId: `momo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed',
        method: 'momo',
        amount: paymentData.amount,
        fee: 0,
        phoneNumber: paymentData.phoneNumber,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error("Insufficient MoMo wallet balance");
    }
  }

  // Mock Banking payment processing
  static async processBankingPayment(paymentData: any) {
    console.log("Processing banking payment", paymentData);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Banking payments are always "successful" in creating transfer instructions
    return {
      success: true,
      transactionId: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending', // Banking starts as pending
      method: 'banking',
      amount: paymentData.amount,
      fee: 0,
      transferInfo: {
        bankAccount: "1234567890",
        bankName: "QAI Bank",
        accountHolder: "QAI Store",
        transferAmount: paymentData.amount,
        transferContent: `QAI ${paymentData.orderId}`,
        referenceCode: `REF${Date.now()}`
      },
      timestamp: new Date().toISOString()
    };
  }

  // Mock Crypto payment processing
  static async processCryptoPayment(paymentData: any) {
    console.log("Processing crypto payment", paymentData);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculate crypto amounts based on mock exchange rates
    const cryptoRates: { [key: string]: number } = {
      'BTC': 1000000000, // 1 BTC = 1B VND
      'USDT': 23000,     // 1 USDT = 23k VND
      'ETH': 50000000    // 1 ETH = 50M VND
    };
    
    const cryptoAmount = (paymentData.amount / cryptoRates[paymentData.cryptoType]).toFixed(8);
    
    return {
      success: true,
      transactionId: `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending', // Crypto needs blockchain confirmation
      method: 'crypto',
      amount: paymentData.amount,
      fee: 0,
      cryptoInfo: {
        paymentAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        cryptoAmount,
        cryptoType: paymentData.cryptoType,
        qrCode: `${paymentData.cryptoType}:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=${cryptoAmount}`,
        referenceCode: `CRYPTO${Date.now()}`
      },
      timestamp: new Date().toISOString()
    };
  }

  // Mock Wallet/Coins payment processing  
  static async processWalletPayment(paymentData: any) {
    console.log("💰 Processing wallet/coins payment", paymentData);
    
    // Simulate wallet processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    // For wallet payments, assume coins were already deducted by WalletContext
    // This method just confirms the payment completion
    return {
      success: true,
      transactionId: `WALLET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      method: 'wallet',
      amount: paymentData.amount,
      fee: 0,
      coinsDeducted: paymentData.amount,
      timestamp: new Date().toISOString()
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, paymentData, orderId } = body;

    console.log("Payment API called", { method, orderId, amount: paymentData.amount });

    if (!method || !paymentData || !orderId) {
      return NextResponse.json({
        success: false,
        error: "Missing required payment data"
      }, { status: 400 });
    }

    let result;

    // Route to appropriate payment processor
    switch (method) {
      case 'card':
        result = await PaymentGateway.processCardPayment(paymentData);
        break;
      
      case 'momo':
        result = await PaymentGateway.processMoMoPayment(paymentData);
        break;
      
      case 'banking':
        result = await PaymentGateway.processBankingPayment(paymentData);
        break;
      
      case 'crypto':
        result = await PaymentGateway.processCryptoPayment(paymentData);
        break;
      
      case 'wallet':
      case 'coins':
        result = await PaymentGateway.processWalletPayment(paymentData);
        break;
      
      default:
        return NextResponse.json({
          success: false,
          error: "Unsupported payment method"
        }, { status: 400 });
    }

    console.log("Payment processed successfully", { method, orderId, transactionId: result.transactionId });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error("Payment processing error:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message || "Payment processing failed"
    }, { status: 500 });
  }
}

// GET endpoint for payment status checking
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get('transactionId');
  const method = searchParams.get('method');

  if (!transactionId || !method) {
    return NextResponse.json({
      success: false,
      error: "Missing transaction ID or payment method"
    }, { status: 400 });
  }

  console.log("Checking payment status", { transactionId, method });

  // Mock status checking - in real implementation, this would call external APIs
  try {
    // Simulate different statuses based on payment method
    let status = 'completed';
    
    if (method === 'banking' || method === 'crypto') {
      // These methods might still be pending
      status = Math.random() > 0.3 ? 'completed' : 'pending';
    }

    const statusData = {
      transactionId,
      status,
      method,
      lastChecked: new Date().toISOString(),
      confirmations: method === 'crypto' ? Math.floor(Math.random() * 6) + 1 : null
    };

    console.log("Payment status retrieved", statusData);

    return NextResponse.json({
      success: true,
      data: statusData
    });

  } catch (error: any) {
    console.error("Status check error:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message || "Status check failed"
    }, { status: 500 });
  }
}