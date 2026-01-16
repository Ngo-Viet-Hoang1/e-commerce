import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import {
  type CreateOrderItemBody,
  type ListOrderItemsQuery,
  type OrderItemIdParam,
  type updateOrderItemBody,
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

    SuccessResponse.send(
      res,
      orderItem,
      'Attribute Value retrieved successfully',
    )
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateOrderItemBody

    const createditem = await orderItemService.create(data)

    SuccessResponse.created(res, createditem, 'Order Item created successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderItemIdParam

    const deleteditem = await orderItemService.deleteById(id)

    SuccessResponse.send(res, deleteditem, 'Order Item deleted permanently')
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderItemIdParam

    const deleteditem = await orderItemService.softDeleteById(id)

    SuccessResponse.send(
      res,
      deleteditem,
      'Order Item soft deleted successfully',
    )
  }

  restore = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderItemIdParam

    const restoreditem = await orderItemService.restoreById(id)

    SuccessResponse.send(res, restoreditem, 'Order Item restored successfully')
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderItemIdParam
    const data = req.validatedData?.body as updateOrderItemBody

    const updateditem = await orderItemService.updateById(id, data)

    SuccessResponse.send(res, updateditem, 'Order Item updated successfully')
  }

  updateItemVariant = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as OrderItemIdParam
    const { variantId } = req.validatedData?.body as { variantId: number }

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
