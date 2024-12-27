import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

// Save a new invoice (POST)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate the request body
        const { seller, client, items, totals, invoiceDate, dueDate, salesRep, qrCodeDataUrl } = body;
        let { invoiceNumber } = body;
        if (!seller || !client || !items || !totals || !invoiceNumber || !invoiceDate) {
            console.log('returns from here', body);
            return NextResponse.json({ error: "Missing required invoice fields." }, { status: 400 });
        }

        // Get all invoices to check the invoiceNumber
        const querySnapshot = await getDocs(collection(db, "invoices"));
        const totalInvoices = querySnapshot.size;

        if (invoiceNumber <= totalInvoices) {
            invoiceNumber = (totalInvoices + 1).toString();
        }

        // Add invoice to Firestore
        await addDoc(collection(db, "invoices"), {
            seller,
            client,
            items,
            totals,
            invoiceNumber,
            invoiceDate,
            dueDate,
            salesRep,
            qrCodeDataUrl
        });

        return NextResponse.json({ message: "Invoice saved successfully!" }, { status: 201 });
    } catch (error) {
        console.error("Error saving invoice:", error);
        return NextResponse.json({ error: "Failed to save invoice." }, { status: 500 });
    }
}

// Get all invoices (GET)
export async function GET() {
    try {
        const querySnapshot = await getDocs(collection(db, "invoices"));
        const invoices = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ invoices }, { status: 200 });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return NextResponse.json({ error: "Failed to fetch invoices." }, { status: 500 });
    }
}