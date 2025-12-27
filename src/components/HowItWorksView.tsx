import React from 'react';
import { Link } from 'react-router-dom';
import { Link as LinkIcon, Award, Scale, Handshake, Search } from 'lucide-react';
import './InfoPages.css';
import './HowItWorksView.css';

type CtaVariant = 'primary' | 'secondary' | 'ghost';

const CtaLink = ({
  to,
  variant,
  children,
}: {
  to: string;
  variant: CtaVariant;
  children: React.ReactNode;
}) => (
  <Link className={`how-button how-button--${variant}`} to={to}>
    {children}
  </Link>
);

const scrollToSection = (targetId: string) => {
  if (typeof document === 'undefined') return;
  const target = document.getElementById(targetId);
  if (!target) return;
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
};

export function HowItWorksView() {
  return (
    <div className="info-page how-page">
      <div className="info-page__nav">
        <Link to="/" className="info-page__back">
          ← Retour
        </Link>
        <Link to="/qui-sommes-nous" className="info-page__back info-page__switch">
          Qui sommes-nous ? →
        </Link>
      </div>

      <section className="how-hero">

        

        <div className="how-hero__content">
          <h1 className="how-hero__title">Comment ça fonctionne ?</h1>
          <p className="how-hero__subtitle">
            Tu trouves une commande de produits qui t'intéresse, tu cliques sur participer. Quand le partageur est livré, tu viens récupérer ta commande.
            S'approvisionner directement auprès des producteurs n'a jamais été aussi simple.
          </p>
        </div>

        <div className="how-hero__badges">
          <span className="how-badge">
            <LinkIcon className="how-badge__icon" aria-hidden="true" />
            Circuits-courts
          </span>
          <span className="how-badge">
            <Award className="how-badge__icon" aria-hidden="true" />
            Produits de qualité
          </span>
          <span className="how-badge">
            <Scale className="how-badge__icon" aria-hidden="true" />
            Juste rémunération
          </span>
          <span className="how-badge">
            <Handshake className="how-badge__icon" aria-hidden="true" />
            Coopération
          </span>
          <span className="how-badge">
            <Search className="how-badge__icon" aria-hidden="true" />
            Transparence
          </span>
        </div>

        <div className="how-anchor-card">
          <h2 className="how-anchor-title">Je souhaite... ?</h2>

          <div className="how-anchor-buttons">
            <button
            type="button"
            className="how-anchor-button"
            onClick={() => scrollToSection('participant')}
            aria-controls="participant"
            >
            Participer à des commandes groupées en direct des producteurs
            </button>
            <button
            type="button"
            className="how-anchor-button"
            onClick={() => scrollToSection('partageur')}
            aria-controls="partageur"
            >
            Créer des commandes groupées à partager autour de moi et recevoir en échange une part
            </button>
            <button
            type="button"
            className="how-anchor-button"
            onClick={() => scrollToSection('producteur')}
            aria-controls="producteur"
            >
            Rendre mes produits accessibles via la plateforme
            </button>
          </div>
        </div>
      </section>

      <section id="participant" className="how-section how-anchor-target">
        <h2>Comment participer à une commande ?</h2>

        <div className="how-section__content">
          <article className="how-card">
            <h3 className="how-card__title">1) Je cherche des produits qui m'intéressent</h3>
            <p className="how-card__text">
              Via l'onglet{' '}
              <Link to="/" className="how-inline-link">
                Produits
              </Link>
              ,{' '}
              <Link to="/carte" className="how-inline-link">
                Cartes
              </Link>{' '}
              ou{' '}
              <Link to="/decouvrir" className="how-inline-link">
                Découvrir
              </Link>{' '}
              je repère des commandes autours de chez moi.
            </p>
          </article>

          <div className="how-grid how-grid--two">
            <article className="how-card">
              <h3 className="how-card__title">2) Sur la commande qui m'intéresse, je clique sur « Participer »</h3>
              <img
                className="how-card__image"
                src={`${import.meta.env.BASE_URL}clicparticiper.png`}
                alt="Capture d'ecran du bouton Participer"
                loading="lazy"
              />
              <p className="how-card__text">
                Je sélectionne les quantités souhaitées, puis je procéde au réglement.
              </p>
            </article>
            <article className="how-card">
              <h3 className="how-card__title">Et si je ne trouve pas de commande qui me corresponde ?</h3>
              <p className="how-card__text">
                Vous pouvez la créer vous même !
              </p>
              <button
                type="button"
                className="how-anchor-button"
                onClick={() => scrollToSection('partageur')}
                aria-controls="partageur"
              >
                Je crée une commande et deviens un partageur
            </button>
            </article>
          </div>

          <article className="how-card">
            <h3 className="how-card__title">3) Je partage la commande autour de moi et j'attends qu'elle soit cloturée</h3>
            <p className="how-card__text">
              Plus le nombre de participants est important moins je paierai cher car les frais de livraison seront divisés.
            </p>
            <p className="how-card__text">
              La différence entre ce que j'ai payé et ce que je dois me sera reversé en « gains de coopération »
              que je pourrai utiliser pour une prochaine commande.
            </p>
            <section className="how-closure">
              <h3 className="how-card__title">Quand est-ce que la commande est clôturée ?</h3>
              <ul className="how-closure__list">
                <li className="how-closure__item">
                  <span className="how-closure__dot" aria-hidden="true" />
                  <span>Si le seuil maximum est atteint : la commande se clôture tout de suite.</span>
                </li>
                <li className="how-closure__item">
                  <span className="how-closure__dot" aria-hidden="true" />
                  <span>
                    Sinon, à la date de clôture : la commande se valide si le seuil minimum est atteint.
                  </span>
                </li>
                <li className="how-closure__item">
                  <span className="how-closure__dot" aria-hidden="true" />
                  <span>
                    Si le seuil minimum n’est pas atteint : la commande ne part pas et les participants sont remboursés
                  </span>
                </li>
              </ul>
            </section>
          </article>

          <article className="how-card">
            <h3 className="how-card__title">4) Je reçois une notification lorsque les produits ont été réceptionnés</h3>
            <p className="how-card__text">
              Je réserve un créneau qui me convient sur la plage de disponibilité du partageur .
            </p>
          </article>

          <article className="how-card">
            <h3 className="how-card__title">5) Je récupère ma commande</h3>
            <p className="how-card__text">
              Je peux alors scanner le QR Code sur mes produits 
            </p>
          </article>
        </div>
        <div className="how-section__actions">
          <CtaLink to="/carte" variant="primary">
            Voir les commandes autour de moi
          </CtaLink>
        </div>
      </section>

      

      <section id="partageur" className="how-section how-anchor-target">
        <h2>Je crée une commande</h2>
        <p className="how-section__intro">
          Le partageur crée la commande, réceptionne les produits et sert de points relais pour que
          les participants viennent chercher leur produit.
          En échange il obtient gratuitement une part de la commande qu'il peut librement définir.
        </p>
        <p className="how-section__intro">
          Pour devenir partageur, il faut que votre compte soit « vérifié ».
        </p>
        <div className="how-grid how-grid--three">
          <article className="how-card">
            <h3 className="how-card__title">1) J’ouvre une commande près de chez moi</h3>
            <p className="how-card__text">
              Je propose une commande locale en choisissant un producteur et en rendant ses
              produits commandables.
            </p>
          </article>
          <article className="how-card">
            <h3 className="how-card__title">2) Je fixe le retrait</h3>
            <p className="how-card__text">
              Je définis un lieu de retrait et une plage de disponibilité (ou une date). Les
              participants prennent rendez-vous sur cette plage.
            </p>
          </article>
          <article className="how-card">
            <h3 className="how-card__title">3) Je choisis l’acheminement avec le groupe</h3>
            <p className="how-card__text">
              Selon la commande : expédition Chronofresh gérée par le site, livraison si proposée,
              ou collecte chez le producteur.
            </p>
          </article>
        </div>
        <div className="how-section__actions">
          <CtaLink to="/profil" variant="primary">
            Devenir partageur
          </CtaLink>
          <CtaLink to="/commande/nouvelle" variant="secondary">
            Créer une commande
          </CtaLink>
        </div>

        <h2>Comment les produits arrivent</h2>
        <p className="how-section__intro">
          Selon la commande, l’acheminement se fait de l’une de ces trois façons.
        </p>
        <div className="how-grid how-grid--three">
          <article className="how-card">
            <h3 className="how-card__title">Option 1 — Expédition Chronofresh (gérée par le site)</h3>
            <p className="how-card__text">
              Le site gère l’expédition en Chronofresh. C’est pratique si le producteur est loin ou
              si on veut une solution simple.
            </p>
            <p className="how-card__text">Idéal si : tu veux une solution clé en main.</p>
          </article>
          <article className="how-card">
            <h3 className="how-card__title">Option 2 — Livraison par le producteur (si proposée)</h3>
            <p className="how-card__text">
              Le producteur peut livrer, mais ce n’est pas obligatoire. Si cette option est proposée
              dans la commande, elle s’applique.
            </p>
            <p className="how-card__text">
              Idéal si : le producteur est proche et propose la livraison.
            </p>
          </article>
          <article className="how-card">
            <h3 className="how-card__title">
              Option 3 — Collecte chez le producteur par le partageur
            </h3>
            <p className="how-card__text">
              Le partageur peut aller chercher directement chez le producteur. Souvent, cela évite
              des frais de livraison.
            </p>
            <p className="how-card__text">
              Idéal si : vous voulez limiter les frais de transport.
            </p>
          </article>
        </div>
      </section>

      <section id="producteur" className="how-section how-anchor-target">
        <h2>Pour les producteurs</h2>
        <p className="how-section__intro">
          Tu gardes la main sur tes produits, tes disponibilités et les conditions pour que chaque
          commande soit simple à préparer.
        </p>
        <div className="how-grid how-grid--three">
          <article className="how-card">
            <h3 className="how-card__title">1) J’ajoute mes produits et mes lots</h3>
            <p className="how-card__text">
              Je publie mes produits et je gère un système de lots (par exemple : récolte, série,
              disponibilité).
            </p>
          </article>
          <article className="how-card">
            <h3 className="how-card__title">2) Je renseigne mes disponibilités</h3>
            <p className="how-card__text">
              Pour chaque produit ou lot, j’indique les périodes de disponibilité et les conditions
              utiles.
            </p>
          </article>
          <article className="how-card">
            <h3 className="how-card__title">3) Je fixe un seuil minimum</h3>
            <p className="how-card__text">
              Je définis un seuil minimum pour éviter une commande trop petite et protéger mon
              temps de préparation.
            </p>
          </article>
          <article className="how-card">
            <h3 className="how-card__title">4) Je vois les commandes en cours</h3>
            <p className="how-card__text">
              Je peux suivre les commandes en cours de création et anticiper la préparation au fur
              et à mesure.
            </p>
          </article>
          <article className="how-card">
            <h3 className="how-card__title">5) À la clôture, je reçois la commande définitive</h3>
            <p className="how-card__text">
              Quand la commande se clôture, je reçois la liste définitive. Ensuite, j’expédie via
              Chronofresh, je livre si c’est proposé, ou je remets au partageur pour collecte.
            </p>
          </article>
        </div>
        <div className="how-section__actions">
          <CtaLink to="/produit/nouveau" variant="primary">
            Je suis producteur : ajouter mes produits
          </CtaLink>
        </div>
      </section>

      <section className="how-section">
        <h2>FAQ</h2>
        <div className="how-grid how-grid--three">
          <article className="how-card">
            <h3 className="how-card__title">Que se passe t-il si X ?</h3>
            <p className="how-card__text">
              Blablabla
            </p>
          </article>
          <article className="how-card">
            <h3 className="how-card__title">Que se passe t-il si X ?</h3>
            <p className="how-card__text">
              Blablabla
            </p>
          </article>
          <article className="how-card">
            <h3 className="how-card__title">Que se passe t-il si X ?</h3>
            <p className="how-card__text">
              Blablabla
            </p>
          </article>
        </div>
      </section>

      <section className="how-cta-final">
        <h2>Prêt à essayer ?</h2>
        <p className="how-cta-final__text">
          Tu peux rejoindre une commande autour de toi, ou en créer une en quelques minutes.
        </p>
      </section>
    </div>
  );
}











