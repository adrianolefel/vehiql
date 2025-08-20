"use client";
import { format } from "date-fns";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Car,
  Fuel,
  Gauge,
  LocateFixed,
  Share2,
  Heart,
  MessageSquare,
  Currency,
  Calendar,
} from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toggleSavedCar } from "@/actions/car-listing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmiCalculator from "./emi-calculator";
import { formatCurrency } from "@/lib/helpers";

export function CarDetails({ car, testDriveInfo }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(car.wishlisted);

  const {
    loading: savingCar,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCar);

  // Handle toggle result with useEffect
  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved !== isWishlisted) {
      setIsWishlisted(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult, isWishlisted]);

  // Handle errors with useEffect
  useEffect(() => {
    if (toggleError) {
      toast.error("Failed to update favorites");
    }
  }, [toggleError]);

  // Handle save car
  const handleSaveCar = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }

    if (savingCar) return;

    // Use the toggleSavedCarFn from useFetch hook
    await toggleSavedCarFn(car.id);
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${car.year} ${car.make} ${car.model}`,
          text: `Check out this ${car.year} ${car.make} ${car.model} on Vehiql!`,
          url: window.location.href,
        })
        .catch((error) => {
          console.log("Error sharing", error);
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

   // Handle book test drive
  const handleBookTestDrive = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to book a test drive");
      router.push("/sign-in");
      return;
    }
    router.push(`/test-drive/${car.id}`);
  };



  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Gallery */}
        <div className="w-full lg:w-7/12">
          <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
            {car.images && car.images.length > 0 ? (
              <Image
                src={car.images[currentImageIndex]}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Car className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {car.images && car.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {car.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-md h-20 w-24 flex-shrink-0 transition ${
                    index === currentImageIndex
                      ? "border-2 border-blue-600"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${car.year} ${car.make} ${car.model} - view ${
                      index + 1
                    }`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Secondary Actions */}
          <div className="flex mt-4 gap-4">
            <Button
              variant="outline"
              className={`flex items-center gap-2 flex-1 ${
                isWishlisted ? "text-red-500" : ""
              }`}
              onClick={handleSaveCar}
              disabled={savingCar}
            >
              <Heart
                className={`h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`}
              />
              {isWishlisted ? "Saved" : "Save"}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 flex-1"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              Share
            </Button>
          </div>
        </div>

        {/* Car Details */}
        <div className="w-full lg:w-5/12">
          <div className="flex items-center justify-between">
            <Badge className="mb-2">{car.bodyType}</Badge>
          </div>

          <h1 className="text-4xl font-bold mb-1">
            {car.year} {car.make} {car.model}
          </h1>

          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(car.price)}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
            <div className="flex items-center gap-2">
              <Gauge className="text-gray-500 h-5 w-5" />
              <span>{car.mileage.toLocaleString()} miles</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="text-gray-500 h-5 w-5" />
              <span>{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="text-gray-500 h-5 w-5" />
              <span>{car.transmission}</span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger className="w-full text-start">
              <Card className="pt-5">
                <CardContent>
                  <div className="flex items-center gap-2 text-lg font-medium mb-2">
                    <Currency className="h-5 w-5 text-blue-600" />
                    <h3>EMI Calculator</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    Estimated Monthly Payment:{" "}
                    <span className="font-bold text-gray-900">
                      {formatCurrency(car.price / 60)}
                    </span>{" "}
                    for 60 months
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    *Based on Fcfa0 down payment and 4.5% interest rate
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vehiql car Loan Calculator</DialogTitle>
                
                <EmiCalculator price={car.price} />
              </DialogHeader>
            </DialogContent>
          </Dialog>

           {/* Request More Info */}
          <Card className="my-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-lg font-medium mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3>Have Questions?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Our representatives are available to answer all your queries
                about this vehicle.
              </p>
              <a href="mailto:help@vehiql.in">
                <Button variant="outline" className="w-full">
                  Request Info
                </Button>
              </a>
            </CardContent>
          </Card>
           {(car.status === "SOLD" || car.status === "UNAVAILABLE") && (
            <Alert variant="destructive">
              <AlertTitle className="capitalize">
                This car is {car.status.toLowerCase()}
              </AlertTitle>
              <AlertDescription>Please check again later.</AlertDescription>
            </Alert>
          )}
            {/* Book Test Drive Button */}
          {car.status !== "SOLD" && car.status !== "UNAVAILABLE" && (
            <Button
              className="w-full py-6 text-lg"
              onClick={handleBookTestDrive}
              disabled={testDriveInfo.userTestDrive}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {testDriveInfo.userTestDrive
                ? `Booked for ${format(
                    new Date(testDriveInfo.userTestDrive.bookingDate),
                    "EEEE, MMMM d, yyyy"
                  )}`
                : "Book Test Drive"}
            </Button>
          )}



        </div>
      </div>

      {/* Details & Features Section */}
<div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Description Card */}
  <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-blue-600 rounded-lg">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-slate-800">Description</h3>
    </div>
    <div className="prose prose-slate max-w-none">
      <p className="whitespace-pre-line text-slate-600 leading-relaxed">
        {car.description}
      </p>
    </div>
  </div>

  {/* Features Card */}
  <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-blue-600 rounded-lg">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-slate-800">Key Features</h3>
    </div>
    
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-slate-700 font-medium">{car.transmission} Transmission</span>
      </div>

      <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span className="text-slate-700 font-medium">{car.fuelType} Engine</span>
      </div>

      <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span className="text-slate-700 font-medium">{car.bodyType} Body Style</span>
      </div>

      {car.seats && (
        <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-slate-700 font-medium">{car.seats} Seats</span>
        </div>
      )}

      <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        </div>
        <span className="text-slate-700 font-medium">{car.color} Exterior</span>
      </div>
    </div>
  </div>
