import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function Filters() {
  const {
    categoryFilter,
    setCategoryFilter,
    saleTypeFilter,
    setSaleTypeFilter,
    maxDistance,
    setMaxDistance,
  } = useStore();

  const categories = [
    { value: 'all', label: 'Tous' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'legumes', label: 'Légumes' },
    { value: 'viandes', label: 'Viandes' },
    { value: 'fromages', label: 'Fromages' },
    { value: 'epicerie', label: 'Épicerie' },
  ];

  const saleTypes = [
    { value: 'all', label: 'Tout' },
    { value: 'retrait-ferme', label: 'Retrait ferme' },
    { value: 'point-relais', label: 'Point relais' },
    { value: 'livraison', label: 'Livraison' },
  ];

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card space-y-6 sticky top-20">
      <h3>Filtres</h3>

      {/* Categories */}
      <div className="space-y-3">
        <Label>Catégorie</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={categoryFilter === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat.value)}
              className={
                categoryFilter === cat.value
                  ? 'bg-[#FF6B4A] hover:bg-[#FF6B4A]/90'
                  : ''
              }
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Sale Types */}
      <div className="space-y-3">
        <Label>Mode de vente</Label>
        <div className="flex flex-wrap gap-2">
          {saleTypes.map((type) => (
            <Button
              key={type.value}
              variant={saleTypeFilter === type.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSaleTypeFilter(type.value)}
              className={
                saleTypeFilter === type.value
                  ? 'bg-[#28C1A5] hover:bg-[#28C1A5]/90'
                  : ''
              }
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Distance */}
      <div className="space-y-3">
        <Label htmlFor="distance">Distance maximale</Label>
        <div className="flex items-center gap-3">
          <Input
            id="distance"
            type="number"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="flex-1"
            min="1"
            max="100"
          />
          <span className="text-muted-foreground">km</span>
        </div>
        <p className="text-xs text-muted-foreground">
          autour de ma position
        </p>
      </div>
    </div>
  );
}
