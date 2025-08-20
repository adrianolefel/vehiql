// Helper function to format currency in FCFA
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF", // ISO currency code for FCFA
    minimumFractionDigits: 0, // Optional: remove decimal places
  }).format(amount);
};

// Helper function to serialize car data
export const serializeCarData = (car, wishlisted = false) => {
  return {
    ...car,
    price: car.price ? parseFloat(car.price.toString()) : 0,
    createdAt: car.createdAt?.toISOString(),
    updatedAt: car.updatedAt?.toISOString(),
    wishlisted: wishlisted,
  };
};