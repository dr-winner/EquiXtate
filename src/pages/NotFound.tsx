
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-black to-space-deep-purple flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-12 mt-16">
        <div className="glassmorphism rounded-xl p-10 max-w-lg w-full text-center">
          <div className="text-6xl font-bold text-space-neon-blue mb-6">404</div>
          <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-gray-300 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 rounded-lg bg-space-neon-blue hover:bg-space-neon-blue/80 text-white font-medium transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
