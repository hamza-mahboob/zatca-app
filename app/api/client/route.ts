// /app/api/client/route.ts
import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

// Save a new client (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the request body
    const { name, country, vatNumber, address, phone, email } = body;
    if (!name || !email) {
      return NextResponse.json({ error: "Name and Email are required." }, { status: 400 });
    }

    // Add client to Firestore
    await addDoc(collection(db, "clients"), {
      name,
      country,
      vatNumber,
      address,
      phone,
      email,
    });

    return NextResponse.json({ message: "Client saved successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Error saving client:", error);
    return NextResponse.json({ error: "Failed to save client." }, { status: 500 });
  }
}

// Get all clients (GET)
export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, "clients"));
    const clients = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ clients }, { status: 200 });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients." }, { status: 500 });
  }
}
