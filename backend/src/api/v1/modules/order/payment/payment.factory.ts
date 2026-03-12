import { BadRequestException } from '@v1/shared/models/app-error.model'
import { PaymentMethod } from '../order.constants'
import type { PaymentStrategy } from './payment.strategy.interface'
import { CodStrategy } from './strategies/cod.strategy'
import { VnpayStrategy } from './strategies/vnpay.strategy'

export class PaymentStrategyFactory {
  private static readonly registry = new Map<PaymentMethod, PaymentStrategy>([
    [PaymentMethod.COD, new CodStrategy()],
    [PaymentMethod.VNPAY, new VnpayStrategy()],
  ])

  static get(method: string): PaymentStrategy {
    const strategy = this.registry.get(method as PaymentMethod)

    if (!strategy) {
      throw new BadRequestException(`Unsupported payment method: ${method}`, {
        supportedMethods: [...this.registry.keys()],
      })
    }

    return strategy
  }

  static register(method: PaymentMethod, strategy: PaymentStrategy): void {
    this.registry.set(method, strategy)
  }
}
