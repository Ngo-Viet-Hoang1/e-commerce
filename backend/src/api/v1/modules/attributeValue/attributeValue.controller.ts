import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import {
  type AttributeValueIdParam,
  type UpdateAttributeValueBody,
  type createAttributeValueBodySchema,
  type ListAttributeValuesQuery,
} from './attributeValue.schema'
import { attributeValueService } from './attributeValue.service'

class AttributeValueController {
  findAll = async (req: Request, res: Response) => {
    const attributeId = Number(req.params.attributeId)

    const query = req.validatedData?.query as ListAttributeValuesQuery

    const { values, total, page, limit } = await attributeValueService.findAll(
      attributeId,
      query,
    )

    SuccessResponse.paginated(
      res,
      values,
      { page, limit, total },
      'Attribute Values retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as AttributeValueIdParam

    const attributeValue = await attributeValueService.findById(id)

    SuccessResponse.send(
      res,
      attributeValue,
      'Attribute Value retrieved successfully',
    )
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as createAttributeValueBodySchema

    const createdvalue = await attributeValueService.create(data)

    SuccessResponse.created(
      res,
      createdvalue,
      'Attribute Value created successfully',
    )
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as AttributeValueIdParam
    const deletedvalue = await attributeValueService.deleteById(id)

    SuccessResponse.send(
      res,
      deletedvalue,
      'Attribute Value deleted permanently',
    )
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as AttributeValueIdParam

    const deletedvalue = await attributeValueService.softDeleteById(id)

    SuccessResponse.send(
      res,
      deletedvalue,
      'Attribute Value soft deleted successfully',
    )
  }

  restore = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as AttributeValueIdParam

    const restoredvalue = await attributeValueService.restoreById(id)

    SuccessResponse.send(
      res,
      restoredvalue,
      'Attribute Value restored successfully',
    )
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as AttributeValueIdParam
    const data = req.validatedData?.body as UpdateAttributeValueBody

    const updatedvalue = await attributeValueService.updateById(id, data)

    SuccessResponse.send(
      res,
      updatedvalue,
      'Attribute Value updated successfully',
    )
  }
}

export const attributeValueController = new AttributeValueController()
