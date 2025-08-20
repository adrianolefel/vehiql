"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Input } from "./ui/input";
import { Camera, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useDropzone } from "react-dropzone";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { processImageSearch } from "@/actions/home";

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [searchImage, setSearchImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  // Use the useFetch hook for image processing
  const {
    loading: isProcessing,
    fn: processImageFn,
    data: processResult,
    error: processError,
  } = useFetch(processImageSearch);

  // Handle text search submissions
  const handleTextSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    router.push(`/cars?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!searchImage) {
      toast.error("Please upload an image first");
      return;
    }

    await processImageFn(searchImage);
  };

  useEffect(() => {
    if (processError) {
      toast.error(
        "Failed to analyze image: " + (processError.message || "Unknown error")
      );
    }
  }, [processError]);

  // Handle process result and errors with useEffect
  useEffect(() => {
    if (processResult?.success) {
      const params = new URLSearchParams();

      // Add extracted params to the search
      if (processResult.data.make) params.set("make", processResult.data.make);
      if (processResult.data.bodyType)
        params.set("bodyType", processResult.data.bodyType);
      if (processResult.data.color)
        params.set("color", processResult.data.color);

      // Redirect to search results
      router.push(`/cars?${params.toString()}`);
    }
  }, [processResult, router]);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setIsUploading(true);
      setSearchImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setIsUploading(false);
        toast.success("Image uploaded successfully");
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Failed to read the image");
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
  });

  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-2xl">
      <form onSubmit={handleTextSearch}>
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Enter make, model, or use our AI Image Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-12 py-6 w-full rounded-full border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />
          <div className="absolute right-[100px]">
            <Camera
              size={35}
              onClick={() => setIsImageSearchActive(!isImageSearchActive)}
              className="cursor-pointer rounded-xl p-1.5 transition-all duration-200 hover:bg-gray-700"
              style={{
                background: isImageSearchActive ? "#000000" : "#374151",
                color: "white",
              }}
            />
          </div>
          <Button 
            type="submit" 
            className="absolute right-2 rounded-full bg-black hover:bg-gray-900 text-white border border-gray-700 transition-all duration-200"
          >
            Search
          </Button>
        </div>
      </form>

      {isImageSearchActive && (
        <div className="mt-6">
          <form onSubmit={handleImageSearch} className="space-y-4">
            <div className="border-2 border-dashed border-gray-600 rounded-3xl p-6 text-center bg-gray-800/50 backdrop-blur-sm">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Car preview"
                    className="h-40 object-contain mb-4 rounded-lg border border-gray-700"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchImage(null);
                      setImagePreview("");
                      toast.info("Image removed");
                    }}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 transition-all duration-200"
                  >
                    Remove Image
                  </Button>
                  <p className="text-sm text-gray-400 mt-2">{searchImage?.name}</p>
                </div>
              ) : (
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="border-2 border-dashed border-gray-600 rounded-3xl p-6 text-center hover:border-gray-500 transition-colors duration-200">
                    <Upload className="h-12 w-12 text-gray-500 mb-2 mx-auto" />
                    <p className="text-gray-300 mb-2">
                      {isDragActive && !isDragReject
                        ? "Leave the file here to upload"
                        : "Drag & drop a car image or click to select"}
                    </p>
                    {isDragReject && (
                      <p className="text-red-400 mb-2">Invalid image type</p>
                    )}
                    <p className="text-gray-500 text-sm">
                      Supports: JPG, PNG (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            {imagePreview && (
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-900 text-white border border-gray-700 py-3 rounded-full transition-all duration-200 font-medium"
                disabled={isUploading || isProcessing}
              >
                {isUploading
                  ? "Uploading..."
                  : isProcessing
                  ? "Analyzing image..."
                  : "Search with this Image"}
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeSearch;