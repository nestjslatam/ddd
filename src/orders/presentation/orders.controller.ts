import {
  Controller,
  Post,
  Get,
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
  CreateOrderDto,
  CreateOrderService,
} from '../application/use-cases/create-order';
import {
  AddItemToOrderDto,
  AddItemToOrderService,
} from '../application/use-cases/add-item-to-order';
import { RemoveItemFromOrderService } from '../application/use-cases/remove-item-from-order';
import { ChangeItemQuantityService } from '../application/use-cases/change-item-quantity';
import { ConfirmOrderService } from '../application/use-cases/confirm-order';
import { ShipOrderService } from '../application/use-cases/ship-order';
import { DeliverOrderService } from '../application/use-cases/deliver-order';
import { CancelOrderService } from '../application/use-cases/cancel-order';
import {
  GetOrderQuery,
  GetOrdersQuery,
  OrderResponse,
} from '../application/queries';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly createOrderService: CreateOrderService,
    private readonly addItemService: AddItemToOrderService,
    private readonly removeItemService: RemoveItemFromOrderService,
    private readonly changeQuantityService: ChangeItemQuantityService,
    private readonly confirmOrderService: ConfirmOrderService,
    private readonly shipOrderService: ShipOrderService,
    private readonly deliverOrderService: DeliverOrderService,
    private readonly cancelOrderService: CancelOrderService,
  ) {}

  /**
   * Create a new order
   * POST /orders
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() dto: CreateOrderDto): Promise<{ id: string }> {
    const id = await this.createOrderService.execute(dto);
    return { id };
  }

  /**
   * Get all orders
   * GET /orders?status=CONFIRMED&limit=10&offset=0
   */
  @Get()
  async getOrders(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<OrderResponse[]> {
    const query = new GetOrdersQuery(status, limit, offset);
    return await this.queryBus.execute(query);
  }

  /**
   * Get order by ID
   * GET /orders/:id
   */
  @Get(':id')
  async getOrder(@Param('id') id: string): Promise<OrderResponse> {
    const query = new GetOrderQuery(id);
    return await this.queryBus.execute(query);
  }

  /**
   * Add item to order
   * POST /orders/:id/items
   */
  @Post(':id/items')
  @HttpCode(HttpStatus.OK)
  async addItem(
    @Param('id') orderId: string,
    @Body() dto: Omit<AddItemToOrderDto, 'orderId'>,
  ): Promise<void> {
    await this.addItemService.execute({ ...dto, orderId });
  }

  /**
   * Remove item from order
   * DELETE /orders/:id/items/:productId
   */
  @Delete(':id/items/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Param('id') orderId: string,
    @Param('productId') productId: string,
  ): Promise<void> {
    await this.removeItemService.execute({ orderId, productId });
  }

  /**
   * Change item quantity
   * PATCH /orders/:id/items/:productId
   */
  @Patch(':id/items/:productId')
  @HttpCode(HttpStatus.OK)
  async changeQuantity(
    @Param('id') orderId: string,
    @Param('productId') productId: string,
    @Body() body: { newQuantity: number },
  ): Promise<void> {
    await this.changeQuantityService.execute({
      orderId,
      productId,
      newQuantity: body.newQuantity,
    });
  }

  /**
   * Confirm order
   * POST /orders/:id/confirm
   */
  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmOrder(@Param('id') orderId: string): Promise<void> {
    await this.confirmOrderService.execute({ orderId });
  }

  /**
   * Ship order
   * POST /orders/:id/ship
   */
  @Post(':id/ship')
  @HttpCode(HttpStatus.OK)
  async shipOrder(
    @Param('id') orderId: string,
    @Body() body: { trackingNumber?: string },
  ): Promise<void> {
    await this.shipOrderService.execute({
      orderId,
      trackingNumber: body.trackingNumber,
    });
  }

  /**
   * Deliver order
   * POST /orders/:id/deliver
   */
  @Post(':id/deliver')
  @HttpCode(HttpStatus.OK)
  async deliverOrder(@Param('id') orderId: string): Promise<void> {
    await this.deliverOrderService.execute({ orderId });
  }

  /**
   * Cancel order
   * POST /orders/:id/cancel
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param('id') orderId: string,
    @Body() body: { reason: string },
  ): Promise<void> {
    await this.cancelOrderService.execute({
      orderId,
      reason: body.reason,
    });
  }
}
