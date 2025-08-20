import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";

const Header = async ({ isAdminPage = false }) => {
  const user = await checkUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-700 z-50 shadow-2xl shadow-slate-900/20">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left Side: Logo */}
        <Link href={isAdminPage ? "/admin" : "/"}>
          <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
            <Image
              src={"/logo.png"}
              alt="Vehiql logo"
              width={160}
              height={60}
              className="h-12 w-auto object-contain brightness-0 invert"
            />
            {isAdminPage && (
              <span className="text-xs font-extralight mt-1 text-blue-300 bg-slate-800 px-2 py-1 rounded-full border border-slate-600">
                admin
              </span>
            )}
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {isAdminPage ? (
            <>
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-slate-800 border-slate-600 text-blue-100 hover:bg-slate-700 hover:border-slate-500 hover:text-white transition-all duration-200"
                >
                  <ArrowLeft size={18} />
                  <span>Back to App</span>
                </Button>
              </Link>
            </>
          ) : (
            <SignedIn>
              {!isAdmin && (
                <Link
                  href="/reservations"
                  className="text-blue-200 hover:text-blue-100 transition-colors duration-200 flex items-center gap-2"
                >
                  <Button 
                    variant="outline"
                    className="bg-slate-800 border-slate-600 text-blue-100 hover:bg-slate-700 hover:border-slate-500 hover:text-white transition-all duration-200"
                  >
                    <CarFront size={18} />
                    <span className="hidden md:inline">My Reservations</span>
                  </Button>
                </Link>
              )}
              <a href="/saved-cars">
                <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-blue-100 hover:text-white border border-slate-600 hover:border-slate-500 transition-all duration-200">
                  <Heart size={18} />
                  <span className="hidden md:inline">Saved Cars</span>
                </Button>
              </a>
              {isAdmin && (
                <Link href="/admin">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-slate-800 border-slate-600 text-blue-100 hover:bg-slate-700 hover:border-slate-500 hover:text-white transition-all duration-200"
                  >
                    <Layout size={18} />
                    <span className="hidden md:inline">Admin Portal</span>
                  </Button>
                </Link>
              )}
            </SignedIn>
          )}

          <SignedOut>
            {!isAdminPage && (
              <SignInButton forceRedirectUrl="/">
                <Button 
                  variant="outline"
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:border-gray-600 transition-all duration-200"
                >
                  Login
                </Button>
              </SignInButton>
            )}
          </SignedOut>

          <SignedIn>
            <div className="ring-2 ring-gray-700 rounded-full hover:ring-gray-600 transition-all duration-200">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;