</div>





{/* Specifications Section */}
<div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-xl overflow-hidden">
  <div className="p-8">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-3 bg-blue-600 rounded-xl">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-white">Vehicle Specifications</h2>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-slate-300 text-sm font-medium">Make</span>
          </div>
          <span className="text-white font-semibold">{car.make}</span>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-slate-300 text-sm font-medium">Model</span>
          </div>
          <span className="text-white font-semibold">{car.model}</span>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-slate-300 text-sm font-medium">Year</span>
          </div>
          <span className="text-white font-semibold">{car.year}</span>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-slate-300 text-sm font-medium">Body Type</span>
          </div>
          <span className="text-white font-semibold">{car.bodyType}</span>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-slate-300 text-sm font-medium">Fuel Type</span>
          </div>
          <span className="text-white font-semibold">{car.fuelType}</span>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-slate-300 text-sm font-medium">Transmission</span>
          </div>
          <span className="text-white font-semibold">{car.transmission}</span>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            <span className="text-slate-300 text-sm font-medium">Mileage</span>
          </div>
          <span className="text-white font-semibold">{car.mileage.toLocaleString()} miles</span>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <span className="text-slate-300 text-sm font-medium">Color</span>
          </div>
          <span className="text-white font-semibold">{car.color}</span>
        </div>
      </div>
      
      {car.seats && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
              <span className="text-slate-300 text-sm font-medium">Seats</span>
            </div>
            <span className="text-white font-semibold">{car.seats}</span>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

{/* Dealership Location Section */}
<div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
        <LocateFixed className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-white">Dealership Location</h2>
    </div>
  </div>
  
  <div className="p-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Dealership Information */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Vehiql Motors</h4>
              <div className="space-y-2">
                <p className="text-slate-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Douala Akwa
                </p>
                <p className="text-slate-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  674616669
                </p>
                <p className="text-slate-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  adrianolefel@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-slate-800">Working Hours</h4>
        </div>
        
        <div className="space-y-3">
          {testDriveInfo.dealership?.workingHours
            ? testDriveInfo.dealership.workingHours
                .sort((a, b) => {
                  const days = [
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY",
                    "SUNDAY",
                  ];
                  return (
                    days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek)
                  );
                })
                .map((day) => (
                  <div
                    key={day.dayOfWeek}
                    className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-blue-200 transition-colors"
                  >
                    <span className="text-slate-700 font-medium">
                      {day.dayOfWeek.charAt(0) +
                        day.dayOfWeek.slice(1).toLowerCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      day.isOpen 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {day.isOpen
                        ? `${day.openTime} - ${day.closeTime}`
                        : "Closed"}
                    </span>
                  </div>
                ))
            : // Default hours if none provided
              [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day, index) => (
                <div key={day} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                  <span className="text-slate-700 font-medium">{day}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    index < 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {index < 5
                      ? "9:00 - 18:00"
                      : index === 5
                      ? "10:00 - 16:00"
                      : "Closed"}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </div>
  </div>
</div>


    </div>
  );
}