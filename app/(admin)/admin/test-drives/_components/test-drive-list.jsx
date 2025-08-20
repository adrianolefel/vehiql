"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Loader2, CalendarRange, AlertCircle, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TestDriveCard } from "@/components/test-drive-card";
import useFetch from "@/hooks/use-fetch";
import { getAdminTestDrives, updateTestDriveStatus } from "@/actions/admin";
import { cancelTestDrive } from "@/actions/test-drive";

export const TestDrivesList = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Custom hooks for API calls
  const {
    loading: fetchingTestDrives,
    fn: fetchTestDrives,
    data: testDrivesData,
    error: testDrivesError,
  } = useFetch(getAdminTestDrives);

  const {
    loading: updatingStatus,
    fn: updateStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateTestDriveStatus);

  const {
    loading: cancelling,
    fn: cancelTestDriveFn,
    data: cancelResult,
    error: cancelError,
  } = useFetch(cancelTestDrive);

  // Initial fetch and refetch on search/filter changes
  useEffect(() => {
    fetchTestDrives({ search, status: statusFilter });
  }, [search, statusFilter]);

  // Handle errors
  useEffect(() => {
    if (testDrivesError) {
      toast.error("Failed to load test drives");
    }
    if (updateError) {
      toast.error("Failed to update test drive status");
    }
    if (cancelError) {
      toast.error("Failed to cancel test drive");
    }
  }, [testDrivesError, updateError, cancelError]);

  // Handle successful operations
  useEffect(() => {
    if (updateResult?.success) {
      toast.success("Test drive status updated successfully");
      fetchTestDrives({ search, status: statusFilter });
    }
    if (cancelResult?.success) {
      toast.success("Test drive cancelled successfully");
      fetchTestDrives({ search, status: statusFilter });
    }
  }, [updateResult, cancelResult]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTestDrives({ search, status: statusFilter });
  };

  // Handle status update
  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (newStatus) {
      await updateStatusFn(bookingId, newStatus);
    }
  };

  // Handle booking cancellation
  const handleCancel = async (bookingId) => {
    await cancelTestDriveFn(bookingId);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTestDrives({ search, status: statusFilter });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Test Drive Management
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage all test drive bookings efficiently
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
              disabled={fetchingTestDrives}
            >
              <RefreshCw className={`h-4 w-4 ${fetchingTestDrives ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Filters and Search */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Filter className="h-4 w-4" />
                  Filters
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:flex-1">
                  {/* Status Filter */}
                 <Select
  value={statusFilter}
  onValueChange={setStatusFilter}
>
  <SelectTrigger className="w-full sm:w-56 bg-white border-gray-300 hover:border-gray-400 transition-colors">
    <SelectValue placeholder="All Statuses" />
  </SelectTrigger>
  <SelectContent className="bg-white border-gray-200 shadow-xl">
    <SelectItem value="ALL">All Statuses</SelectItem>
    <SelectItem value="PENDING" className="text-amber-700">Pending</SelectItem>
    <SelectItem value="CONFIRMED" className="text-blue-700">Confirmed</SelectItem>
    <SelectItem value="COMPLETED" className="text-green-700">Completed</SelectItem>
    <SelectItem value="CANCELLED" className="text-red-700">Cancelled</SelectItem>
    <SelectItem value="NO_SHOW" className="text-gray-700">No Show</SelectItem>
  </SelectContent>
</Select>


                  {/* Search Form */}
                  <form onSubmit={handleSearchSubmit} className="flex w-full flex-1">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Search by car model, customer name, or booking ID..."
                        className="pl-10 pr-4 bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="ml-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={fetchingTestDrives}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Drives List */}
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
                  <CalendarRange className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Test Drive Bookings
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Manage all test drive reservations and update their status
                    {testDrivesData?.data && (
                      <span className="ml-2 font-medium">
                        ({testDrivesData.data.length} {testDrivesData.data.length === 1 ? 'booking' : 'bookings'})
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              
              {/* Status indicators */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-gray-600">Active</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {fetchingTestDrives && !testDrivesData ? (
              <div className="flex flex-col justify-center items-center py-16">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                  <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-blue-100"></div>
                </div>
                <p className="text-gray-500 mt-4 font-medium">Loading test drives...</p>
              </div>
            ) : testDrivesError ? (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-red-800 font-semibold">Error Loading Data</AlertTitle>
                <AlertDescription className="text-red-700">
                  Failed to load test drives. Please check your connection and try again.
                </AlertDescription>
              </Alert>
            ) : testDrivesData?.data?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <CalendarRange className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Search className="h-3 w-3 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No test drives found
                </h3>
                <p className="text-gray-500 max-w-md leading-relaxed">
                  {statusFilter || search
                    ? "No test drives match your current search criteria. Try adjusting your filters or search terms."
                    : "There are no test drive bookings yet. New bookings will appear here once customers start scheduling test drives."}
                </p>
                {(statusFilter || search) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("");
                    }}
                    className="mt-4 border-gray-300 hover:bg-gray-50"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {testDrivesData?.data?.map((booking, index) => (
                  <div 
                    key={booking.id} 
                    className="relative group"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animation: 'fadeInUp 0.5s ease-out forwards'
                    }}
                  >
                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
                      <TestDriveCard
                        booking={booking}
                        onCancel={handleCancel}
                        showActions={["PENDING", "CONFIRMED"].includes(
                          booking.status
                        )}
                        isAdmin={true}
                        isCancelling={cancelling}
                        cancelError={cancelError}
                        renderStatusSelector={() => (
                          <Select
                            value={booking.status}
                            onValueChange={(value) =>
                              handleUpdateStatus(booking.id, value)
                            }
                            disabled={updatingStatus}
                          >
                            <SelectTrigger className="w-full h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 transition-colors">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200 shadow-xl">
                              <SelectItem value="PENDING" className="text-amber-700 hover:bg-amber-50">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                  Pending
                                </div>
                              </SelectItem>
                              <SelectItem value="CONFIRMED" className="text-blue-700 hover:bg-blue-50">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                  Confirmed
                                </div>
                              </SelectItem>
                              <SelectItem value="COMPLETED" className="text-green-700 hover:bg-green-50">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                  Completed
                                </div>
                              </SelectItem>
                              <SelectItem value="CANCELLED" className="text-red-700 hover:bg-red-50">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                  Cancelled
                                </div>
                              </SelectItem>
                              <SelectItem value="NO_SHOW" className="text-gray-700 hover:bg-gray-50">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                  No Show
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};