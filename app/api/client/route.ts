// /app/api/client/route.ts
import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, getDocs, writeBatch, query, where } from "firebase/firestore";
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

// Delete a client by VAT number (DELETE)
export async function DELETE(request: Request) {
  try {
    const { vatNumber } = await request.json();
    const q = query(collection(db, "clients"), where("vatNumber", "==", vatNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "No client found with the given VAT number." }, { status: 404 });
    }

    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({ message: "Client(s) deleted successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ error: "Failed to delete client." }, { status: 500 });
  }
}
