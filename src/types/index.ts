export type Cords = { lat: number; lon: number };

export type Marker = Cords & {
  id: number;
  name: string;
  price?: number;
  address: string;
};

export type Amenity = {
  label: string;
  icon: JSX.Element;
};

export type Pages =
  | 'menu'
  | 'profile'
  | 'chats'
  | 'chatroom'
  | 'wallet'
  | 'all booking'
  | 'refund booking'
  | 'cancel booking'
  | 'payment booking'
  | 'booking detail'
  | 'rental manager'
  | 'tenant application'
  | 'tenant approval'
  | 'tenant payment'
  | 'tenant renew lease'
  | 'pay rent'
  | 'rent detail'
  | 'auth'
  | 'logout'
  | 'search'
  | 'map search filter'
  | 'support page'
  | 'add ticket'
  | 'view ticket';

export type Role = 'user' | 'host' | 'admin';

export type Status = 'active' | 'inactive';

export type Sort = 'asc' | 'desc';

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  image?: string;
  role: Role;
  status: Status;
};

export type AuthState = {
  loading: boolean;
  isAuthenticated: boolean;
  token?: string;
  user?: User;
  error?: { key: string; message: string };
  otpDialog: {
    show: boolean;
    expiryTime?: number;
    isResetRequest?: boolean;
  };
  resetDialog?: boolean;
  isReAuthenticate?: boolean;
};

export type SigninCredentials = {
  emailOrPhone: string;
  password: string;
};

export type SignupCredentials = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export type VerifyCredentials = {
  otp?: string;
  reset: 'true' | 'false';
};

export type SocialAuthCredentials = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type Balance = {
  earnings: number;
  deposits: number;
};

export type UserState = {
  loading: boolean;
  isFailed: boolean;
  users?: User[];
  host?: User[];
  userDetail?: User;
  error?: { key: string; message: string };
  balance?: Balance;
};

export type Message = {
  _id: string;
  conversationId: string;
  text?: string;
  senderId: string;
  media?: {
    url: string;
    type: 'image' | 'video' | 'audio' | 'document';
  };
  createdAt: string;
  updatedAt: string;
};

export type SocketMessage = {
  senderId: string;
  receiverId: string;
  text?: string;
  media?: Message['media'];
  seen: boolean;
};

export type Conversation = {
  _id: string;
  member: User;
  lastMessage?: Message;
  seen: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChatState = {
  loading: boolean;
  isFailed: boolean;
  conversations?: Conversation[];
  messages?: Message[];
  error?: { key: string; message: string };
};

export type CardDetail = {
  _id: string;
  name: string;
  cardNo: string;
  brand: string;
  expiry: string;
  default: boolean;
};

export type CardState = {
  loading: boolean;
  isFailed: boolean;
  cards?: CardDetail[];
  error?: { key: string; message: string };
};

export type DaysInWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type Workspace = {
  _id: string;
  status: Status;
  host: User;
  info: {
    name: string;
    address: string;
    floor: string;
    city: string;
    state: string;
    country: string;
    summary?: string;
  };
  images: string[];
  pricing: {
    currency: string;
    totalPerDay: number;
    cleaning?: {
      fee: number;
      type: string;
    };
    maintenance?: {
      fee: number;
      type: string;
    };
    additional?: {
      fee: number;
      type: string;
    };
  };
  geocode: Cords;
  times: {
    sunday?: {
      startTime: string;
      endTime: string;
    };
    monday?: {
      startTime: string;
      endTime: string;
    };
    tuesday?: {
      startTime: string;
      endTime: string;
    };
    wednesday?: {
      startTime: string;
      endTime: string;
    };
    thursday?: {
      startTime: string;
      endTime: string;
    };
    friday?: {
      startTime: string;
      endTime: string;
    };
    saturday?: {
      startTime: string;
      endTime: string;
    };
  };
  other: {
    isIndoorSpace: boolean;
    isOutdoorSpace: boolean;
    isCoWorkingWorkspace: boolean;
    additionalGuests: number;
  };
  amenities?: string[];
};

export type Pagination = {
  totalDocuments: number;
  totalPages: number | null;
  currentPage: number | null;
  limit: number | null;
  skip: number | null;
};

export type WorkspaceState = {
  loading: boolean;
  isFailed: boolean;
  isUpdating: boolean;
  workspaces?: Workspace[];
  pagination?: Pagination;
  workspaceDetail?: Workspace;
  error?: { key: string; message: string };
};

export type UnitStatus = 'leased' | 'not leased';

export type UnitListItem = {
  _id: string;
  unit: number;
  price: number;
  beds: number;
  baths: number;
  floorPlanImg: string | undefined;
  isAvailable: boolean;
  status?: UnitStatus;
};

export type Property = {
  _id: string;
  status: Status;
  host: User;
  info: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    summary?: string;
  };
  geocode: Cords;
  images: string[];
  unitList: UnitListItem[];
  other: {
    chargeFeeFromRent: boolean;
    chargeFeeAsAddition: boolean;
    leaseDuration: number;
    leasingPolicyDoc?: string;
  };
  amenities?: string[];
};

