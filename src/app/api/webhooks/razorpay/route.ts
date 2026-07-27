import { NextResponse } from "next/server";
import crypto from "crypto";
import { admin, adminDb } from "@/utils/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.text(); // Raw body for signature verification
    const sig = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!sig || !secret) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    const expectedSig = crypto.createHmac("sha256", secret).update(body).digest("hex");

    if (expectedSig !== sig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Support both payment.captured and order.paid events
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const entity = event.payload?.payment?.entity || event.payload?.order?.entity || {};
      const notes = entity.notes || {};

      const userId = notes.userId;
      const packageId = notes.packageId;

      if (!adminDb) {
        console.warn("⚠️ Webhook received but adminDb is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_KEY.");
      } else if (!userId || !packageId) {
        console.warn(`⚠️ Webhook received but metadata missing (userId: ${userId}, packageId: ${packageId}).`);
      } else {
        let addedCredits = 0;
        if (packageId === "pack_1") addedCredits = 2;
        if (packageId === "pack_4") addedCredits = 4;
        if (packageId === "pack_10") addedCredits = 10;

        if (addedCredits > 0) {
          const userRef = adminDb.collection("users").doc(userId);
          
          await userRef.set(
            { credits: admin.firestore.FieldValue.increment(addedCredits) },
            { merge: true }
          );

          console.log(`✅ Successfully added ${addedCredits} credits to user ${userId}`);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
