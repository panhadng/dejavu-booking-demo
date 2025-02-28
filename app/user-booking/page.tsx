"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { firestore } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";

const UserBookingPage = () => {
  const [formData, setFormData] = useState({
    customer_name: "",
    phone_number: "",
    email: "",
    date: "",
    time: "",
    number_of_people: "",
    special_requests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const reservationsRef = collection(firestore, "reservations");
      await addDoc(reservationsRef, {
        ...formData,
        created_at: new Date(),
        status: "pending",
      });

      setSubmitStatus({
        type: "success",
        message:
          "Reservation submitted successfully! We will contact you shortly.",
      });
      setFormData({
        customer_name: "",
        phone_number: "",
        email: "",
        date: "",
        time: "",
        number_of_people: "",
        special_requests: "",
      });
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Failed to submit reservation. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Logo in top left */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link href="/">
          <Image
            src="/dejavu-logo.jpg"
            alt="Deja Vu Outdoor Pub"
            width={100}
            height={100}
            className="rounded-lg shadow-xl"
          />
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl bg-black/80 rounded-lg shadow-xl p-6 space-y-8 border-2 border-amber-700">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-amber-500">
              Make a Reservation
            </h2>
            <p className="text-gray-300">
              Book a table at our premium outdoor pub. Please fill out the form
              below.
            </p>
          </div>

          {submitStatus.type && (
            <div
              className={`p-4 rounded-md ${
                submitStatus.type === "success"
                  ? "bg-green-800/50 text-green-200"
                  : "bg-red-800/50 text-red-200"
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                required
                className="mt-1 block w-full rounded-md bg-gray-800 border-amber-700 text-white 
                  shadow-sm focus:border-amber-500 focus:ring-amber-500 placeholder-gray-400
                  px-4 py-3"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-300"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                required
                className="mt-1 block w-full rounded-md bg-gray-800 border-amber-700 text-white 
                  shadow-sm focus:border-amber-500 focus:ring-amber-500 placeholder-gray-400
                  px-4 py-3"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full rounded-md bg-gray-800 border-amber-700 text-white 
                  shadow-sm focus:border-amber-500 focus:ring-amber-500 placeholder-gray-400
                  px-4 py-3"
              />
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-300"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md bg-gray-800 border-amber-700 text-white 
                    shadow-sm focus:border-amber-500 focus:ring-amber-500 placeholder-gray-400
                    px-4 py-3 [color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-300"
                >
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md bg-gray-800 border-amber-700 text-white 
                    shadow-sm focus:border-amber-500 focus:ring-amber-500 placeholder-gray-400
                    px-4 py-3 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="people"
                className="block text-sm font-medium text-gray-300"
              >
                Number of People
              </label>
              <select
                id="people"
                value={formData.number_of_people}
                onChange={(e) =>
                  setFormData({ ...formData, number_of_people: e.target.value })
                }
                required
                className="mt-1 block w-full rounded-md bg-gray-800 border-amber-700 text-white 
                  shadow-sm focus:border-amber-500 focus:ring-amber-500 placeholder-gray-400
                  px-4 py-3 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] 
                  bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="" className="text-gray-400 text-sm">
                  Select number of people
                </option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="requests"
                className="block text-sm font-medium text-gray-300"
              >
                Special Requests
              </label>
              <textarea
                id="requests"
                value={formData.special_requests}
                onChange={(e) =>
                  setFormData({ ...formData, special_requests: e.target.value })
                }
                rows={4}
                className="mt-1 block w-full rounded-md bg-gray-800 border-amber-700 text-white 
                  shadow-sm focus:border-amber-500 focus:ring-amber-500 placeholder-gray-400
                  px-4 py-3"
                placeholder="Any special requests or notes..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border-2 border-amber-600 
                rounded-full shadow-sm text-sm font-medium text-white bg-amber-700 
                hover:bg-white hover:text-amber-700 hover:border-amber-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 
                focus:ring-offset-gray-800 transition-colors duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Make Reservation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserBookingPage;
