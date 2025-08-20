"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Car as CarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { toggleSavedCar } from "@/actions/car-listing";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";

export const CarCard = ({ car }) => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(car.wishlisted);

  // Use the useFetch hook
  const {
    loading: isToggling,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCar);

  // Handle toggle result with useEffect
  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved !== isSaved) {
      setIsSaved(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult, isSaved]);

  // Handle errors with useEffect
  useEffect(() => {
    if (toggleError) {
      toast.error("Failed to update favorites");
    }
  }, [toggleError]);

  // Handle save/unsave car
  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }

    if (isToggling) return;

    // Call the toggleSavedCar function using our useFetch hook
    await toggleSavedCarFn(car.id);
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 group shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 backdrop-blur-sm">
      <div className="relative h-56 overflow-hidden">
        {car.images && car.images.length > 0 ? (
          <div className="relative w-full h-full">
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <CarIcon className="h-16 w-16 text-slate-500" />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/20 rounded-full p-2 hover:bg-black/60 transition-all duration-300 ${
            isSaved
              ? "text-red-400 hover:text-red-300 shadow-lg shadow-red-500/25"
              : "text-white hover:text-red-400"
          }`}
          onClick={handleToggleSave}
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart className={isSaved ? "fill-current" : ""} size={22} />
          )}
        </Button>

        {/* Subtle overlay gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
      </div>

      <CardContent className="p-6 bg-gradient-to-b from-slate-900 to-black relative">
        {/* Subtle glow effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
        
        <div className="flex flex-col mb-4">
          <h3 className="text-xl font-bold text-white mb-1 tracking-wide">
            {car.make} <span className="text-blue-300">{car.model}</span>
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-transparent bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text">
              Fcfa{car.price.toLocaleString()}
            </span>
            <div className="h-5 w-px bg-slate-600" />
            <span className="text-slate-300 font-medium">{car.year}</span>
          </div>
        </div>

        <div className="text-slate-400 mb-4 flex items-center text-sm font-medium">
          <span className="px-2 py-1 bg-slate-800/50 rounded-md border border-slate-700/50">
            {car.transmission}
          </span>
          <span className="mx-3 text-slate-600">•</span>
          <span className="px-2 py-1 bg-slate-800/50 rounded-md border border-slate-700/50">
            {car.fuelType}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 text-slate-200 hover:from-blue-900 hover:to-slate-800 transition-all duration-300">
            {car.bodyType}
          </Badge>
          <Badge className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 text-slate-200 hover:from-blue-900 hover:to-slate-800 transition-all duration-300">
            {car.mileage.toLocaleString()} miles
          </Badge>
          <Badge className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 text-slate-200 hover:from-blue-900 hover:to-slate-800 transition-all duration-300">
            {car.color}
          </Badge>
        </div>

        <div className="flex justify-between">
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 border border-blue-500/20 hover:border-blue-400/30"
            onClick={() => {
              router.push(`/cars/${car.id}`);
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};