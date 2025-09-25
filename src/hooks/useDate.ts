export const useDate = () => {
  const currentDate = new Date();

  const currentMonthAndYearTitle = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // YYYY-MM
  const currentMonthAndYear = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  return { currentDate, currentMonthAndYear, currentMonthAndYearTitle };
};
