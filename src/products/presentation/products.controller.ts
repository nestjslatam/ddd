import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  CreateProductDto,
  CreateProductService,
} from '../application/use-cases/create-product';
import {
  UpdateProductDto,
  UpdateProductService,
} from '../application/use-cases/update-product';
import {
  ChangeProductStatusDto,
  ChangeProductStatusService,
} from '../application/use-cases/change-product-status';
import { DeleteProductService } from '../application/use-cases/delete-product';
import {
  GetProductQuery,
  GetProductsQuery,
  ProductResponse,
} from '../application/queries';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly createProductService: CreateProductService,
    private readonly updateProductService: UpdateProductService,
    private readonly changeStatusService: ChangeProductStatusService,
    private readonly deleteProductService: DeleteProductService,
  ) {}

  /**
   * Create a new product
   * POST /products
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() dto: CreateProductDto): Promise<{ id: string }> {
    const id = await this.createProductService.execute(dto);
    return { id };
  }

  /**
   * Get all products
   * GET /products?status=ACTIVE&limit=10&offset=0
   */
  @Get()
  async getProducts(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ProductResponse[]> {
    const query = new GetProductsQuery(status, limit, offset);
    return await this.queryBus.execute(query);
  }

  /**
   * Get product by ID
   * GET /products/:id
   */
  @Get(':id')
  async getProduct(@Param('id') id: string): Promise<ProductResponse> {
    const query = new GetProductQuery(id);
    return await this.queryBus.execute(query);
  }

  /**
   * Update product
   * PUT /products/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<void> {
    await this.updateProductService.execute(id, dto);
  }

  /**
   * Change product status
   * PATCH /products/:id/status
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeProductStatusDto,
  ): Promise<void> {
    await this.changeStatusService.execute(id, dto);
  }

  /**
   * Delete product
   * DELETE /products/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id') id: string): Promise<void> {
    await this.deleteProductService.execute(id);
  }
}

