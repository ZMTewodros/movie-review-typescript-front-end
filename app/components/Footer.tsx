import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* About Us Column */}
        <div>
          <h3 className="text-white text-lg font-bold mb-2">About Us</h3>
          <p className="text-xs leading-relaxed text-gray-400">
            We are a passionate community dedicated to the art of cinema.
            Our platform allows users to discover hidden gems.
          </p>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 className="text-white text-lg font-bold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-400 transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/movies" className="hover:text-blue-400 transition">
                Movies
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-blue-400 transition">
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h3 className="text-white text-lg font-bold mb-2">Contact Us</h3>
          <ul className="space-y-1 text-xs text-gray-400">
            <li className="flex items-center gap-2">
              <span>📧</span>
              <span>tewodrosayalew111@gmail.com</span>
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span>
              <span>+251989150389</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom section */}
      <div className="max-w-7xl mx-auto px-6 mt-8 pt-4 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-[10px] text-gray-500">
          © {new Date().getFullYear()} Movie Review Platform.
        </p>
        <p className="text-[10px] text-gray-500">
          Made with <span className="text-red-600">♥</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
