export interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  cityId?: null | string;
  cityName?: null | string;
  role: "admin" | "customer" | "staff";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthCustomerResponse {
  user: Customer;
}
