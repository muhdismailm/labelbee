import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay environment variables are missing.");
      return NextResponse.json(
        { error: "Razorpay credentials are not configured on the server." },
        { status: 500 }
      );
    }

    let packageId = "pack_1";
    let userId = "";
    try {
      const body = await req.json();
      if (body.packageId) {
        packageId = body.packageId;
      }
      if (body.userId) {
        userId = body.userId;
      }
    } catch (e) {
      // Default to pack_1 if body is empty or unparsable
    }

    // Secure server-side pricing definitions (paise: ₹1 = 100 paise)
    const pricingMap: Record<string, number> = {
      pack_1: 1100,  // ₹11.00
      pack_4: 3300,  // ₹33.00
      pack_10: 9900, // ₹99.00
    };

    const amount = pricingMap[packageId];
    if (!amount) {
      return NextResponse.json(
        { error: "Invalid credit package selected." },
        { status: 400 }
      );
    }

    const currency = "INR";
    const receipt = `receipt_slip_${packageId}_${Date.now()}`;

    // Basic authentication token
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
        notes: {
          packageId,
          userId,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay Order API error:", data);
      return NextResponse.json(
        { error: data.error?.description || "Failed to create Razorpay order." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: keyId, // Send keyId so frontend knows which public key to use
    });
  } catch (error: any) {
    console.error("API error creating Razorpay order:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
