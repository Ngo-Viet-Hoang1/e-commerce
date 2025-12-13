import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import {
  type AttributeIdParam,
  type CreateAttributeBody,
  type UpdateAttributeBody,
  type ListAttributesQuery,
} from './attribute.schema'
import { attributeService } from './attribute.service'

class AttributeController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListAttributesQuery

    const { attributes, total, page, limit } =
      await attributeService.findAll(query)

    SuccessResponse.paginated(
      res,
      attributes,
      { page, limit, total },
      'Attributes retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as AttributeIdParam

    const attribute = await attributeService.findById(id)

    SuccessResponse.send(res, attribute, 'Attribute retrieved successfully')
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateAttributeBody

    const created = await attributeService.create(data)

    SuccessResponse.created(res, created, 'Attribute created successfully')
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as AttributeIdParam
    const data = req.validatedData?.body as UpdateAttributeBody

    const updated = await attributeService.updateById(id, data)

    SuccessResponse.send(res, updated, 'Attribute updated successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as AttributeIdParam

    const deleted = await attributeService.deleteById(id)

    SuccessResponse.send(res, deleted, 'Attribute deleted permanently')
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as AttributeIdParam

    const deleted = await attributeService.softDeleteById(id)

    SuccessResponse.send(res, deleted, 'Attribute soft deleted successfully')
  }

  restore = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as AttributeIdParam

    const restored = await attributeService.restoreById(id)

    SuccessResponse.send(res, restored, 'Attribute restored successfully')
  }
}

export const attributeController = new AttributeController()
