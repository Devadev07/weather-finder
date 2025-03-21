
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <h2 className="text-3xl font-semibold text-white">Page Not Found</h2>
        <p className="text-white/80 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="mt-8 bg-white text-blue-600 hover:bg-white/90">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
