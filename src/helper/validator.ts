import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

const formatPhoneNumber = (phoneNumber: string): string => {
  try {
    const number = phoneUtil.parseAndKeepRawInput(phoneNumber);
    return phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL);
  } catch (error) {
    return phoneNumber;
  }
};

const isPhoneValid = (phone: string): boolean => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
  } catch (error) {
    return false;
  }
};

const EmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const isEmailValid = (email: string) => EmailRegex.test(email);

const NameRegex = /^[a-zA-Z]+$/;
const isNameValid = (name: string): boolean => NameRegex.test(name);

const ImageRegex = /\.webp$/i;
const isValidImage = (url: string): boolean => ImageRegex.test(url);

const DocumentRegex = /\.(pdf|doc|docx)$/i;
const isValidDocument = (url: string): boolean => DocumentRegex.test(url);

const SocialSecurityNoRegex = /^(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/;
const isValidSocialSecurityNo = (url: string): boolean => SocialSecurityNoRegex.test(url);

const formatSSN = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/(\d{3})(\d{2})(\d{4})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return value;
};

export {
  isPhoneValid,
  isEmailValid,
  isNameValid,
  isValidImage,
  isValidDocument,
  isValidSocialSecurityNo,
  formatPhoneNumber,
  formatSSN,
};
