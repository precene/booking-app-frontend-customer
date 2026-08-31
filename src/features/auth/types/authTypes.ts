export interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
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
