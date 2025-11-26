import React from 'react';
import { User } from '../types';
import { MapPin, Shield, Briefcase, Edit2 } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (user: Partial<User>) => void;
}

export function ProfileView({ user, onUpdateUser }: ProfileViewProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(user.name);
  const [address, setAddress] = React.useState(user.address || '');
  const [role, setRole] = React.useState<'producer' | 'sharer' | 'client'>(user.role);

  const handleSave = () => {
    onUpdateUser({ name, address, role });
    setIsEditing(false);
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'producer':
        return 'Producteur';
      case 'sharer':
        return 'Partageur';
      case 'client':
        return 'Client';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full gradient-card flex items-center justify-center text-white text-2xl">
              {user.name.charAt(0)}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xl px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
                />
              ) : (
                <h2 className="text-[#1F2937]">{user.name}</h2>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-[#FF6B4A]/10 text-[#FF6B4A] text-sm rounded-full">
                  {getRoleName(role)}
                </span>
                {user.verified && (
                  <span className="px-3 py-1 bg-[#28C1A5]/10 text-[#28C1A5] text-sm rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Vérifié
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {isEditing && (
          <div className="mb-6">
            <label className="block text-sm text-[#6B7280] mb-2">Type de compte</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`py-2 px-4 rounded-lg border-2 transition-colors ${
                  role === 'client'
                    ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-[#FF6B4A]'
                    : 'border-gray-200 text-[#6B7280] hover:border-[#FFD166]'
                }`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setRole('sharer')}
                className={`py-2 px-4 rounded-lg border-2 transition-colors ${
                  role === 'sharer'
                    ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-[#FF6B4A]'
                    : 'border-gray-200 text-[#6B7280] hover:border-[#FFD166]'
                }`}
              >
                Partageur
              </button>
              <button
                type="button"
                onClick={() => setRole('producer')}
                className={`py-2 px-4 rounded-lg border-2 transition-colors ${
                  role === 'producer'
                    ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-[#FF6B4A]'
                    : 'border-gray-200 text-[#6B7280] hover:border-[#FFD166]'
                }`}
              >
                Producteur
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-2">
              <MapPin className="w-4 h-4" />
              <span>Adresse {role === 'sharer' && '(obligatoire pour partageur)'}</span>
            </div>
            {isEditing ? (
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Entrez votre adresse complète"
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A] resize-none"
              />
            ) : (
              <p className="text-[#1F2937] pl-6">{user.address || 'Aucune adresse renseignée'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <Shield className="w-5 h-5 text-[#28C1A5] mt-1" />
          <div>
            <h3 className="text-[#1F2937] mb-1">Vérification d'identité</h3>
            <p className="text-sm text-[#6B7280]">
              {user.verified
                ? 'Votre identité a été vérifiée.'
                : 'Vérifiez votre identité pour rassurer vos amis ou voisins sur vos commandes groupées.'}
            </p>
          </div>
        </div>
        {!user.verified && (
          <button className="w-full py-2 bg-[#28C1A5] text-white rounded-lg hover:bg-[#23A88F] transition-colors">
            Vérifier mon identité
          </button>
        )}
      </div>

      {role === 'sharer' && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <Briefcase className="w-5 h-5 text-[#FFD166] mt-1" />
            <div>
              <h3 className="text-[#1F2937] mb-1">Statut entreprise</h3>
              <p className="text-sm text-[#6B7280]">
                Enregistrez votre statut d'entreprise pour recevoir une rémunération financière au lieu de produits
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Numéro SIRET"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]"
            />
            <button className="w-full py-2 bg-[#FFD166] text-[#1F2937] rounded-lg hover:bg-[#FFC64D] transition-colors">
              Enregistrer mon entreprise
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-[#1F2937] mb-4">Mes statistiques</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl text-[#FF6B4A]" style={{ fontWeight: 600 }}>
              12
            </p>
            <p className="text-sm text-[#6B7280]">Commandes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-[#28C1A5]" style={{ fontWeight: 600 }}>
              8
            </p>
            <p className="text-sm text-[#6B7280]">Partagées</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-[#FFD166]" style={{ fontWeight: 600 }}>
              4.8
            </p>
            <p className="text-sm text-[#6B7280]">Note</p>
          </div>
        </div>
      </div>
    </div>
  );
}
