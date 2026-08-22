import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  CreateWarrantyPolicyBody,
  ListWarrantyPoliciesQuery,
  UpdateWarrantyPolicyBody,
  WarrantyPolicyIdParam,
} from './warranty-policies.schema'
import warrantyPoliciesService from './warranty-policies.service'

class WarrantyPoliciesController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListWarrantyPoliciesQuery

    const { warrantyPolicies, total, page, limit } =
      await warrantyPoliciesService.findAll(query)

    SuccessResponse.paginated(
      res,
      warrantyPolicies,
      { page, limit, total },
      'Warranty policies retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as WarrantyPolicyIdParam

    const warrantyPolicy = await warrantyPoliciesService.findById(id)

    SuccessResponse.send(
      res,
      warrantyPolicy,
      'Warranty policy retrieved successfully',
    )
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateWarrantyPolicyBody

    const warrantyPolicy = await warrantyPoliciesService.create(data)

    SuccessResponse.created(
      res,
      warrantyPolicy,
      'Warranty policy created successfully',
    )
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as WarrantyPolicyIdParam
    const data = req.validatedData?.body as UpdateWarrantyPolicyBody

    const updatedWarrantyPolicy = await warrantyPoliciesService.update(id, data)

    SuccessResponse.send(
      res,
      updatedWarrantyPolicy,
      'Warranty policy updated successfully',
    )
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as WarrantyPolicyIdParam

    const deleted = await warrantyPoliciesService.deleteById(id)

    SuccessResponse.send(res, deleted, 'Warranty policy deleted permanently')
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as WarrantyPolicyIdParam

    const softDeleted = await warrantyPoliciesService.softDelete(id)

    SuccessResponse.send(
      res,
      softDeleted,
      'Warranty policy soft deleted successfully',
    )
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as WarrantyPolicyIdParam

    const restoredWarrantyPolicy = await warrantyPoliciesService.restore(id)

    SuccessResponse.send(
      res,
      restoredWarrantyPolicy,
      'Warranty policy restored successfully',
    )
  }
}

export const warrantyPoliciesController = new WarrantyPoliciesController()
export default warrantyPoliciesController
