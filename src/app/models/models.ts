export interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isAdmin?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number; // Make it optional with ?
  category: string;
  image_url: string;
  stock_quantity: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  description: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_date: string;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  status: string;
  payment_status: string;
  items: OrderItem[];
  transaction?: Transaction;
}

export interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: number;
  order_id: number;
  user_id: number;
  amount: number;
  payment_method: string;
  transaction_id: string;
  payment_status: string;
  transaction_date: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  otp: string;
}

export interface RegisterRequest {
  name: string;
  age: number;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}