import type { Request, Response } from 'express'
import { SuccessResponse } from '../../shared/models/success-response.model'
import {
  userDtoSchema,
  type CreateUserBody,
  type ListUsersQuery,
  type UpdateUserBody,
  type UserIdParam,
  type favoriteProductParam,
} from './user.schema'
import { userService } from './user.service'

class UserController {
  findAll = async (req: Request, res: Response) => {
    const query = req.validatedData?.query as ListUsersQuery

    const { users, total, page, limit } = await userService.findAll(query)

    const dtos = users.map((user) => userDtoSchema.parse(user))

    SuccessResponse.paginated(
      res,
      dtos,
      { page, limit, total },
      'Users retrieved successfully',
    )
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as UserIdParam

    const user = await userService.findById(id)

    SuccessResponse.send(res, user, 'User retrieved successfully')
  }

  create = async (req: Request, res: Response) => {
    const data = req.validatedData?.body as CreateUserBody

    const user = await userService.create(data)

    SuccessResponse.created(res, user, 'User created successfully')
  }

  updateById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as UserIdParam
    const data = req.validatedData?.body as UpdateUserBody

    const updatedUser = await userService.updateById(id, data)

    SuccessResponse.send(res, updatedUser, 'User updated successfully')
  }

  deleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as UserIdParam

    const deletedUser = await userService.deleteById(id)

    SuccessResponse.send(res, deletedUser, 'User deleted permanently')
  }

  softDeleteById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as UserIdParam

    const deletedUser = await userService.softDeleteById(id)

    SuccessResponse.send(res, deletedUser, 'User soft deleted successfully')
  }

  restoreById = async (req: Request, res: Response) => {
    const { id } = req.validatedData?.params as UserIdParam

    const restoredUser = await userService.restoreById(id)

    SuccessResponse.send(res, restoredUser, 'User restored successfully')
  }

  addFavoriteProduct = async (req: Request, res: Response) => {
    const userId = req.user!.id

    const { productId } = req.validatedData?.params as favoriteProductParam

    await userService.addFavoriteProduct(userId, productId)

    SuccessResponse.send(res, null, 'Product favorite added successfully')
  }

  removeFavoriteProduct = async (req: Request, res: Response) => {
    const userId = req.user!.id

    const { productId } = req.validatedData?.params as favoriteProductParam

    await userService.removeFavoriteProduct(userId, productId)

    SuccessResponse.send(res, null, 'Product favorite deleted successfully')
  }

  removeAllFavoriteProducts = async (req: Request, res: Response) => {
    const userId = req.user!.id

    await userService.removeAllFavoriteProducts(userId)

    SuccessResponse.send(
      res,
      null,
      'All favorite products deleted successfully',
    )
  }

  getFavoriteProducts = async (req: Request, res: Response) => {
    const userId = req.user!.id

    const favoriteProducts = await userService.getFavoriteProducts(userId)

    SuccessResponse.send(
      res,
      favoriteProducts,
      'Favorite products retrieved successfully',
    )
  }
}

export const userController = new UserController()
export default UserController
