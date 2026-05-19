import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/utils/firebaseAdmin";
import * as admin from "firebase-admin";

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

    // We only care about payment.captured or order.paid
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      
      const userId = paymentEntity.notes?.userId;
      const packageId = paymentEntity.notes?.packageId;

      if (userId && packageId && adminDb) {
        let addedCredits = 0;
        if (packageId === "pack_1") addedCredits = 1;
        if (packageId === "pack_4") addedCredits = 4;
        if (packageId === "pack_10") addedCredits = 10;

        if (addedCredits > 0) {
          const userRef = adminDb.collection("users").doc(userId);
          
          await adminDb.runTransaction(async (t) => {
            const doc = await t.get(userRef);
            if (!doc.exists) {
              t.set(userRef, { credits: addedCredits });
            } else {
              const currentCredits = doc.data()?.credits || 0;
              t.update(userRef, { credits: currentCredits + addedCredits });
            }
          });

          console.log(`Successfully added ${addedCredits} credits to user ${userId}`);
        }
      } else {
        console.warn("Webhook processed but userId/packageId missing or adminDb not initialized.");
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
