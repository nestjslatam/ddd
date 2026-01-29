export class GetProductDto {
  id: string;
}

export class GetProductsDto {
  status?: string;
  limit?: number;
  offset?: number;
}

export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: string;
  status: string;
}

export class ProductResponse {
  id: string;
  name: string;
  description: string;
  price: string;
  status: string;
}
