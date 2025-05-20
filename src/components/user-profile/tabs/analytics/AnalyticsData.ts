
// Mock data for portfolio performance
export const portfolioData = [
  { month: "Jan", value: 15000, propertyValue: 22300 },
  { month: "Feb", value: 16200, propertyValue: 22500 },
  { month: "Mar", value: 15800, propertyValue: 23100 },
  { month: "Apr", value: 17400, propertyValue: 23800 },
  { month: "May", value: 19200, propertyValue: 24200 },
  { month: "Jun", value: 20100, propertyValue: 25000 },
];

// Calculate percentage change between beginning and end
export const calculateGrowth = (data: Array<{ month: string, value: number }>) => {
  if (data.length < 2) return 0;
  const startValue = data[0].value;
  const endValue = data[data.length - 1].value;
  return ((endValue - startValue) / startValue) * 100;
};
