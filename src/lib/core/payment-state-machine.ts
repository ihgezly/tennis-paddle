import { PaymentStatus, OrderStatus } from "./types/types";

const paymentTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [
    PaymentStatus.INITIATING,
    PaymentStatus.CANCELLED,
    PaymentStatus.EXPIRED,
  ],
  [PaymentStatus.INITIATING]: [
    PaymentStatus.PAID,
    PaymentStatus.FAILED,
    PaymentStatus.EXPIRED,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.AUTHORIZED]: [
    PaymentStatus.PAID,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.PAID]: [PaymentStatus.REFUNDED],
  [PaymentStatus.FAILED]: [],
  [PaymentStatus.CANCELLED]: [],
  [PaymentStatus.EXPIRED]: [],
  [PaymentStatus.REFUNDED]: [],
};

const orderTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.CANCELED,
  ],
  [OrderStatus.PENDING_PAYMENT]: [
    OrderStatus.READY,
    OrderStatus.CANCELED,
  ],
  [OrderStatus.READY]: [
    OrderStatus.DONE,
    OrderStatus.CANCELED,
  ],
  [OrderStatus.DONE]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELED]: [OrderStatus.NEW],
  [OrderStatus.REFUNDED]: [OrderStatus.NEW],
};

export function canTransitionPayment(
  from: PaymentStatus,
  to: PaymentStatus,
): boolean {
  return paymentTransitions[from]?.includes(to) ?? false;
}

export function assertPaymentTransition(
  from: PaymentStatus,
  to: PaymentStatus,
): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(`INVALID_PAYMENT_TRANSITION:${from}->${to}`);
  }
}

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return orderTransitions[from]?.includes(to) ?? false;
}

export function assertOrderTransition(
  from: OrderStatus,
  to: OrderStatus,
): void {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`INVALID_ORDER_TRANSITION:${from}->${to}`);
  }
}