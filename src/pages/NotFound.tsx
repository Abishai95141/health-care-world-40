
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-8xl lg:text-9xl font-light text-black mb-4">404</h1>
            <div className="w-24 h-0.5 bg-black mx-auto mb-6"></div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl lg:text-3xl font-light text-black tracking-tight">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/')}
            className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-full 
                     hover:scale-105 transition-all duration-200 mt-8"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
