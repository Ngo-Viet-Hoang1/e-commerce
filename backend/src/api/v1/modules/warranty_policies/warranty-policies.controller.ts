import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import type {
  warrantyPolicyIdParamSchema,
  CreateWarrantyPolicyBody,
  ListWarrantyPoliciesQuery,
  UpdateWarrantyPolicyBody,
} from './warranty-policiesshema'
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
      'Warranty Policies retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as warrantyPolicyIdParamSchema

    const warrantyPolicy = await warrantyPoliciesService.findById(id)

    SuccessResponse.send(
      res,
      warrantyPolicy,
      'Warranty Policy retrieved successfully',
    )
  }

  create = async (req: Request, res: Response) => {
    const productId = Number(req.params.productId)

    const data = req.validatedData?.body as CreateWarrantyPolicyBody
    const warrantyPolicy = await warrantyPoliciesService.create(productId, data)

    SuccessResponse.created(
      res,
      warrantyPolicy,
      'Warranty Policy created successfully',
    )
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as warrantyPolicyIdParamSchema

    const data = req.validatedData?.body as UpdateWarrantyPolicyBody
    const updatedWarrantyPolicy = await warrantyPoliciesService.updateById(
      id,
      data,
    )

    SuccessResponse.send(
      res,
      updatedWarrantyPolicy,
      'Warranty Policy updated successfully',
    )
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as warrantyPolicyIdParamSchema

    const deletedWarrantyPolicy = await warrantyPoliciesService.deleteById(id)

    SuccessResponse.send(
      res,
      deletedWarrantyPolicy,
      'Warranty Policy deleted permanently',
    )
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as warrantyPolicyIdParamSchema

    const softDeletedWarrantyPolicy =
      await warrantyPoliciesService.softDeleteById(id)

    SuccessResponse.send(
      res,
      softDeletedWarrantyPolicy,
      'Warranty Policy soft deleted successfully',
    )
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as warrantyPolicyIdParamSchema

    const restoredWarrantyPolicy = await warrantyPoliciesService.restoreById(id)

    SuccessResponse.send(
      res,
      restoredWarrantyPolicy,
      'Warranty Policy restored successfully',
    )
  }
}

export const warrantyPoliciesController = new WarrantyPoliciesController()
export default new WarrantyPoliciesController()
