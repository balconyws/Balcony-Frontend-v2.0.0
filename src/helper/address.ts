export const capitalizeWords = (str: string): string =>
  str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

interface Address {
  address: string;
  city: string;
  state: string;
  country: string;
}

export const formatAddress = (addr: Address): string => {
  const { address, city, state, country } = addr;
  const formattedAddress = capitalizeWords(address.trim());
  const formattedCity = capitalizeWords(city);
  const formattedState = capitalizeWords(state);
  const formattedCountry = capitalizeWords(country);
  // Check if the address already ends with a comma
  const separator = formattedAddress.endsWith(',') ? '' : ',';
  return `${formattedAddress}${separator} ${formattedCity}, ${formattedState}, ${formattedCountry}`;
};
