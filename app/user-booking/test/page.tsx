"use client";

import { useState, useEffect } from "react";
import { firestore } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

interface FirestoreReservation {
  id: string;
  created_at: Timestamp;
  datetime_booked: Timestamp;
  email: string;
  guest_count: number;
  name: string;
  phone_number: string;
  special_requests: string;
  status: number;
  table_assigned: number;
  updated_at: Timestamp;
}

interface Reservation {
  id: string;
  created_at: string;
  datetime_booked: string;
  email: string;
  guest_count: number;
  name: string;
  phone_number: string;
  special_requests: string;
  status: number;
  table_assigned: number;
  updated_at: string;
}

const TestPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const convertTimestampToString = (timestamp: Timestamp): string => {
    return timestamp.toDate().toLocaleString();
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const reservationsRef = collection(firestore, "reservations");
        const snapshot = await getDocs(reservationsRef);
        const reservationData = snapshot.docs.map((doc) => {
          const data = doc.data() as FirestoreReservation;
          return {
            ...data,
            id: doc.id,
            created_at: data.created_at
              ? convertTimestampToString(data.created_at)
              : "N/A",
            updated_at: data.updated_at
              ? convertTimestampToString(data.updated_at)
              : "N/A",
            datetime_booked: data.datetime_booked
              ? convertTimestampToString(data.datetime_booked)
              : "N/A",
          };
        });

        console.log("Fetched reservations:", reservationData);
        setReservations(reservationData);
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError("Error fetching reservations: " + (err as Error).message);
      }
    };

    fetchReservations();
  }, []);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Test Firebase Connection</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-400 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl">Reservations:</h2>
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="border border-amber-700 p-6 rounded-lg bg-black/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-amber-500 font-semibold">Reservation ID:</p>
                <p className="text-gray-300">{reservation.id}</p>
              </div>
              <div>
                <p className="text-amber-500 font-semibold">Name:</p>
                <p className="text-gray-300">{reservation.name}</p>
              </div>
              <div>
                <p className="text-amber-500 font-semibold">Email:</p>
                <p className="text-gray-300">{reservation.email}</p>
              </div>
              <div>
                <p className="text-amber-500 font-semibold">Phone:</p>
                <p className="text-gray-300">{reservation.phone_number}</p>
              </div>
              <div>
                <p className="text-amber-500 font-semibold">
                  Booking Date/Time:
                </p>
                <p className="text-gray-300">{reservation.datetime_booked}</p>
              </div>
              <div>
                <p className="text-amber-500 font-semibold">Guest Count:</p>
                <p className="text-gray-300">{reservation.guest_count}</p>
              </div>
              <div>
                <p className="text-amber-500 font-semibold">Status:</p>
                <p className="text-gray-300">{reservation.status}</p>
              </div>
              <div>
                <p className="text-amber-500 font-semibold">Table Assigned:</p>
                <p className="text-gray-300">{reservation.table_assigned}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-amber-500 font-semibold">
                  Special Requests:
                </p>
                <p className="text-gray-300">{reservation.special_requests}</p>
              </div>
              <div>
                <p className="text-amber-500 font-semibold">Created At:</p>
                <p className="text-gray-300">{reservation.created_at}</p>
              </div>
              <div>
                <p className="text-amber-500 font-semibold">Updated At:</p>
                <p className="text-gray-300">{reservation.updated_at}</p>
              </div>
            </div>
          </div>
        ))}
        {reservations.length === 0 && !error && (
          <p className="text-gray-400">No reservations found.</p>
        )}
      </div>
    </div>
  );
};

export default TestPage;
