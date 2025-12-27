import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import {
  type AddressIdParam,
  type CreateAddressBody,
  type UpdateAddressBody,
  type ListAddressesQuery,
} from './address.schema'
import { addressService } from './address.service'

class AddressController {
  findAll = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const query = req.validatedData?.query as ListAddressesQuery

    const { addresses, total, page, limit } = await addressService.findAll(
      userId,
      query,
    )

    SuccessResponse.paginated(
      res,
      addresses,
      { page, limit, total },
      'Addresses retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { id } = req.validatedData?.params as AddressIdParam

    const address = await addressService.findById(id, userId)

    SuccessResponse.send(res, address, 'Address retrieved successfully')
  }

  create = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const data = req.validatedData?.body as CreateAddressBody

    const created = await addressService.create(userId, data)

    SuccessResponse.created(res, created, 'Address created successfully')
  }

  update = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { id } = req.validatedData?.params as AddressIdParam
    const data = req.validatedData?.body as UpdateAddressBody

    const updated = await addressService.updateById(id, userId, data)

    SuccessResponse.send(res, updated, 'Address updated successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { id } = req.validatedData?.params as AddressIdParam

    await addressService.deleteById(id, userId)

    SuccessResponse.send(res, null, 'Address deleted successfully')
  }

  setDefault = async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { id } = req.validatedData?.params as AddressIdParam

    const address = await addressService.setDefaultById(id, userId)

    SuccessResponse.send(res, address, 'Default address set successfully')
  }
}

export const addressController = new AddressController()
