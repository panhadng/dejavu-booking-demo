import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[url('/pub-bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-black/50 flex flex-col items-center justify-center p-8">
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
            className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-amber-700 
              hover:bg-white hover:text-amber-700
              rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl
              border-2 border-amber-600 hover:border-amber-700"
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
