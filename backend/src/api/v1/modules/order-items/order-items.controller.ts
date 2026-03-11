import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import {
  type CreateOrderItemBody,
  type ListOrderItemsQuery,
  type OrderItemIdParam,
  type UpdateOrderItemBody,
  type UpdateOrderItemVariantBody,
} from './order-items.schema'
import { orderItemService } from './order-items.service'

class OrderItemController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListOrderItemsQuery

    const { items, total, page, limit } = await orderItemService.findAll(query)

    SuccessResponse.paginated(
      res,
      items,
      { page, limit, total },
      'Order Items retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderItemIdParam

    const orderItem = await orderItemService.findById(id)

    SuccessResponse.send(res, orderItem, 'Order Item retrieved successfully')
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateOrderItemBody

    const createdItem = await orderItemService.create(data)

    SuccessResponse.created(res, createdItem, 'Order Item created successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderItemIdParam

    const deletedItem = await orderItemService.deleteById(id)

    SuccessResponse.send(res, deletedItem, 'Order Item deleted permanently')
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderItemIdParam

    const deletedItem = await orderItemService.softDeleteById(id)

    SuccessResponse.send(
      res,
      deletedItem,
      'Order Item soft deleted successfully',
    )
  }

  restore = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderItemIdParam

    const restoredItem = await orderItemService.restoreById(id)

    SuccessResponse.send(res, restoredItem, 'Order Item restored successfully')
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderItemIdParam
    const data = req.validatedData?.body as UpdateOrderItemBody

    const updatedItem = await orderItemService.updateById(id, data)

    SuccessResponse.send(res, updatedItem, 'Order Item updated successfully')
  }

  updateItemVariant = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderItemIdParam
    const { variantId } = req.validatedData?.body as UpdateOrderItemVariantBody

    const updatedItem = await orderItemService.updateOrderItemVariant(
      id,
      variantId,
    )

    SuccessResponse.send(
      res,
      updatedItem,
      'Order Item Variant updated successfully',
    )
  }
}

export const orderItemController = new OrderItemController()
