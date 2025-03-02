/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { firestore } from "@/firebase/config";
import { addDoc, collection, doc, getDoc, getDocs, Timestamp, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { format, isSameDay } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getReservationStatus, getStatusColor } from "../../utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/useAuth";

const timeSlots = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
];

interface IPendingReservation {
  id: string;
  created_at: Timestamp;
  datetime_booked: Timestamp;
  duration: number;
  email: string;
  guest_count: number;
  name: string;
  phone_number: string;
  special_request: string;
  status: number;
  table_assigned: number;
  updated_at: Timestamp;
}

interface ITable {
  table_id: number;
  name: string;
  capacity: number;
  location: string;
  updated_at: Timestamp;
  created_at: Timestamp;
}

const ReservationSystem = () => {
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showTableForm, setShowTableForm] = useState(false);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [newReservation, setNewReservation] = useState({
    name: "",
    phone_number: "",
    email: "",
    date: new Date(),
    time: "",
    guest_count: 1,
    special_requests: "",
    duration: 1,
  });

  const [newTable, setNewTable] = useState({
    table_name: "",
    capacity: 1,
    location: "indoor",
  });

  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchReservations = useCallback(async () => {
    const reservationsRef = collection(firestore, "reservations");
    const snapshot = await getDocs(reservationsRef);
    const reservationData = snapshot.docs.map((doc) => {
      const data = doc.data() as IPendingReservation;
      return {
        ...data,
        id: doc.id,
      };
    });

    setReservations(reservationData);
  }, []);

  // fetch tables from firestore
  const fetchTables = useCallback(async () => {
    const tablesRef = collection(firestore, "tables");
    const snapshot = await getDocs(tablesRef);
    const tableData = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        table_id: data.table_id,
        name: data.name,
        capacity: data.capacity,
        location: data.location,
        updated_at: data.updated_at,
        created_at: data.created_at,
      };
    });
    // sort tablesData by name in ascending order
    tableData.sort((a, b) => a.name.localeCompare(b.name));
    setTables(tableData);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login"); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, [fetchReservations, fetchTables]);

  const handleAddTable = async () => {
    setLoading(true);
    const tablesRef = collection(firestore, "tables");
    const snapshot = await getDocs(tablesRef);
    const tableData = snapshot.docs.map((doc) => doc.data() as ITable);
    const highestTableId = tableData.reduce((maxId, table) => Math.max(maxId, table.table_id), 0);
    const newTableId = highestTableId + 1;
    const tableDataToAdd: ITable = {
      table_id: newTableId,
      name: newTable.table_name,
      location: newTable.location,
      capacity: newTable.capacity,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    await addDoc(collection(firestore, "tables"), tableDataToAdd);

    setNewTable({
      table_name: "",
      capacity: 1,
      location: "indoor",
    });

    fetchTables();
    setLoading(false);
    setShowTableForm(false);
  };

  const handleAssignTable = async (reservationId: string, tableId: string) => {
    setLoading(true);
    const reservationDoc = doc(firestore, "reservations", reservationId);
    const table = tables.find((t) => t.table_id === Number(tableId));

    if (!table) {
      alert('Table not found');
      return;
    }

    // Fetch current reservations to check if the table is already assigned
    const reservationsRef = collection(firestore, "reservations");
    const snapshot = await getDocs(reservationsRef);
    const currentReservations = snapshot.docs.map((doc) => doc.data() as IPendingReservation);


    // Fetch the reservation to check guest_count
    const reservationSnapshot = await getDoc(reservationDoc);
    const reservationData = reservationSnapshot.data() as IPendingReservation;

    if (reservationData.guest_count > table.capacity) {
      alert("Guest count exceeds table capacity");
      return;
    }



    const isTableAssigned = currentReservations.some((res) => {
      const reservationStartTime = new Date(res.datetime_booked.seconds * 1000);
      const reservationEndTime = new Date(reservationStartTime);
      reservationEndTime.setHours(reservationEndTime.getHours() + res.duration);

      const newReservationStartTime = new Date(reservationData.datetime_booked.seconds * 1000);
      const newReservationEndTime = new Date(newReservationStartTime);
      newReservationEndTime.setHours(newReservationEndTime.getHours() + reservationData.duration);

      return res.table_assigned === Number(tableId) && res.status === 2 &&
        ((newReservationStartTime >= reservationStartTime && newReservationStartTime < reservationEndTime) ||
          (newReservationEndTime > reservationStartTime && newReservationEndTime <= reservationEndTime) ||
          (newReservationStartTime <= reservationStartTime && newReservationEndTime >= reservationEndTime));
    });

    if (isTableAssigned) {
      alert("Table is already assigned");
      return;
    }

    await updateDoc(reservationDoc, { table_assigned: Number(tableId), status: 2 });
    fetchReservations();
    setLoading(false);
  };

  const handleAddReservation = async () => {
    if (!newReservation.name || !newReservation.phone_number || !newReservation.email || !newReservation.date || !newReservation.time) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    const datetime_booked = new Date(newReservation.date);
    const [hours, minutes] = newReservation.time.split(":").map(Number);
    datetime_booked.setHours(hours, minutes);

    await addDoc(collection(firestore, "reservations"), {
      ...newReservation,
      datetime_booked: Timestamp.fromDate(datetime_booked),
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      status: 1, // Assuming 1 is the status for pending
      table_assigned: 0, // Assuming 0 means no table assigned yet
    });
    setNewReservation({
      name: "",
      phone_number: "",
      email: "",
      date: new Date(),
      time: "",
      guest_count: 1,
      special_requests: "",
      duration: 1,
    });
    fetchReservations();
    setShowForm(false);
    setLoading(false);
  };

  const filteredReservations = reservations.filter((reservation) =>
    isSameDay(new Date(reservation.datetime_booked.seconds * 1000), selectedDate)
  );

  if (authLoading) {
    return <div className="p-5 bg-gray-900 text-white min-h-screen">Loading...</div>;
  } else return (
    <div className="p-5 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <DatePicker
            selected={selectedDate}
            onChange={(date: any) => setSelectedDate(date)}
            className="bg-gray-700 text-white p-2 rounded"
          />
        </div>
        <h2 className="text-2xl font-bold">Table Booking</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-4 py-2 rounded">Add Reservation</button>
          <button onClick={() => setShowTableForm(true)} className="bg-green-600 text-white px-4 py-2 rounded">Add Table</button>
        </div>
      </div>

      <div className="grid grid-cols-[150px_repeat(12,1fr)] gap-1 border border-gray-700 mb-8">
        {/* Header Row */}
        <div className="border border-gray-700 p-2 bg-gray-800 font-bold">Tables</div>
        {timeSlots.map((time) => (
          <div key={time} className="border border-gray-700 p-2 bg-gray-800 font-bold text-center">{time}</div>
        ))}

        {/* Table Rows */}
        {tables.map((table) => (
          <React.Fragment key={table.id}>
            <div className="border border-gray-700 p-2 bg-gray-800">{table.name} ({table.capacity} people)</div>
            {timeSlots.map((time, index) => {
              const reservation = filteredReservations.find((res) => {
                const reservationTime = format(new Date(res.datetime_booked.seconds * 1000), "HH:mm");
                return Number(res.table_assigned) === table.table_id && reservationTime === time;
              });
              if (reservation) {
                return (
                  <div
                    key={time}
                    className="border border-gray-700 h-10 relative bg-blue-500 text-white text-sm rounded flex items-center justify-center"
                    style={{ gridColumn: `span ${reservation.duration}` }}
                  >
                    {reservation.name}
                  </div>
                );
              } else if (!filteredReservations.some((res) => {
                const reservationTime = format(new Date(res.datetime_booked.seconds * 1000), "HH:mm");
                return res?.table_assigned === table.id && timeSlots.indexOf(reservationTime) < index && timeSlots.indexOf(reservationTime) + res.duration > index;
              })) {
                return <div key={time} className="border border-gray-700 h-10 bg-gray-800"></div>;
              } else {
                return null;
              }
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Pending Reservations */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 mt-4">Pending Reservations</h3>
        <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-700">
              <th className="py-3 px-4 border-b border-gray-600 text-center">No</th>
              <th className="py-3 px-4 border-b border-gray-600 text-center">Date/Time</th>
              <th className="py-3 px-4 border-b border-gray-600 text-center">People</th>
              <th className="py-3 px-4 border-b border-gray-600 text-center">Name</th>
              <th className="py-3 px-4 border-b border-gray-600 text-center">Email</th>
              <th className="py-3 px-4 border-b border-gray-600 text-center">Status</th>

            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation, index) => (
              <tr key={reservation?.id} className="hover:bg-gray-700 transition-colors duration-200">
                <td className="py-3 px-4 border-b border-gray-600 text-center">{index + 1}</td>
                <td className="py-3 px-4 border-b border-gray-600 text-center">
                  {format(new Date(reservation.datetime_booked.seconds * 1000), "dd.MM.yyyy HH:mm")}
                </td>
                <td className="py-3 px-4 border-b border-gray-600 text-center">{reservation?.guest_count}</td>
                <td className="py-3 px-4 border-b border-gray-600 text-center">{reservation?.name}</td>
                <td className="py-3 px-4 border-b border-gray-600 text-center">{reservation?.email}</td>

                <td className="px-6 py-4 py-3 px-4 border-b border-gray-600 text-center">
                  <span className={`${getStatusColor(reservation.status)} text-white px-4 py-2 rounded`}>{getReservationStatus(reservation.status)}</span>
                </td>

                {reservation.status !== 2 && (
                  <td className="py-3 px-4 border-b border-gray-600 text-center">

                    <select
                      className="bg-gray-700 text-white p-2 rounded"
                      onChange={(e) => handleAssignTable(reservation.id, e.target.value)}
                    >
                      <option value="">Assign Table</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.table_id}>{table.name}</option>
                      ))}
                    </select>
                  </td>
                )}

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reservation Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Add Reservation</h3>
            <label className="block mb-2">Name:</label>
            <input
              type="text"
              className="w-full border border-gray-600 p-2 mb-2 bg-gray-700 text-white"
              value={newReservation.name}
              onChange={(e) => setNewReservation({ ...newReservation, name: e.target.value })}
            />

            <label className="block mb-2">Phone Number:</label>
            <input
              type="text"
              className="w-full border border-gray-600 p-2 mb-2 bg-gray-700 text-white"
              value={newReservation.phone_number}
              onChange={(e) => setNewReservation({ ...newReservation, phone_number: e.target.value })}
            />

            <label className="block mb-2">Email:</label>
            <input
              type="email"
              className="w-full border border-gray-600 p-2 mb-2 bg-gray-700 text-white"
              value={newReservation.email}
              onChange={(e) => setNewReservation({ ...newReservation, email: e.target.value })}
            />

            <label className="block mb-2">Date:</label>
            <DatePicker
              selected={newReservation.date}
              onChange={(date: Date | null) => date && setNewReservation({ ...newReservation, date })}
              className="w-full border border-gray-600 p-2 mb-2 bg-gray-700 text-white"
            />

            <label className="block mb-2">Time:</label>
            <select
              className="w-full border border-gray-600 p-2 mb-2 bg-gray-700 text-white"
              value={newReservation.time}
              onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
            >
              <option value="">Select Time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>

            <label className="block mb-2">Guest Count:</label>
            <input
              type="number"
              className="w-full border border-gray-600 p-2 mb-2 bg-gray-700 text-white"
              value={newReservation.guest_count}
              onChange={(e) => setNewReservation({ ...newReservation, guest_count: Number(e.target.value) })}
              min="1"
            />

            <label className="block mb-2">Special Requests:</label>
            <textarea
              className="w-full border border-gray-600 p-2 mb-2 bg-gray-700 text-white"
              value={newReservation.special_requests}
              onChange={(e) => setNewReservation({ ...newReservation, special_requests: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button disabled={loading} onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-600 rounded">Cancel</button>
              <button disabled={loading} onClick={handleAddReservation} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Table Form */}
      {showTableForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Add Table</h3>
            <label className="block mb-2">Table Name:</label>
            <input
              type="text"
              className="w-full border border-gray-600 p-2 mb-2 bg-gray-700 text-white"
              value={newTable.table_name}
              onChange={(e) => setNewTable({ ...newTable, table_name: e.target.value })}
            />

            <label className="block mb-2">Capacity:</label>
            <input
              type="number"
              className="w-full border border-gray-600 p-2 mb-2 bg-gray-700 text-white"
              value={newTable.capacity}
              onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
              min="1"
            />

            <label className="block mb-2">Location:</label>
            <select
              className="w-full border border-gray-600 p-2 mb-2 bg-gray-700 text-white"
              value={newTable.location}
              onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="floor1">Floor 1</option>
              <option value="floor2">Floor 2</option>
            </select>

            <div className="flex justify-end gap-2">
              <button disabled={loading} onClick={() => setShowTableForm(false)} className="px-4 py-2 border border-gray-600 rounded">Cancel</button>
              <button disabled={loading} onClick={handleAddTable} className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationSystem;