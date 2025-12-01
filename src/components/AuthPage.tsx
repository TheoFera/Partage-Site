import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { Mail, Lock, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from './Logo';

type AuthMode = 'login' | 'signup';

interface AuthPageProps {
  supabaseClient: SupabaseClient | null;
  onAuthSuccess: (user: SupabaseAuthUser) => void;
  onDemoLogin: () => void;
}

export function AuthPage({ supabaseClient, onAuthSuccess, onDemoLogin }: AuthPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as { redirectTo?: string; mode?: AuthMode } | null;
  const [mode, setMode] = React.useState<AuthMode>(locationState?.mode ?? 'login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const redirectTo = locationState?.redirectTo || '/';
  const supabaseIsReady = Boolean(supabaseClient);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabaseClient) {
      toast.error('Supabase n est pas configure. Utilisez le mode demo pour tester.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          onAuthSuccess(data.user);
          toast.success('Connexion reussie');
          navigate(redirectTo, { replace: true });
        } else {
          toast.info('Verifiez vos emails pour confirmer votre connexion.');
        }
      } else {
        const displayName = fullName.trim() || email.trim().split('@')[0] || 'Utilisateur';
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: displayName,
              role: 'sharer',
            },
          },
        });
        if (error) throw error;
        const newUser = data.user ?? data.session?.user;
        if (newUser) {
          onAuthSuccess(newUser);
          toast.success('Compte cree et connecte');
          navigate(redirectTo, { replace: true });
        } else {
          toast.success('Compte cree. Consultez vos emails pour activer votre acces.');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de terminer la demande.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    onDemoLogin();
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 bg-white border border-[#FFE0D1] rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-10 bg-white text-[#1F2937] flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-8">
            <Logo />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Rejoignez la communauté des partageurs
            </h1>
            <p className="text-base text-[#4B5563] leading-relaxed">
              Connectez-vous pour travailler en direct avec des producteurs ou vous procurer des produits auprès des
              partageurs de votre quartier.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">{mode === 'login' ? '' : ''}</p>
              <h2 className="text-2xl font-semibold text-[#1F2937]">
                {mode === 'login' ? 'Connexion' : 'Creer un compte'}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm text-[#374151] font-semibold">Nom complet ou d'entreprise</label>
                <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white focus-within:border-[#FF6B4A] transition-colors">
                  <UserPlus className="w-5 h-5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Emma Martin"
                    className="flex-1 outline-none text-[#1F2937]"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-[#374151] font-semibold">Email</label>
              <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white focus-within:border-[#FF6B4A] transition-colors">
                <Mail className="w-5 h-5 text-[#9CA3AF]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.fr"
                  className="flex-1 outline-none text-[#1F2937]"
                  autoComplete={mode === 'login' ? 'email' : 'new-email'}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#374151] font-semibold">Mot de passe</label>
              <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white focus-within:border-[#FF6B4A] transition-colors">
                <Lock className="w-5 h-5 text-[#9CA3AF]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caracteres"
                  className="flex-1 outline-none text-[#1F2937]"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FF6B4A] text-white font-semibold shadow-md hover:bg-[#FF5A39] transition-colors disabled:opacity-60"
            >
              {loading ? 'Traitement...' : mode === 'login' ? 'Se connecter' : 'Créer et continuer'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6B7280]">
              {mode === 'login' ? 'Pas encore de compte ?' : 'Deja inscrit ?'}
            </span>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm text-[#FF6B4A] font-semibold hover:text-[#FF5A39]"
            >
              {mode === 'login' ? 'Creer un compte' : 'Se connecter'}
            </button>
          </div>

          <div className="pt-4 border-t border-dashed border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6B7280]">Envie de tester sans compte ?</p>
              <button
                onClick={handleDemo}
                className="text-sm font-semibold text-[#1F2937] px-3 py-2 rounded-lg border border-gray-200 hover:border-[#FF6B4A] hover:text-[#FF6B4A] transition-colors"
              >
                Mode demo
              </button>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Le mode demo utilise des donnees fictives (aucune sauvegarde). Pour conserver vos réglages,
              créez un compte gratuit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
