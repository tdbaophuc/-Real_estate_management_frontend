export function formatCurrency(value: number, currency = "VND") {
  const normalizedCurrency = currency.trim().toUpperCase() || "VND";
  const fractionDigits = normalizedCurrency === "USD" ? 2 : 0;

  try {
    return new Intl.NumberFormat(normalizedCurrency === "USD" ? "en-US" : "vi-VN", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits
    }).format(value);
  } catch {
    return `${normalizedCurrency} ${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits
    }).format(value)}`;
  }
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium"
  }).format(new Date(value));
}
