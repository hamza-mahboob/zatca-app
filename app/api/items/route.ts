// /app/api/items/route.ts
import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

// Save a new item (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the request body
    const { description, price } = body;
    if (!description || !price) {
      return NextResponse.json({ error: "Description and Price are required." }, { status: 400 });
    }

    // Add item to Firestore
    await addDoc(collection(db, "items"), {
      description,
      price: Number(price),
    });

    return NextResponse.json({ message: "Item saved successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Error saving item:", error);
    return NextResponse.json({ error: "Failed to save item." }, { status: 500 });
  }
}

// Get all items (GET)
export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, "items"));
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ error: "Failed to fetch items." }, { status: 500 });
  }
}
