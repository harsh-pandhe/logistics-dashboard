"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { firebaseConfig } from "@/lib/firebase-config";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const RazorpayPaymentForm = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to create a shipment");
      }

      const trackingId = `TRK${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")}`;

      await addDoc(collection(db, "shipments"), {
        userId: user.uid,
        trackingId,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      router.push("/dashboard/shipments");
    } catch (error: any) {
      setError(error.message || "Failed to create shipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    const options = {
      key: "rzp_test_LKzUHlKc5BACvO",
      amount: 100 * 100,
      currency: "INR",
      name: "Your Company",
      description: "Test Transaction",
      image: "/your-logo.png",
      handler: async function (response: any) {
        await handleSubmit();
        if (formRef.current) {
          formRef.current.submit();
        }
        setTimeout(() => {
          router.push("/dashboard/shipments");
        }, 1000);
      },
      prefill: {
        name: "Sanket Rajput",
        email: "sanket@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {error && <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">{error}</div>}
      <form ref={formRef} action="/" method="POST" className="flex flex-col gap-4 w-full max-w-sm">
        <Button type="button" onClick={handlePayment} disabled={loading} className="gap-2 w-full">
          {loading ? "Processing..." : "Pay & Create Shipment"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};

export default RazorpayPaymentForm;
