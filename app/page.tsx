import Image from "next/image";
import Link from "next/link";
import { FaUser } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-[url('/pub-bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-black/50 flex flex-col items-center justify-center p-8 relative">
        <Link
          href="/login"
          className="absolute top-4 right-4 p-2 text-sm font-semibold text-white bg-black/50 
            hover:bg-white hover:text-var(--color-primary-hover)
            rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl
            border-2 border-var(--color-border) hover:border-var(--color-border-hover)"
        >
          <FaUser size={20} />
        </Link>
        <main className="flex flex-col items-center gap-8 max-w-xl text-center">
          <Image
            className="rounded-lg shadow-2xl"
            src="/dejavu-logo.jpg"
            alt="Deja Vu Outdoor Pub"
            width={300}
            height={300}
            priority
          />

          <div className="space-y-4 text-white">
            <h1 className="text-4xl sm:text-5xl font-bold">Deja Vu</h1>
            <p className="text-xl sm:text-2xl text-gray-200">
              Cambodia&apos;s Premier Outdoor Pub Experience
            </p>
          </div>

          <Link
            href="/user-booking"
            className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-var(--color-primary) 
              hover:bg-white hover:text-var(--color-primary-hover)
              rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl
              border-2 border-var(--color-border) hover:border-var(--color-border-hover)"
          >
            Book Now
          </Link>
        </main>

        <footer className="absolute bottom-4 text-sm text-gray-300">
          <p>
            © {new Date().getFullYear()} Deja Vu Outdoor Pub • Phnom Penh,
            Cambodia
          </p>
        </footer>
      </div>
    </div>
  );
}