"use client";

import { useState, useEffect, useCallback } from "react";
import { firestore } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { IoRefresh } from "react-icons/io5";
import Link from "next/link";

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
  reservation_id: string;
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
  reservation_id: string;
}

const TestPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const convertTimestampToString = (timestamp: Timestamp): string => {
    return timestamp.toDate().toLocaleString();
  };

  const fetchReservations = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <nav className="sticky top-0 backdrop-blur-sm px-8 py-4 mb-4">
        <div className="flex justify-start space-x-4">
          <button
            onClick={() => router.push("/user-booking")}
            className="px-4 py-2 bg-black/30 hover:bg-black/50 rounded-lg transition-colors text-white font-medium flex items-center gap-2"
          >
            <IoArrowBack className="text-xl" />
          </button>
          <button
            onClick={fetchReservations}
            className="px-4 py-2 bg-black/30 hover:bg-black/50 rounded-lg transition-colors text-white font-medium flex items-center gap-2"
          >
            <IoRefresh className="text-xl" />
          </button>
        </div>
      </nav>

      <div className="px-8">
        <div className="flex items-center gap-4 mb-8">
          <Image
            src="/dejavu-logo.jpg"
            alt="Restaurant Logo"
            width={100}
            height={33}
            className="cursor-pointer"
            onClick={() => router.push("/")}
          />
          <div>
            <h1 className="text-2xl font-bold">Test Firebase Connection</h1>
            <h2 className="text-xl mt-2">
              Below are all the reservations in the system
            </h2>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-400 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="border border-amber-700 p-6 rounded-lg bg-black/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-amber-500 font-semibold">
                    Reservation ID:
                  </p>
                  <Link
                    href={`/user-booking/${reservation.id}`}
                    className="text-gray-300 hover:text-amber-500 transition-colors"
                  >
                    {reservation.reservation_id}
                  </Link>
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
                  <p className="text-amber-500 font-semibold">
                    Table Assigned:
                  </p>
                  <p className="text-gray-300">{reservation.table_assigned}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-amber-500 font-semibold">
                    Special Requests:
                  </p>
                  <p className="text-gray-300">
                    {reservation.special_requests}
                  </p>
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
    </div>
  );
};

export default TestPage;