export type PropertyState = {
  loading: boolean;
  isFailed: boolean;
  isUpdating: boolean;
  properties?: Property[];
  pagination?: Pagination;
  propertyDetail?: Property;
  error?: { key: string; message: string };
};

export type PlanName = 'free plan' | 'villa plan' | 'mansion plan' | 'chateau plan' | 'custom plan';

export type Plan = {
  id: string;
  name: PlanName;
  description: string;
  price: number;
};

export type SubscriptionDetail = {
  name: PlanName;
  startOn: Date;
  endOn: Date;
};

export type SubscriptionState = {
  loading: boolean;
  isFailed: boolean;
  plans?: Plan[];
  subscriptionDetail?: SubscriptionDetail;
  error?: { key: string; message: string };
};

export type PromoType = 'flat' | 'percentage';

export type Promo = {
  _id: string;
  code: string;
  type: PromoType;
  discount: number;
};

export type PromoState = {
  loading: boolean;
  isFailed: boolean;
  promos?: Promo[];
  promoDetail?: Promo;
  error?: { key: string; message: string };
};

export type OrderStatus = 'pending' | 'in progress' | 'done' | 'partially refunded' | 'canceled';
export type OrderAcceptance =
  | 'pending'
  | 'manually accepted'
  | 'automatically accepted'
  | 'rejected';

export type Booking = {
  _id: string;
  user: User;
  workspace: Workspace;
  startDate: string;
  endDate: string;
  subtotal: number;
  discount: number;
  status: OrderStatus;
  acceptance: OrderAcceptance;
  createdAt: string;
  updatedAt: string;
};

export type BookingState = {
  loading: boolean;
  isFailed: boolean;
  bookings?: Booking[];
  inProgress?: Booking[];
  history?: Booking[];
  pagination?: Pagination;
  bookingDetail?: Booking;
  selectedBooking?: {
    workspace: Workspace;
    selectedDates: { from: string; to: string };
  };
  bookedDates?: Date[];
  error?: { key: string; message: string };
};

export type Auto = {
  autoBooking: boolean;
  autoRentPay: boolean;
};

export type AutoState = {
  loading: boolean;
  isFailed: boolean;
  status?: Auto;
  error?: { key: string; message: string };
};

export type PaymentType = 'card' | 'ach';

export type AccountType = 'individual' | 'company';

export type BankAccountDetail = {
  _id: string;
  bankName: string;
  accountHolderName: string;
  accountNo: string;
  routingNo: string;
  accountHolderType: string;
};

export type TenantStatus = 'pending' | 'approved' | 'rejected';

export type UserAsTenantType = 'awaiting' | 'renting' | 'history';

export type HostTenantsType = 'pending requests' | 'current tenants' | 'awaiting payments';

export type Tenant = {
  _id: string;
  userId: string;
  info: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    moveInRequest: string;
    socialSecurityNo?: string;
    note?: string;
  };
  selectedUnit: UnitListItem & {
    property: Property;
  };
  status: Status;
  acceptance: TenantStatus;
  agreement?: {
    rent: number;
    securityDepositFee: number;
    isRefunded: boolean;
    discount: number;
    leaseStartDate: string;
    leaseEndDate: string;
    renewOn: string;
  };
  paymentSource: PaymentType;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type TenantState = {
  loading: boolean;
  isFailed: boolean;
  isUpdating: boolean;
  isLoadingBankDetails: boolean;
  isViewOnly: boolean;
  tenants?: Tenant[];
  awaiting?: Tenant[];
  renting?: Tenant[];
  history?: Tenant[];
  prospectTenants?: Tenant[];
  awaitingRents?: Tenant[];
  pagination?: Pagination;
  tenantDetail?: Tenant;
  bankAccount?: BankAccountDetail;
  error?: { key: string; message: string };
  stripeClientSecret?: string;
};

export type Ticket = {
  _id: string;
  workspace?: {
    _id: string;
    info: {
      name: string;
      address: string;
      floor: string;
      city: string;
      state: string;
      country: string;
      summary?: string;
    };
  };
  property?: {
    _id: string;
    info: {
      name: string;
      address: string;
      city: string;
      state: string;
      country: string;
      summary?: string;
    };
  };
  conversation: {
    from: 'user' | 'host';
    context: string;
    sendOn: string;
  }[];
  status: Status;
};

export type TicketState = {
  loading: boolean;
  isFailed: boolean;
  tickets?: Ticket[];
  history?: Ticket[];
  ticketDetail?: Ticket;
  error?: { key: string; message: string };
};

export type ChartRange = '7 days' | '30 days' | '3 months';

export type ChartData = {
  date: string;
  workspace: number;
  property: number;
};
