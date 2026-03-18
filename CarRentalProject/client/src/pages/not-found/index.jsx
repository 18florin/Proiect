import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background p-6">
      <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Sorry, the page you are looking for does not exist. It might have been
        moved or deleted.
      </p>
      <Button asChild>
        <Link to="/shop/home">Go back to Home</Link>
      </Button>
    </div>
  );
}

export default NotFound;
