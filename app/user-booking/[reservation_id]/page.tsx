"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { firestore } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import Image from "next/image";
import QRCode from "react-qr-code";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";

interface Reservation {
  id: string;
  name: string;
  phone_number: string;
  email: string | null;
  datetime_booked: Date;
  guest_count: number;
  special_requests: string;
  status: number;
  table_assigned: number;
  created_at: Date;
  updated_at: Date;
  reservation_id: string;
}

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        console.log("Fetching reservation with ID:", params.reservation_id);

        const reservationsRef = collection(firestore, "reservations");
        const q = query(
          reservationsRef,
          where("reservation_id", "==", params.reservation_id)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data();
          console.log("Fetched data:", data);

          setReservation({
            ...data,
            datetime_booked: data.datetime_booked.toDate(),
            created_at: data.created_at.toDate(),
            updated_at: data.updated_at.toDate(),
          } as Reservation);
        } else {
          console.log("No reservation found with ID:", params.reservation_id);
          setError("Reservation not found");
        }
      } catch (err) {
        console.error("Error fetching reservation:", err);
        setError("Error fetching reservation details");
      }
    };

    if (params.reservation_id) {
      fetchReservation();
    } else {
      console.log("No reservation_id in params");
    }
  }, [params.reservation_id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-900/50 border border-red-400 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
            <p>Loading reservation details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="sticky top-0 backdrop-blur-sm px-8 py-4 mb-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-black/30 hover:bg-black/50 rounded-lg transition-colors text-white font-medium flex items-center gap-2"
        >
          <IoArrowBack className="text-xl" />
          Back
        </button>
      </nav>

      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <Image
            src="/dejavu-logo.jpg"
            alt="Restaurant Logo"
            width={100}
            height={33}
            className="cursor-pointer"
            onClick={() => router.push("/")}
          />
          <h1 className="text-2xl font-bold">Reservation Details</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6 bg-black/50 p-6 rounded-lg border border-amber-700">
            <div>
              <p className="text-amber-500 font-semibold">Reservation ID:</p>
              <p className="text-gray-300">{reservation.reservation_id}</p>
            </div>
            <div>
              <p className="text-amber-500 font-semibold">Name:</p>
              <p className="text-gray-300">{reservation.name}</p>
            </div>
            <div>
              <p className="text-amber-500 font-semibold">Date & Time:</p>
              <p className="text-gray-300">
                {reservation.datetime_booked.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-amber-500 font-semibold">Number of Guests:</p>
              <p className="text-gray-300">{reservation.guest_count}</p>
            </div>
            <div>
              <p className="text-amber-500 font-semibold">Status:</p>
              <p className="text-gray-300">
                {reservation.status === 1 ? "Pending" : "Confirmed"}
              </p>
            </div>
            {reservation.special_requests && (
              <div>
                <p className="text-amber-500 font-semibold">
                  Special Requests:
                </p>
                <p className="text-gray-300">{reservation.special_requests}</p>
              </div>
            )}
          </div>

          <div className="space-y-6 bg-black/50 p-6 rounded-lg border border-amber-700">
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <p className="text-amber-500 font-semibold">
                Reservation QR Code
              </p>
              <div className="bg-white p-4 rounded-lg">
                <QRCode
                  value={`${
                    typeof window !== "undefined" ? window.location.origin : ""
                  }admin/user-booking/${reservation.reservation_id}${"adminScan"}`}
                  size={200}
                />
              </div>
              <p className="text-sm text-gray-400 text-center">
                Show this QR code when you arrive at the restaurant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
