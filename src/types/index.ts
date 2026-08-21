export interface OrderDetail {
  id: number;
  foodId: number;
  foodName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  status: string;
}

export interface Order {
  id: number;
  orderCode: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  tableId: number;
  tableName: string;
  orderDetails: OrderDetail[];
}