import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabaseClient';
import type { GroupOrder, Product, ProductListingRow } from '../types';
import {
  centsToEuros,
  type DbOrder,
  type DbOrderProduct,
  type DbOrderItem,
  type DbOrderParticipant,
  type DbOrderPickupSlot,
  type DbPayment,
  type DeliveryOption,
  type Order,
  type OrderFull,
  type OrderItem,
  type OrderParticipant,
  type OrderProduct,
  type OrderProductInfo,
  type OrderPickupSlot,
  type OrderStatus,
  type ParticipantVisibility,
  type Payment,
  type ShareMode,
} from '../types/orders';

const PRODUCT_IMAGE_BUCKET = 'product-images';

const getClient = (): SupabaseClient => {
  try {
    return getSupabaseClient();
  } catch (error) {
    throw new Error('Supabase non configure.');
  }
};

const toDate = (value: string | null) => (value ? new Date(value) : null);

const mapOrderRow = (row: DbOrder): Order => ({
  id: row.id,
  orderCode: row.order_code,
  createdBy: row.created_by,
  sharerProfileId: row.sharer_profile_id,
  producerProfileId: row.producer_profile_id,
  title: row.title,
  visibility: row.visibility,
  status: row.status,
  deadline: toDate(row.deadline),
  message: row.message,
  autoApproveParticipationRequests: row.auto_approve_participation_requests,
  allowSharerMessages: row.allow_sharer_messages,
  autoApprovePickupSlots: row.auto_approve_pickup_slots,
  minWeightKg: row.min_weight_kg,
  maxWeightKg: row.max_weight_kg,
  orderedWeightKg: row.ordered_weight_kg,
  deliveryOption: row.delivery_option,
  deliveryStreet: row.delivery_street,
  deliveryInfo: row.delivery_info,
  deliveryCity: row.delivery_city,
  deliveryPostcode: row.delivery_postcode,
  deliveryAddress: row.delivery_address,
  deliveryLat: row.delivery_lat ?? null,
  deliveryLng: row.delivery_lng ?? null,
  estimatedDeliveryDate: toDate(row.estimated_delivery_date),
  pickupStreet: row.pickup_street,
  pickupInfo: row.pickup_info,
  pickupCity: row.pickup_city,
  pickupPostcode: row.pickup_postcode,
  pickupAddress: row.pickup_address,
  pickupLat: row.pickup_lat ?? null,
  pickupLng: row.pickup_lng ?? null,
  usePickupDate: row.use_pickup_date,
  pickupDate: toDate(row.pickup_date),
  pickupWindowWeeks: row.pickup_window_weeks,
  pickupDeliveryFeeCents: row.pickup_delivery_fee_cents,
  sharerPercentage: row.sharer_percentage,
  shareMode: row.share_mode,
  sharerQuantities: row.sharer_quantities ?? {},
  currency: row.currency,
  baseTotalCents: row.base_total_cents,
  deliveryFeeCents: row.delivery_fee_cents,
  participantTotalCents: row.participant_total_cents,
  sharerShareCents: row.sharer_share_cents,
  effectiveWeightKg: row.effective_weight_kg,
  participantsVisibility: row.participants_visibility,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const mapOrderProductRow = (row: DbOrderProduct, product: OrderProductInfo | null): OrderProduct => ({
  id: row.id,
  orderId: row.order_id,
  productId: row.product_id,
  sortOrder: row.sort_order,
  isEnabled: row.is_enabled,
  unitLabel: row.unit_label,
  unitWeightKg: row.unit_weight_kg,
  unitBasePriceCents: row.unit_base_price_cents,
  unitDeliveryCents: row.unit_delivery_cents,
  unitSharerFeeCents: row.unit_sharer_fee_cents,
  unitFinalPriceCents: row.unit_final_price_cents,
  priceBreakdownSnapshot: row.price_breakdown_snapshot ?? null,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  product,
});

const mapPickupSlotRow = (row: DbOrderPickupSlot): OrderPickupSlot => ({
  id: row.id,
  orderId: row.order_id,
  slotType: row.slot_type,
  day: row.day,
  slotDate: row.slot_date,
  label: row.label,
  enabled: row.enabled,
  startTime: row.start_time,
  endTime: row.end_time,
  sortOrder: row.sort_order,
});

const mapParticipantRow = (row: DbOrderParticipant): OrderParticipant => ({
  id: row.id,
  orderId: row.order_id,
  profileId: row.profile_id,
  role: row.role,
  participationStatus: row.participation_status,
  requestMessage: row.request_message,
  requestedAt: new Date(row.requested_at),
  reviewedAt: toDate(row.reviewed_at),
  reviewedBy: row.reviewed_by,
  pickupSlotId: row.pickup_slot_id,
  pickupSlotStatus: row.pickup_slot_status,
  pickupSlotRequestedAt: toDate(row.pickup_slot_requested_at),
  pickupSlotReviewedAt: toDate(row.pickup_slot_reviewed_at),
  pickupSlotReviewedBy: row.pickup_slot_reviewed_by,
  totalWeightKg: row.total_weight_kg,
  totalAmountCents: row.total_amount_cents,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const mapItemRow = (row: DbOrderItem): OrderItem => ({
  id: row.id,
  orderId: row.order_id,
  participantId: row.participant_id,
  productId: row.product_id,
  lotId: row.lot_id,
  quantityUnits: row.quantity_units,
  unitLabel: row.unit_label,
  unitWeightKg: row.unit_weight_kg,
  unitBasePriceCents: row.unit_base_price_cents,
  unitDeliveryCents: row.unit_delivery_cents,
  unitSharerFeeCents: row.unit_sharer_fee_cents,
  unitFinalPriceCents: row.unit_final_price_cents,
  lineTotalCents: row.line_total_cents,
  lineWeightKg: row.line_weight_kg,
  isSharerShare: row.is_sharer_share,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const mapPaymentRow = (row: DbPayment): Payment => ({
  id: row.id,
  orderId: row.order_id,
  participantId: row.participant_id,
  provider: row.provider,
  providerPaymentId: row.provider_payment_id,
  idempotencyKey: row.idempotency_key,
  status: row.status,
  amountCents: row.amount_cents,
  feeCents: row.fee_cents,
  refundedAmountCents: row.refunded_amount_cents,
  currency: row.currency,
  paidAt: toDate(row.paid_at),
  failureCode: row.failure_code,
  failureMessage: row.failure_message,
  raw: row.raw ?? {},
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const buildImageUrl = (client: SupabaseClient, path?: string | null, bucket = PRODUCT_IMAGE_BUCKET) => {
  if (!path) return '';
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? '';
};

const mapListingRowToOrderProductInfo = (
  row: ProductListingRow,
  client: SupabaseClient
): OrderProductInfo => {
  const measurement: 'kg' | 'unit' = row.sale_unit === 'kg' ? 'kg' : 'unit';
  return {
    id: row.product_id,
    code: row.product_code,
    slug: row.slug ?? null,
    name: row.name,
    description: row.description ?? null,
    packaging: row.packaging ?? null,
    measurement,
    unitWeightKg: row.unit_weight_kg ?? null,
    imageUrl: buildImageUrl(client, row.primary_image_path),
    producerProfileId: row.producer_profile_id ?? null,
    producerName: row.producer_name ?? null,
    producerLocation: row.producer_location ?? null,
  };
};

const mapProductListingToProduct = (row: ProductListingRow, client: SupabaseClient): Product => {
  const measurement = row.sale_unit === 'kg' ? 'kg' : 'unit';
  const priceCents = row.active_lot_price_cents ?? row.default_price_cents ?? 0;
  const quantity =
    measurement === 'kg' ? Number(row.active_lot_stock_kg ?? 0) : Number(row.active_lot_stock_units ?? 0);
  const inStock = Boolean(row.active_lot_code) && quantity > 0;
  return {
    id: row.product_code,
    productCode: row.product_code,
    dbId: row.product_id,
    slug: row.slug,
    activeLotCode: row.active_lot_code ?? undefined,
    activeLotId: row.active_lot_id ?? undefined,
    name: row.name,
    description: row.description ?? '',
    price: centsToEuros(priceCents),
    unit: measurement === 'kg' ? 'kg' : row.packaging,
    quantity,
    category: row.category,
    imageUrl: buildImageUrl(client, row.primary_image_path),
    producerId: row.producer_profile_id ?? row.product_code,
    producerName: row.producer_name ?? 'Producteur',
    producerLocation: row.producer_location ?? 'Local',
    inStock,
    measurement,
    weightKg: row.unit_weight_kg ?? undefined,
  };
};

const fetchProductsByIds = async (client: SupabaseClient, productIds: string[]) => {
  if (!productIds.length) return [] as ProductListingRow[];
  const { data, error } = await client.from('v_products_listing').select('*').in('product_id', productIds);
  if (error) throw error;
  return (data as ProductListingRow[]) ?? [];
};

const fetchProductsByCodes = async (client: SupabaseClient, productCodes: string[]) => {
  if (!productCodes.length) return [] as ProductListingRow[];
  const { data, error } = await client.from('v_products_listing').select('*').in('product_code', productCodes);
  if (error) throw error;
  return (data as ProductListingRow[]) ?? [];
};

const fetchProfilesByIds = async (client: SupabaseClient, profileIds: string[]) => {
  if (!profileIds.length) return [] as Array<Record<string, unknown>>;
  const { data, error } = await client
    .from('profiles')
    .select('id, name, handle, avatar_path, avatar_updated_at')
    .in('id', profileIds);
  if (error) throw error;
  return (data as Array<Record<string, unknown>>) ?? [];
};

const resolveUnitWeightKg = (saleUnit: string | null, unitWeightKg: number | null, packaging?: string | null) => {
  if (typeof unitWeightKg === 'number' && Number.isFinite(unitWeightKg)) return unitWeightKg;
  const unitLabel = packaging?.toLowerCase() ?? '';
  const match = unitLabel.match(/([\d.,]+)\s*(kg|g)/);
  if (match) {
    const raw = parseFloat(match[1].replace(',', '.'));
    if (Number.isFinite(raw)) {
      return match[2] === 'kg' ? raw : raw / 1000;
    }
  }
  if (saleUnit === 'kg') return 1;
  return 0.25;
};

const calculateOrderItemPricing = (params: {
  order: Order;
  basePriceCents: number;
  unitWeightKg: number;
  quantityUnits: number;
}) => {
  const { order, basePriceCents, unitWeightKg, quantityUnits } = params;
  const feePerKg = order.effectiveWeightKg > 0 ? order.deliveryFeeCents / order.effectiveWeightKg : 0;
  const unitDeliveryCents = Math.round(feePerKg * unitWeightKg);
  const basePlusDelivery = basePriceCents + unitDeliveryCents;
  const shareFraction =
    order.sharerPercentage > 0 && order.sharerPercentage < 100
      ? order.sharerPercentage / (100 - order.sharerPercentage)
      : 0;
  const unitSharerFeeCents = Math.round(basePlusDelivery * shareFraction);
  const unitFinalPriceCents = basePlusDelivery + unitSharerFeeCents;
  return {
    unitDeliveryCents,
    unitSharerFeeCents,
    unitFinalPriceCents,
    lineTotalCents: unitFinalPriceCents * quantityUnits,
    lineWeightKg: unitWeightKg * quantityUnits,
  };
};

export type CreateOrderPayload = {
  userId: string;
  productCodes: string[];
  title: string;
  visibility: 'public' | 'private';
  status?: OrderStatus;
  deadline: Date | null;
  message?: string;
  autoApproveParticipationRequests: boolean;
  allowSharerMessages: boolean;
  autoApprovePickupSlots: boolean;
  minWeightKg: number;
  maxWeightKg: number | null;
  orderedWeightKg?: number;
  deliveryOption: DeliveryOption;
  deliveryStreet?: string;
  deliveryInfo?: string;
  deliveryCity?: string;
  deliveryPostcode?: string;
  deliveryAddress?: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  estimatedDeliveryDate?: Date | null;
  pickupStreet?: string;
  pickupInfo?: string;
  pickupCity?: string;
  pickupPostcode?: string;
  pickupAddress?: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  usePickupDate: boolean;
  pickupDate?: Date | null;
  pickupWindowWeeks?: number | null;
  pickupDeliveryFeeCents: number;
  sharerPercentage: number;
  shareMode: ShareMode;
  sharerQuantities: Record<string, number>;
  currency?: string;
  baseTotalCents: number;
  deliveryFeeCents: number;
  participantTotalCents: number;
  sharerShareCents: number;
  effectiveWeightKg: number;
  participantsVisibility: ParticipantVisibility;
  slots: Array<{
    slotType: 'weekday' | 'date';
    day?: string;
    slotDate?: string;
    label: string;
    enabled: boolean;
    startTime: string;
    endTime: string;
  }>;
};

export const createOrder = async (payload: CreateOrderPayload): Promise<string> => {
  const client = getClient();
  if (!payload.userId) throw new Error('Utilisateur requis pour creer une commande.');
  if (!payload.productCodes.length) throw new Error('Selection de produits requise.');

  const productRows = await fetchProductsByCodes(client, payload.productCodes);
  if (productRows.length !== payload.productCodes.length) {
    throw new Error('Impossible de charger tous les produits selectionnes.');
  }

  const producerProfileId = (productRows[0]?.producer_profile_id as string | null) ?? payload.userId;
  const orderInsert = {
    created_by: payload.userId,
    sharer_profile_id: payload.userId,
    producer_profile_id: producerProfileId,
    title: payload.title,
    visibility: payload.visibility,
    status: payload.status ?? 'open',
    deadline: payload.deadline ? payload.deadline.toISOString().slice(0, 10) : null,
    message: payload.message ?? null,
    auto_approve_participation_requests: payload.autoApproveParticipationRequests,
    allow_sharer_messages: payload.allowSharerMessages,
    auto_approve_pickup_slots: payload.autoApprovePickupSlots,
    min_weight_kg: payload.minWeightKg,
    max_weight_kg: payload.maxWeightKg,
    ordered_weight_kg: payload.orderedWeightKg ?? 0,
    delivery_option: payload.deliveryOption,
    delivery_street: payload.deliveryStreet ?? null,
    delivery_info: payload.deliveryInfo ?? null,
    delivery_city: payload.deliveryCity ?? null,
    delivery_postcode: payload.deliveryPostcode ?? null,
    delivery_address: payload.deliveryAddress ?? null,
    delivery_lat: payload.deliveryLat ?? null,
    delivery_lng: payload.deliveryLng ?? null,
    estimated_delivery_date: payload.estimatedDeliveryDate
      ? payload.estimatedDeliveryDate.toISOString().slice(0, 10)
      : null,
    pickup_street: payload.pickupStreet ?? null,
    pickup_info: payload.pickupInfo ?? null,
    pickup_city: payload.pickupCity ?? null,
    pickup_postcode: payload.pickupPostcode ?? null,
    pickup_address: payload.pickupAddress ?? null,
    pickup_lat: payload.pickupLat ?? null,
    pickup_lng: payload.pickupLng ?? null,
    use_pickup_date: payload.usePickupDate,
    pickup_date: payload.pickupDate ? payload.pickupDate.toISOString().slice(0, 10) : null,
    pickup_window_weeks: payload.pickupWindowWeeks ?? null,
    pickup_delivery_fee_cents: payload.pickupDeliveryFeeCents,
    sharer_percentage: payload.sharerPercentage,
    share_mode: payload.shareMode,
    sharer_quantities: payload.sharerQuantities,
    currency: payload.currency ?? 'EUR',
    base_total_cents: payload.baseTotalCents,
    delivery_fee_cents: payload.deliveryFeeCents,
    participant_total_cents: payload.participantTotalCents,
    sharer_share_cents: payload.sharerShareCents,
    effective_weight_kg: payload.effectiveWeightKg,
    participants_visibility: payload.participantsVisibility,
  };

  const { data: insertedOrder, error: insertError } = await client
    .from('orders')
    .insert(orderInsert)
    .select('*')
    .single();
  if (insertError || !insertedOrder) throw insertError ?? new Error('Creation commande impossible.');

  const order = mapOrderRow(insertedOrder as DbOrder);
  const orderProductsPayload = productRows.map((productRow, index) => {
    const unitWeightKg = resolveUnitWeightKg(
      productRow.sale_unit,
      productRow.unit_weight_kg,
      productRow.packaging
    );
    const basePriceCents = Number(productRow.active_lot_price_cents ?? productRow.default_price_cents ?? 0);
    const pricing = calculateOrderItemPricing({
      order,
      basePriceCents,
      unitWeightKg,
      quantityUnits: 1,
    });
    return {
      order_id: order.id,
      product_id: productRow.product_id,
      sort_order: index,
      is_enabled: true,
      unit_label: productRow.sale_unit === 'kg' ? 'kg' : productRow.packaging,
      unit_weight_kg: unitWeightKg,
      unit_base_price_cents: basePriceCents,
      unit_delivery_cents: pricing.unitDeliveryCents,
      unit_sharer_fee_cents: pricing.unitSharerFeeCents,
      unit_final_price_cents: pricing.unitFinalPriceCents,
      price_breakdown_snapshot: {
        base_cents: basePriceCents,
        delivery_cents: pricing.unitDeliveryCents,
        sharer_cents: pricing.unitSharerFeeCents,
        final_cents: pricing.unitFinalPriceCents,
      },
    };
  });
  const orderProductsById = new Map<string, (typeof orderProductsPayload)[number]>();
  orderProductsPayload.forEach((row) => {
    orderProductsById.set(row.product_id as string, row);
  });
  if (orderProductsPayload.length) {
    const { error: orderProductsError } = await client.from('order_products').insert(orderProductsPayload);
    if (orderProductsError) throw orderProductsError;
  }

  if (payload.slots.length) {
    const slotRows = payload.slots.map((slot, index) => ({
      order_id: order.id,
      slot_type: slot.slotType,
      day: slot.slotType === 'weekday' ? slot.day ?? null : null,
      slot_date: slot.slotType === 'date' ? slot.slotDate ?? null : null,
      label: slot.label,
      enabled: slot.enabled,
      start_time: slot.startTime,
      end_time: slot.endTime,
      sort_order: index,
    }));
    const { error: slotError } = await client.from('order_pickup_slots').insert(slotRows);
    if (slotError) throw slotError;
  }

  const { data: sharerParticipant, error: sharerError } = await client
    .from('order_participants')
    .insert({
      order_id: order.id,
      profile_id: payload.userId,
      role: 'sharer',
      participation_status: 'accepted',
    })
    .select('*')
    .single();
  if (sharerError || !sharerParticipant) throw sharerError ?? new Error('Participant partageur manquant.');

  if (payload.shareMode === 'products') {
    const sharerItems = payload.productCodes
      .map((code) => ({
        code,
        quantity: Math.max(0, Number(payload.sharerQuantities[code] ?? 0)),
      }))
      .filter((entry) => entry.quantity > 0);

    if (sharerItems.length) {
      const itemsPayload = sharerItems
        .map((entry) => {
          const productRow = productRows.find((row) => row.product_code === entry.code);
          if (!productRow) return null;
          const orderProduct = orderProductsById.get(productRow.product_id as string);
          const fallbackUnitWeightKg = resolveUnitWeightKg(
            productRow.sale_unit,
            productRow.unit_weight_kg,
            productRow.packaging
          );
          const unitWeightKg = orderProduct?.unit_weight_kg ?? fallbackUnitWeightKg;
          const basePriceCents = Number(productRow.active_lot_price_cents ?? productRow.default_price_cents ?? 0);
          const unitBasePriceCents = orderProduct?.unit_base_price_cents ?? basePriceCents;
          const unitDeliveryCents = orderProduct?.unit_delivery_cents ?? 0;
          const unitSharerFeeCents = orderProduct?.unit_sharer_fee_cents ?? 0;
          const unitFinalPriceCents =
            orderProduct?.unit_final_price_cents ?? unitBasePriceCents + unitDeliveryCents + unitSharerFeeCents;
          const lineTotalCents = unitFinalPriceCents * entry.quantity;
          const lineWeightKg = unitWeightKg * entry.quantity;
          return {
            order_id: order.id,
            participant_id: (sharerParticipant as DbOrderParticipant).id,
            product_id: productRow.product_id,
            lot_id: null,
            quantity_units: entry.quantity,
            unit_label: productRow.sale_unit === 'kg' ? 'kg' : productRow.packaging,
            unit_weight_kg: unitWeightKg,
            unit_base_price_cents: unitBasePriceCents,
            unit_delivery_cents: unitDeliveryCents,
            unit_sharer_fee_cents: unitSharerFeeCents,
            unit_final_price_cents: unitFinalPriceCents,
            line_total_cents: lineTotalCents,
            line_weight_kg: lineWeightKg,
            is_sharer_share: true,
          };
        })
        .filter(Boolean) as Array<Record<string, unknown>>;

      if (itemsPayload.length) {
        const { error: itemsError } = await client.from('order_items').insert(itemsPayload);
        if (itemsError) throw itemsError;
        await recomputeCaches(order.id, (sharerParticipant as DbOrderParticipant).id);
      }
    }
  }

  return order.orderCode;
};

export const getOrderByCode = async (orderCode: string): Promise<Order> => {
  const client = getClient();
  const { data, error } = await client.from('orders').select('*').eq('order_code', orderCode).maybeSingle();
  if (error || !data) throw error ?? new Error('Commande introuvable.');
  return mapOrderRow(data as DbOrder);
};

export const getOrderFullByCode = async (orderCode: string): Promise<OrderFull> => {
  const client = getClient();
  const orderRow = await getOrderByCode(orderCode);

  const [slotsRes, participantsRes, itemsRes, paymentsRes, orderProductsRes] = await Promise.all([
    client.from('order_pickup_slots').select('*').eq('order_id', orderRow.id),
    client.from('order_participants').select('*').eq('order_id', orderRow.id),
    client.from('order_items').select('*').eq('order_id', orderRow.id),
    client.from('payments').select('*').eq('order_id', orderRow.id),
    client.from('order_products').select('*').eq('order_id', orderRow.id).order('sort_order', { ascending: true }),
  ]);

  if (slotsRes.error) throw slotsRes.error;
  if (participantsRes.error) throw participantsRes.error;
  if (itemsRes.error) throw itemsRes.error;
  if (paymentsRes.error) throw paymentsRes.error;
  if (orderProductsRes.error) throw orderProductsRes.error;

  const participants = (participantsRes.data as DbOrderParticipant[] | null) ?? [];
  const participantIds = participants.map((row) => row.profile_id).filter(Boolean) as string[];
  const profileIds = Array.from(new Set([orderRow.sharerProfileId, orderRow.producerProfileId, ...participantIds]));
  const profiles = await fetchProfilesByIds(client, profileIds);
  const profileMap = new Map<
    string,
    { name?: string | null; handle?: string | null; avatarPath?: string | null; avatarUpdatedAt?: string | null }
  >();
  profiles.forEach((profile) => {
    const id = profile.id as string;
    if (!id) return;
    profileMap.set(id, {
      name: (profile.name as string | null) ?? null,
      handle: (profile.handle as string | null) ?? null,
      avatarPath: (profile.avatar_path as string | null) ?? null,
      avatarUpdatedAt: (profile.avatar_updated_at as string | null) ?? null,
    });
  });

  const mappedParticipants = participants.map((row) => {
    const mapped = mapParticipantRow(row);
    const profile = mapped.profileId ? profileMap.get(mapped.profileId) : undefined;
    return {
      ...mapped,
      profileName: profile?.name ?? null,
      profileHandle: profile?.handle ?? null,
      avatarPath: profile?.avatarPath ?? null,
      avatarUpdatedAt: profile?.avatarUpdatedAt ?? null,
    };
  });

  const orderProductRows = (orderProductsRes.data as DbOrderProduct[] | null) ?? [];
  const orderProductIds = Array.from(new Set(orderProductRows.map((row) => row.product_id)));
  const productRows = await fetchProductsByIds(client, orderProductIds);
  const productInfoById = new Map<string, OrderProductInfo>();
  (productRows as ProductListingRow[]).forEach((row) => {
    productInfoById.set(row.product_id, mapListingRowToOrderProductInfo(row, client));
  });
  const productsOffered = orderProductRows.map((row) =>
    mapOrderProductRow(row, productInfoById.get(row.product_id) ?? null)
  );

  return {
    order: orderRow,
    productsOffered,
    pickupSlots: ((slotsRes.data as DbOrderPickupSlot[] | null) ?? []).map(mapPickupSlotRow),
    participants: mappedParticipants,
    items: ((itemsRes.data as DbOrderItem[] | null) ?? []).map(mapItemRow),
    payments: ((paymentsRes.data as DbPayment[] | null) ?? []).map(mapPaymentRow),
  };
};

export const requestParticipation = async (orderCode: string, profileId: string, message?: string) => {
  const client = getClient();
  const order = await client
    .from('orders')
    .select('id, auto_approve_participation_requests')
    .eq('order_code', orderCode)
    .maybeSingle();
  if (order.error || !order.data) throw order.error ?? new Error('Commande introuvable.');
  const orderId = order.data.id as string;
  const status = order.data.auto_approve_participation_requests ? 'accepted' : 'requested';
  const existing = await client
    .from('order_participants')
    .select('*')
    .eq('order_id', orderId)
    .eq('profile_id', profileId)
    .limit(1);
  if (existing.error) throw existing.error;

  if (existing.data?.length) {
    const { data, error } = await client
      .from('order_participants')
      .update({
        participation_status: status,
        request_message: message ?? null,
        requested_at: new Date().toISOString(),
      })
      .eq('id', existing.data[0].id)
      .select('*')
      .single();
    if (error || !data) throw error ?? new Error('Demande de participation impossible.');
    return mapParticipantRow(data as DbOrderParticipant);
  }

  const { data, error } = await client
    .from('order_participants')
    .insert({
      order_id: orderId,
      profile_id: profileId,
      participation_status: status,
      request_message: message ?? null,
      requested_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('Demande de participation impossible.');
  return mapParticipantRow(data as DbOrderParticipant);
};

export const approveParticipation = async (participantId: string) => {
  const client = getClient();
  const { data, error } = await client
    .from('order_participants')
    .update({ participation_status: 'accepted', reviewed_at: new Date().toISOString() })
    .eq('id', participantId)
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('Validation participation impossible.');
  return mapParticipantRow(data as DbOrderParticipant);
};

export const rejectParticipation = async (participantId: string) => {
  const client = getClient();
  const { data, error } = await client
    .from('order_participants')
    .update({ participation_status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', participantId)
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('Refus participation impossible.');
  return mapParticipantRow(data as DbOrderParticipant);
};

export const setParticipantPickupSlot = async (params: {
  orderId: string;
  participantId: string;
  pickupSlotId: string;
}) => {
  const client = getClient();
  const order = await client.from('orders').select('auto_approve_pickup_slots').eq('id', params.orderId).maybeSingle();
  if (order.error || !order.data) throw order.error ?? new Error('Commande introuvable.');
  const autoApprove = Boolean(order.data.auto_approve_pickup_slots);
  const updatePayload = {
    pickup_slot_id: params.pickupSlotId,
    pickup_slot_status: autoApprove ? 'accepted' : 'requested',
    pickup_slot_requested_at: new Date().toISOString(),
  };
  const { data, error } = await client
    .from('order_participants')
    .update(updatePayload)
    .eq('id', params.participantId)
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('Mise a jour du creneau impossible.');
  return mapParticipantRow(data as DbOrderParticipant);
};

export const addItem = async (params: {
  orderId: string;
  participantId: string;
  productId: string;
  lotId?: string | null;
  quantityUnits: number;
}) => {
  const client = getClient();
  const [
    { data: orderRow, error: orderError },
    { data: orderProductRow, error: orderProductError },
    { data: productRow, error: productError },
    { data: existingItems, error: itemsError },
  ] = await Promise.all([
    client.from('orders').select('*').eq('id', params.orderId).maybeSingle(),
    client
      .from('order_products')
      .select('*')
      .eq('order_id', params.orderId)
      .eq('product_id', params.productId)
      .maybeSingle(),
    client.from('v_products_listing').select('*').eq('product_id', params.productId).maybeSingle(),
    client.from('order_items').select('lot_id').eq('order_id', params.orderId).eq('product_id', params.productId),
  ]);
  if (orderError || !orderRow) throw orderError ?? new Error('Commande introuvable.');
  if (orderProductError || !orderProductRow) {
    throw orderProductError ?? new Error('Produit non propose pour cette commande.');
  }
  if (productError || !productRow) throw productError ?? new Error('Produit introuvable.');
  if (itemsError) throw itemsError;

  const orderProduct = orderProductRow as DbOrderProduct;
  const existingLotIds = ((existingItems as Array<{ lot_id: string | null }>) ?? [])
    .map((item) => item.lot_id)
    .filter(Boolean) as string[];
  const hasNullLot = ((existingItems as Array<{ lot_id: string | null }>) ?? []).some((item) => !item.lot_id);
  const existingLotId = existingLotIds.length ? existingLotIds[0] : null;
  const distinctLotIds = new Set(existingLotIds);
  if (distinctLotIds.size > 1) {
    throw new Error('Plusieurs lots detectes pour ce produit dans la commande.');
  }
  if (existingLotId && hasNullLot) {
    throw new Error('Lot incoherent pour ce produit dans la commande.');
  }
  if (existingLotId && params.lotId && params.lotId !== existingLotId) {
    throw new Error('Un seul lot est autorise pour ce produit dans la commande.');
  }
  if (!existingLotId && params.lotId && hasNullLot) {
    throw new Error('Ce produit contient deja des lignes sans lot. Fixez un seul lot pour toute la commande.');
  }
  const resolvedLotId = params.lotId ?? existingLotId ?? null;

  const unitWeightKg =
    orderProduct.unit_weight_kg ??
    resolveUnitWeightKg(productRow.sale_unit, productRow.unit_weight_kg, productRow.packaging);
  const unitBasePriceCents = orderProduct.unit_base_price_cents;
  const unitDeliveryCents = orderProduct.unit_delivery_cents;
  const unitSharerFeeCents = orderProduct.unit_sharer_fee_cents;
  const unitFinalPriceCents = orderProduct.unit_final_price_cents;
  const lineTotalCents = unitFinalPriceCents * params.quantityUnits;
  const lineWeightKg = unitWeightKg * params.quantityUnits;

  const { data: itemRow, error: itemError } = await client
    .from('order_items')
    .insert({
      order_id: params.orderId,
      participant_id: params.participantId,
      product_id: params.productId,
      lot_id: resolvedLotId,
      quantity_units: params.quantityUnits,
      unit_label: orderProduct.unit_label ?? (productRow.sale_unit === 'kg' ? 'kg' : productRow.packaging),
      unit_weight_kg: unitWeightKg,
      unit_base_price_cents: unitBasePriceCents,
      unit_delivery_cents: unitDeliveryCents,
      unit_sharer_fee_cents: unitSharerFeeCents,
      unit_final_price_cents: unitFinalPriceCents,
      line_total_cents: lineTotalCents,
      line_weight_kg: lineWeightKg,
      is_sharer_share: false,
    })
    .select('*')
    .single();
  if (itemError || !itemRow) throw itemError ?? new Error('Impossible d\'ajouter la ligne.');

  if (resolvedLotId) {
    const reservationPayload = {
      lot_id: resolvedLotId,
      order_id: params.orderId,
      order_item_id: (itemRow as DbOrderItem).id,
      reserved_units: productRow.sale_unit === 'kg' ? null : params.quantityUnits,
      reserved_kg: productRow.sale_unit === 'kg' ? lineWeightKg : null,
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
    const { error: reservationError } = await client.from('lot_reservations').insert(reservationPayload);
    if (reservationError) throw reservationError;
  }

  await recomputeCaches(params.orderId, params.participantId);
  return mapItemRow(itemRow as DbOrderItem);
};

export const removeItem = async (orderItemId: string, orderId: string, participantId?: string) => {
  const client = getClient();
  const { error } = await client.from('order_items').delete().eq('id', orderItemId);
  if (error) throw error;
  await recomputeCaches(orderId, participantId);
};

export const recomputeCaches = async (orderId: string, participantId?: string) => {
  const client = getClient();
  const [{ data: orderRow, error: orderError }, { data: itemRows, error: itemsError }] = await Promise.all([
    client.from('orders').select('*').eq('id', orderId).maybeSingle(),
    client.from('order_items').select('*').eq('order_id', orderId),
  ]);
  if (orderError || !orderRow) throw orderError ?? new Error('Commande introuvable.');
  if (itemsError) throw itemsError;

  const order = mapOrderRow(orderRow as DbOrder);
  const items = (itemRows as DbOrderItem[]) ?? [];

  const totalsByParticipant = new Map<string, { weight: number; amount: number }>();
  let totalWeight = 0;
  let baseTotal = 0;
  let deliveryTotal = 0;
  let sharerTotal = 0;
  let participantTotal = 0;

  items.forEach((item) => {
    totalWeight += Number(item.line_weight_kg ?? 0);
    baseTotal += item.unit_base_price_cents * item.quantity_units;
    deliveryTotal += item.unit_delivery_cents * item.quantity_units;
    sharerTotal += item.unit_sharer_fee_cents * item.quantity_units;
    participantTotal += item.line_total_cents;

    const current = totalsByParticipant.get(item.participant_id) ?? { weight: 0, amount: 0 };
    current.weight += Number(item.line_weight_kg ?? 0);
    current.amount += item.line_total_cents;
    totalsByParticipant.set(item.participant_id, current);
  });

  const effectiveWeight = Math.max(totalWeight, order.minWeightKg);

  const { error: orderUpdateError } = await client
    .from('orders')
    .update({
      ordered_weight_kg: totalWeight,
      base_total_cents: baseTotal,
      delivery_fee_cents: deliveryTotal,
      participant_total_cents: participantTotal,
      sharer_share_cents: sharerTotal,
      effective_weight_kg: effectiveWeight,
    })
    .eq('id', orderId);
  if (orderUpdateError) throw orderUpdateError;

  if (totalsByParticipant.size > 0) {
    if (participantId) {
      const totals = totalsByParticipant.get(participantId);
      if (totals) {
        const { error: participantError } = await client
          .from('order_participants')
          .update({
            total_weight_kg: totals.weight,
            total_amount_cents: totals.amount,
          })
          .eq('id', participantId);
        if (participantError) throw participantError;
      }
    } else {
      const updates = Array.from(totalsByParticipant.entries()).map(([entryId, totals]) => ({
        id: entryId,
        total_weight_kg: totals.weight,
        total_amount_cents: totals.amount,
      }));
      const { error: participantError } = await client
        .from('order_participants')
        .upsert(updates, { onConflict: 'id' });
      if (participantError) throw participantError;
    }
  }
};

export const listOrdersForUser = async (profileId: string): Promise<GroupOrder[]> => {
  const client = getClient();
  const [{ data: ownOrders, error: ownError }, { data: participantRows, error: participantError }] = await Promise.all([
    client.from('orders').select('*').eq('sharer_profile_id', profileId),
    client
      .from('order_participants')
      .select('order_id')
      .eq('profile_id', profileId)
      .in('participation_status', ['accepted', 'requested']),
  ]);
  if (ownError) throw ownError;
  if (participantError) throw participantError;

  const orderIds = Array.from(
    new Set([
      ...(ownOrders ?? []).map((row) => (row as DbOrder).id),
      ...((participantRows ?? []) as Array<{ order_id: string }>).map((row) => row.order_id),
    ])
  );
  if (!orderIds.length) return [];

  const { data: orders, error: ordersError } = await client.from('orders').select('*').in('id', orderIds);
  if (ordersError) throw ordersError;

  return buildGroupOrdersFromRows(client, (orders as DbOrder[]) ?? []);
};

export const listPublicOrders = async (): Promise<GroupOrder[]> => {
  const client = getClient();
  const { data, error } = await client.from('orders').select('*').eq('visibility', 'public').eq('status', 'open');
  if (error) throw error;
  return buildGroupOrdersFromRows(client, (data as DbOrder[]) ?? []);
};

const buildGroupOrdersFromRows = async (client: SupabaseClient, rows: DbOrder[]): Promise<GroupOrder[]> => {
  if (!rows.length) return [];
  const orderIds = rows.map((row) => row.id);
  const { data: orderProductsRows, error: orderProductsError } = await client
    .from('order_products')
    .select('order_id, product_id, sort_order')
    .in('order_id', orderIds);
  if (orderProductsError) throw orderProductsError;

  const orderProducts = (orderProductsRows as Array<{
    order_id: string;
    product_id: string;
    sort_order: number | null;
  }>) ?? [];

  const orderProductMap = new Map<
    string,
    Array<{ productId: string; sortOrder: number | null }>
  >();
  orderProducts.forEach((row) => {
    const list = orderProductMap.get(row.order_id) ?? [];
    list.push({ productId: row.product_id, sortOrder: row.sort_order });
    orderProductMap.set(row.order_id, list);
  });

  const productIds = Array.from(new Set(orderProducts.map((row) => row.product_id)));
  const productRows = await fetchProductsByIds(client, productIds);
  const productMap = new Map<string, Product>();
  productRows.forEach((row) => {
    const product = mapProductListingToProduct(row, client);
    productMap.set(row.product_id, product);
  });

  const profileIds = Array.from(new Set(rows.flatMap((row) => [row.sharer_profile_id, row.producer_profile_id])));
  const profiles = await fetchProfilesByIds(client, profileIds);
  const profileMap = new Map<string, { name?: string | null }>();
  profiles.forEach((profile) => {
    profileMap.set(profile.id as string, { name: (profile.name as string | null) ?? null });
  });

  return rows.map((row) => {
    const order = mapOrderRow(row);
    const orderProductsForRow = (orderProductMap.get(row.id) ?? [])
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const products = orderProductsForRow
      .map((entry) => productMap.get(entry.productId))
      .filter(Boolean) as Product[];
    const sharerName = profileMap.get(row.sharer_profile_id)?.name ?? 'Partageur';
    const producerName = profileMap.get(row.producer_profile_id)?.name ?? products[0]?.producerName ?? 'Producteur';
    const mapLat = order.pickupLat ?? order.deliveryLat ?? null;
    const mapLng = order.pickupLng ?? order.deliveryLng ?? null;
    const areaLabel = [order.pickupPostcode ?? order.deliveryPostcode, order.pickupCity ?? order.deliveryCity]
      .filter(Boolean)
      .join(' ');
    const mapLocation =
      Number.isFinite(mapLat ?? NaN) && Number.isFinite(mapLng ?? NaN)
        ? {
            lat: mapLat as number,
            lng: mapLng as number,
            radiusMeters: 500,
            areaLabel: areaLabel || order.pickupAddress || order.deliveryAddress || 'Commande locale',
          }
        : undefined;
    return {
      id: order.id,
      orderCode: order.orderCode,
      title: order.title,
      sharerId: order.sharerProfileId,
      sharerName,
      products,
      producerId: order.producerProfileId,
      producerName,
      sharerPercentage: order.sharerPercentage,
      sharerQuantities: order.sharerQuantities,
      minWeight: order.minWeightKg,
      maxWeight: order.maxWeightKg ?? 0,
      orderedWeight: order.orderedWeightKg,
      estimatedDeliveryDate: order.estimatedDeliveryDate ?? undefined,
      pickupWindowWeeks: order.pickupWindowWeeks ?? undefined,
      deadline: order.deadline ?? new Date(),
      pickupStreet: order.pickupStreet ?? undefined,
      pickupCity: order.pickupCity ?? undefined,
      pickupPostcode: order.pickupPostcode ?? undefined,
      pickupAddress: order.pickupAddress ?? '',
      message: order.message ?? '',
      status: (order.status === 'completed' ? 'completed' : order.status === 'open' ? 'open' : 'closed') as GroupOrder['status'],
      visibility: order.visibility,
      autoApproveParticipationRequests: order.autoApproveParticipationRequests,
      allowSharerMessages: order.allowSharerMessages,
      autoApprovePickupSlots: order.autoApprovePickupSlots,
      totalValue: centsToEuros(order.participantTotalCents),
      participants: 0,
      pickupSlots: [],
      pickupDeliveryFee: centsToEuros(order.pickupDeliveryFeeCents),
      mapLocation,
    };
  });
};

export const createPaymentStub = async (params: {
  orderId: string;
  participantId: string;
  amountCents: number;
  status?: Payment['status'];
  provider?: string;
}) => {
  const client = getClient();
  const { data, error } = await client
    .from('payments')
    .insert({
      order_id: params.orderId,
      participant_id: params.participantId,
      amount_cents: params.amountCents,
      status: params.status ?? 'pending',
      provider: params.provider ?? 'stancer',
    })
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('Paiement impossible.');
  return mapPaymentRow(data as DbPayment);
};

export const getParticipantByProfile = async (orderId: string, profileId: string): Promise<OrderParticipant | null> => {
  const client = getClient();
  const { data, error } = await client
    .from('order_participants')
    .select('*')
    .eq('order_id', orderId)
    .eq('profile_id', profileId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapParticipantRow(data as DbOrderParticipant);
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const client = getClient();
  const { error } = await client.from('orders').update({ status }).eq('id', orderId);
  if (error) throw error;
};

export const updateOrderVisibility = async (orderId: string, visibility: 'public' | 'private') => {
  const client = getClient();
  const { error } = await client.from('orders').update({ visibility }).eq('id', orderId);
  if (error) throw error;
};

export const updateOrderParticipantSettings = async (
  orderId: string,
  updates: {
    autoApproveParticipationRequests?: boolean;
    allowSharerMessages?: boolean;
    autoApprovePickupSlots?: boolean;
  }
) => {
  const client = getClient();
  const { error } = await client
    .from('orders')
    .update({
      auto_approve_participation_requests: updates.autoApproveParticipationRequests,
      allow_sharer_messages: updates.allowSharerMessages,
      auto_approve_pickup_slots: updates.autoApprovePickupSlots,
    })
    .eq('id', orderId);
  if (error) throw error;
};

export const updatePickupSlotEnabled = async (slotId: string, enabled: boolean) => {
  const client = getClient();
  const { error } = await client.from('order_pickup_slots').update({ enabled }).eq('id', slotId);
  if (error) throw error;
};

export const updateParticipantsVisibility = async (
  orderId: string,
  participantsVisibility: ParticipantVisibility
) => {
  const client = getClient();
  const { error } = await client
    .from('orders')
    .update({ participants_visibility: participantsVisibility })
    .eq('id', orderId);
  if (error) throw error;
};
