//client/src/components/shopping-view/header.jsx
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import {
  HousePlug,
  LogOut,
  Menu,
  UserCog,
  ShoppingCart,
  Store,
} from "lucide-react";

import MobileStatus from "@/components/common/mobile-status";
import { useMobile } from "@/context/mobile-context"; // 🔥 IMPORTANT

const VISIBLE_IDS = ["home", "vehicles", "search", "merch"];

function MenuItems({ isMobile = false, onItemClick }) {
  const navigate = useNavigate();

  function handleNavigate(item) {
    sessionStorage.removeItem("filters");
    navigate(item.path);
    if (onItemClick) onItemClick();
  }

  return (
    <nav
      className={`flex ${
        isMobile ? "flex-col items-start" : "flex-col lg:flex-row items-center"
      } gap-4 lg:gap-6`}
    >
      {shoppingViewHeaderMenuItems
        .filter((item) => VISIBLE_IDS.includes(item.id))
        .map((item) => (
          <Button
            key={item.id}
            variant="link"
            onClick={() => handleNavigate(item)}
            className="text-sm font-medium"
          >
            {item.id === "merch" && <Store className="mr-2 h-4 w-4" />}
            {item.label}
          </Button>
        ))}
    </nav>
  );
}

function CartButton() {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.merchCart.items);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate("/shop/cart")}
      className="relative flex items-center gap-2"
    >
      <ShoppingCart className="h-4 w-4" />
      Cart
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
          {totalItems}
        </span>
      )}
    </Button>
  );
}

function HeaderRight() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔥 FOLOSIM CONTEXT, NU window
  const { isMobileConnected } = useMobile();

  function handleLogout() {
    dispatch(logoutUser());
    navigate("/auth/login", { replace: true });
  }

  return (
    <div className="flex items-center gap-3">
      {/* 🔥 STATUS REAL */}
      <MobileStatus isMobileConnected={isMobileConnected} />

      <CartButton />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer bg-black">
            {user?.profileImage ? (
              <AvatarImage src={user.profileImage} alt={user.userName} />
            ) : (
              <AvatarFallback className="text-white font-bold">
                {user?.userName?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            )}
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" className="w-56">
          <DropdownMenuLabel>Signed in as {user?.userName}</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => navigate("/shop/account")}>
            <UserCog className="mr-2 h-4 w-4" />
            Account
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function ShoppingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/shop/home" className="flex items-center gap-2">
          <HousePlug className="h-6 w-6" />
          <span className="font-bold">Car Rental</span>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-full max-w-xs">
            <div className="mt-6 flex flex-col gap-6">
              <MenuItems isMobile />
              <CartButton />
              <HeaderRight />
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden lg:flex lg:items-center lg:gap-6">
          <MenuItems />
        </div>

        <div className="hidden lg:flex lg:items-center">
          <HeaderRight />
        </div>
      </div>
    </header>
  );
}
