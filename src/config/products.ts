export type Product = {
  name: string;
  description: string;
  price: ProductPrice;
};

export type ProductPrice = {
  amount: number;
  currency: string;
};
