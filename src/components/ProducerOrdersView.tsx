import React from 'react';
import { GroupOrder } from '../types';
import { CalendarClock, Users, MapPin } from 'lucide-react';

interface ProducerOrdersViewProps {
  orders: GroupOrder[];
}

const statusLabels: Record<GroupOrder['status'], string> = {
  open: 'Ouverte',
  closed: 'Fermée',
  completed: 'Terminée',
};

export function ProducerOrdersView({ orders }: ProducerOrdersViewProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center space-y-2">
        <p className="text-sm text-[#6B7280]">Vous n'avez pas encore de commandes actives.</p>
        <p className="text-sm text-[#FF6B4A]">Les partageurs pourront les créer dès qu'ils auront sélectionné vos produits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#1F2937] font-semibold">{order.title}</h3>
              <p className="text-xs text-[#6B7280]">
                Commande initiée par {order.sharerName} · {order.products.length} produit
                {order.products.length > 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full border border-[#FF6B4A]/40 text-[#FF6B4A]">
              {statusLabels[order.status]}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-[#6B7280]">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{order.participants} participant{order.participants > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarClock className="w-3 h-3" />
              <span>
                {order.deadline.toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-1 text-sm text-[#6B7280]">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>{order.pickupAddress}</span>
            </div>
            <p className="text-sm text-[#1F2937]">{order.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
