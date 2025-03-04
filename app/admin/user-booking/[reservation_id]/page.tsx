/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { firestore } from "@/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import Image from "next/image";
import QRCode from "react-qr-code";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";
// import { useAuth } from "@/services/useAuth"; // Comment out auth import

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
  payment_status?: string;
  notes?: string;
  arrival_time?: Date;
}

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  // const { isAuthenticated, loading:authLoading } = useAuth(); // Comment out auth hook
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedReservation, setUpdatedReservation] = useState<
    Partial<Reservation>
  >({});

  // Comment out authentication check
  /*
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?fromQR=true&reservation_id=${params.reservation_id}`);
    }
  }, [isAuthenticated, authLoading, router]);
  */

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

  const handleUpdateReservation = async () => {
    try {
      const docRef = doc(firestore, "reservations", reservation!.id);
      await updateDoc(docRef, {
        ...updatedReservation,
        updated_at: new Date(),
      });

      setReservation((prev) => ({
        ...prev!,
        ...updatedReservation,
        updated_at: new Date(),
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating reservation:", err);
      setError("Failed to update reservation");
    }
  };

  // Remove auth loading check
  /*
  if (authLoading) {
    return <div className="flex items-center justify-center p-5 bg-gray-900 text-white min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  }
  */

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
      <nav className="sticky top-0 backdrop-blur-sm px-8 py-4 mb-4 border-b border-amber-700/30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-black/30 hover:bg-black/50 rounded-lg transition-colors text-white font-medium flex items-center gap-2"
          >
            <IoArrowBack className="text-xl" />
            Back
          </button>
          <Image
            src="/dejavu-logo.jpg"
            alt="Restaurant Logo"
            width={100}
            height={33}
            className="cursor-pointer"
            onClick={() => router.push("/")}
          />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8 bg-black/40 p-8 rounded-lg border-2 border-amber-500">
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              Table Number
            </h2>
            <div className="bg-black/40 rounded-2xl p-8 border border-amber-600 w-48 h-48 flex items-center justify-center">
              <span className="text-4xl font-bold text-amber-500">
                {reservation.table_assigned || "—"}
              </span>
            </div>
            {isEditing && (
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="number"
                  className="w-24 bg-gray-800 text-white p-2 rounded border border-amber-500 text-center text-xl"
                  value={
                    updatedReservation.table_assigned ??
                    reservation.table_assigned
                  }
                  onChange={(e) =>
                    setUpdatedReservation({
                      ...updatedReservation,
                      table_assigned: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6 bg-black/50 p-6 rounded-lg border border-amber-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-amber-500">
                Admin Controls
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded"
              >
                {isEditing ? "Cancel Edit" : "Edit Details"}
              </button>
            </div>

            <div>
              <p className="text-amber-500 font-semibold">
                Reservation Status:
              </p>
              {isEditing ? (
                <select
                  className="w-full bg-gray-800 text-white p-2 rounded"
                  value={updatedReservation.status ?? reservation.status}
                  onChange={(e) =>
                    setUpdatedReservation({
                      ...updatedReservation,
                      status: parseInt(e.target.value),
                    })
                  }
                >
                  <option value={1}>Pending</option>
                  <option value={2}>Confirmed</option>
                  <option value={3}>Seated</option>
                  <option value={4}>Completed</option>
                  <option value={5}>Cancelled</option>
                </select>
              ) : (
                <div
                  className={`inline-block px-3 py-1 rounded-full ${
                    reservation.status === 1
                      ? "bg-yellow-600/50"
                      : reservation.status === 2
                      ? "bg-blue-600/50"
                      : reservation.status === 3
                      ? "bg-green-600/50"
                      : reservation.status === 4
                      ? "bg-purple-600/50"
                      : "bg-red-600/50"
                  }`}
                >
                  {reservation.status === 1
                    ? "Pending"
                    : reservation.status === 2
                    ? "Confirmed"
                    : reservation.status === 3
                    ? "Seated"
                    : reservation.status === 4
                    ? "Completed"
                    : "Cancelled"}
                </div>
              )}
            </div>

            <div>
              <p className="text-amber-500 font-semibold">Admin Notes:</p>
              {isEditing ? (
                <textarea
                  className="w-full bg-gray-800 text-white p-2 rounded"
                  value={updatedReservation.notes ?? reservation.notes ?? ""}
                  onChange={(e) =>
                    setUpdatedReservation({
                      ...updatedReservation,
                      notes: e.target.value,
                    })
                  }
                  rows={4}
                />
              ) : (
                <p className="text-gray-300">
                  {reservation.notes || "No notes"}
                </p>
              )}
            </div>

            {isEditing && (
              <button
                onClick={handleUpdateReservation}
                className="w-full py-2 bg-green-700 hover:bg-green-600 rounded"
              >
                Save Changes
              </button>
            )}
          </div>

          <div className="space-y-6 bg-black/50 p-6 rounded-lg border border-amber-700">
            <h2 className="text-xl font-bold text-amber-500">
              Customer Details
            </h2>

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
              <p className="text-amber-500 font-semibold">Special Requests:</p>
              <p className="text-gray-300">{reservation.special_requests}</p>
            </div>
            <div>
              <p className="text-amber-500 font-semibold">
                Contact Information:
              </p>
              <p className="text-gray-300">Phone: {reservation.phone_number}</p>
              <p className="text-gray-300">
                Email: {reservation.email || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-amber-500 font-semibold">Booking Timeline:</p>
              <p className="text-gray-300">
                Created: {reservation.created_at.toLocaleString()}
              </p>
              <p className="text-gray-300">
                Last Updated: {reservation.updated_at.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-black/50 p-6 rounded-lg border border-amber-700">
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <p className="text-amber-500 font-semibold">Reservation QR Code</p>
            <div className="bg-white p-4 rounded-lg">
              <QRCode
                value={`${
                  typeof window !== "undefined" ? window.location.origin : ""
                }/user-booking/${reservation.reservation_id}`}
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
  );
}
