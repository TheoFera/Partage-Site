import type { OrderStatus } from '../types/orders';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Brouillon',
  open: 'Ouverte',
  locked: 'Cloturee',
  confirmed: 'Confirmee',
  preparing: 'En preparation',
  prepared: 'Preparee',
  delivered: 'Livree',
  distributed: 'Distribuee',
  finished: 'Terminee',
  cancelled: 'Annulee',
};

export const getOrderStatusLabel = (status?: OrderStatus | null) => {
  if (!status) return '';
  return ORDER_STATUS_LABELS[status] ?? status;
};
