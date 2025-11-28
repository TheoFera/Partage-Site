import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, MapPin, Users, X } from 'lucide-react';
import { DeckCard, GroupOrder, Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

const defaultIcon = L.icon({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const defaultCenter = { lat: 48.8566, lng: 2.3522 };

type MapOrderPoint = {
  id: string;
  title: string;
  sharerName: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  areaLabel: string;
  products: Product[];
};

interface MapViewProps {
  orders: GroupOrder[];
  deck: DeckCard[];
  onRemoveFromDeck: (productId: string) => void;
  locationLabel: string;
  userRole: 'producer' | 'sharer' | 'client';
}

function computeCenter(points: MapOrderPoint[]) {
  if (!points.length) return defaultCenter;
  const sum = points.reduce(
    (acc, point) => {
      acc.lat += point.lat;
      acc.lng += point.lng;
      return acc;
    },
    { lat: 0, lng: 0 }
  );
  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPrice(value: number) {
  return `${value.toFixed(2)} €`;
}

function formatRadius(radiusMeters: number) {
  if (radiusMeters >= 1000) {
    return `${(radiusMeters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(radiusMeters)} m`;
}

function buildPopupContent(point: MapOrderPoint) {
  const productsHtml = point.products.slice(0, 3).map((product) => {
    const name = escapeHtml(product.name);
    const producer = escapeHtml(product.producerName);
    const price = formatPrice(product.price);
    return `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
        <div style="width:38px;height:38px;border-radius:8px;overflow:hidden;background:#f3f4f6;">
          <img src="${product.imageUrl}" alt="${name}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div style="min-width:0;">
          <div style="font-weight:600;color:#111827;font-size:12px;line-height:16px;">${name}</div>
          <div style="color:#6B7280;font-size:11px;line-height:14px;">${producer}</div>
          <div style="color:#FF6B4A;font-size:11px;line-height:14px;">${price}</div>
        </div>
      </div>
    `;
  });

  const moreCount = point.products.length - productsHtml.length;
  const moreHtml =
    moreCount > 0
      ? `<div style="color:#6B7280;font-size:12px;margin-top:4px;">+${moreCount} autre(s) produit(s)</div>`
      : '';

  const title = escapeHtml(point.title);
  const sharer = escapeHtml(point.sharerName);
  const area = escapeHtml(point.areaLabel);

  return `
    <div style="min-width:220px;font-family:Inter,ui-sans-serif,sans-serif;">
      <div style="font-weight:700;color:#111827;font-size:14px;margin-bottom:4px;">${title}</div>
      <div style="color:#6B7280;font-size:12px;margin-bottom:4px;">${sharer} · ${area}</div>
      <div style="color:#111827;font-size:12px;margin-bottom:6px;">Lieu précis communiqué après paiement</div>
      <div style="border-top:1px solid #E5E7EB;padding-top:6px;margin-top:4px;">
        ${productsHtml.join('')}
        ${moreHtml}
      </div>
    </div>
  `;
}

export function MapView({ orders, deck, onRemoveFromDeck, locationLabel, userRole }: MapViewProps) {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const layersRef = React.useRef<L.LayerGroup | null>(null);

  const mapOrders = React.useMemo<MapOrderPoint[]>(() => {
    return orders
      .filter((order) => order.visibility === 'public' && order.status === 'open' && order.mapLocation)
      .map((order) => ({
        id: order.id,
        title: order.title,
        sharerName: order.sharerName,
        lat: order.mapLocation!.lat,
        lng: order.mapLocation!.lng,
        radiusMeters: order.mapLocation!.radiusMeters,
        areaLabel: order.mapLocation!.areaLabel,
        products: order.products,
      }));
  }, [orders]);

  const mapCenter = React.useMemo(() => computeCenter(mapOrders), [mapOrders]);
  const deckLabel = 'Votre sélection';
  const paymentLabel =
    userRole === 'producer'
      ? 'Adresse partageur après paiement'
      : 'Lieu exact après paiement';

  React.useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        worldCopyJump: true,
      }).setView([mapCenter.lat, mapCenter.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    if (!layersRef.current) {
      layersRef.current = L.layerGroup().addTo(mapRef.current);
    }

    layersRef.current.clearLayers();

    mapOrders.forEach((point) => {
      const latLng: [number, number] = [point.lat, point.lng];

      const circle = L.circle(latLng, {
        radius: point.radiusMeters,
        color: '#FF6B4A',
        weight: 1.5,
        fillColor: '#FF6B4A',
        fillOpacity: 0.14,
      });

      const marker = L.marker(latLng, {
        title: point.title,
      }).bindPopup(buildPopupContent(point));

      layersRef.current?.addLayer(circle);
      layersRef.current?.addLayer(marker);
    });

    if (mapRef.current && mapOrders.length) {
      const bounds = L.latLngBounds(mapOrders.map((point) => [point.lat, point.lng] as [number, number]));
      mapRef.current.fitBounds(bounds.pad(0.3));
    } else {
      mapRef.current?.setView([mapCenter.lat, mapCenter.lng], 13);
    }

    setTimeout(() => mapRef.current?.invalidateSize(), 150);

    return () => {
      layersRef.current?.clearLayers();
    };
  }, [mapOrders, mapCenter.lat, mapCenter.lng]);

  React.useEffect(
    () => () => {
      mapRef.current?.remove();
    },
    []
  );

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <p className="text-xs text-[#6B7280]">Carte des partageurs</p>
            <h3 className="text-[#1F2937] text-lg font-semibold">Autour de {locationLabel}</h3>
            <p className="text-xs text-[#9CA3AF]">
              1 point par commande publique · lieu précis après paiement
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280] flex-wrap">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A]">
              <Compass className="w-4 h-4" /> Position approximative
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F3F4F6] text-[#1F2937]">
              <Users className="w-4 h-4" /> {mapOrders.length} commande(s)
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#0F172A] text-white">
              <MapPin className="w-4 h-4" /> {paymentLabel}
            </span>
          </div>
        </div>

        <div
          className="relative w-full rounded-2xl overflow-hidden border border-gray-100"
          style={{ height: '320px' }}
        >
          <div ref={mapContainerRef} className="h-full w-full" />
          <div className="pointer-events-none absolute left-4 bottom-4 px-4 py-2 rounded-full bg-white/90 border border-gray-200 text-xs text-[#1F2937] shadow-sm">
            Commandes publiques : zones approximatives
          </div>
        </div>
        {mapOrders.length === 0 && (
          <p className="mt-3 text-sm text-[#6B7280]">
            Aucune commande publique n&rsquo;est disponible pour le moment.
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {mapOrders.map((point) => (
            <div key={point.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FFD166]/40 text-[#1F2937] flex items-center justify-center font-semibold">
                    {point.sharerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[#1F2937] font-semibold">{point.title}</p>
                    <p className="text-sm text-[#6B7280]">
                      {point.sharerName} · {point.areaLabel}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      Zone partagée : {formatRadius(point.radiusMeters)} · lieu précis après paiement
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-[#F3F4F6] text-[#1F2937] border border-gray-200">
                    {point.products.length} produit(s)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {point.products.map((product) => (
                  <div key={product.id} className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                    <div className="aspect-square">
                      <ImageWithFallback
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2 space-y-1">
                      <p className="text-sm text-[#1F2937] truncate">{product.name}</p>
                      <p className="text-xs text-[#6B7280] truncate">{product.producerName}</p>
                      <p className="text-xs text-[#FF6B4A] font-semibold">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-[#6B7280]">{deckLabel}</p>
                <p className="text-[#1F2937] font-semibold">Gestion rapide</p>
              </div>
              <MapPin className="w-5 h-5 text-[#FF6B4A]" />
            </div>
            {deck.length === 0 ? (
              <p className="text-sm text-[#6B7280]">
                Ajoutez des produits depuis le feed ou le swipe pour les retrouver ici.
              </p>
            ) : (
              <div className="space-y-3">
                {deck.map((card) => (
                  <div key={card.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                      <ImageWithFallback
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1F2937] truncate">{card.name}</p>
                      <p className="text-xs text-[#6B7280] truncate">
                        {card.producerName} - {card.producerLocation}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveFromDeck(card.id)}
                      className="w-8 h-8 rounded-full bg-gray-100 text-[#6B7280] hover:bg-gray-200 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
