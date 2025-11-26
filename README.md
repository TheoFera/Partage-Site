
# TEST Site Partage

This is a code bundle for TEST Site Partage. The original project is available at https://www.figma.com/design/P9emQ4BFG9AFnHOr58OaXz/TEST-Site-Partage.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Structure du dossier `src`

- `src/main.tsx` : point d'entrée Vite, monte React dans `#root`.
- `src/App.tsx` : conteneur principal qui orchestre les vues (navigation, deck, produits, messagerie, profil).
- `src/index.css` : styles globaux générés depuis Figma.
- `src/data/mockData.ts` : données mockées (utilisateur, produits) pour alimenter l'UI.
- `src/types/index.ts` : types métiers (User, Product, DeckCard, GroupOrder).

### Composants applicatifs (`src/components`)

- `Header.tsx` : en-tête principal avec actions utilisateur.
- `Navigation.tsx` : barre latérale et sélection d'onglets.
- `Logo.tsx` : composant logo.
- `ProductCard.tsx` : carte produit (infos, actions).
- `DeckView.tsx` : affichage du deck sélectionné.
- `CreateOrderForm.tsx` : formulaire de création de commande groupée.
- `AddProductForm.tsx` : formulaire d'ajout d'un produit.
- `ProfileView.tsx` : vue profil utilisateur.
- `MessagesView.tsx` : vue messagerie.

### Composants Figma utilitaires (`src/components/figma`)

- `ImageWithFallback.tsx` : image avec fallback/placeholder si le chargement échoue.

### Note
Les fichiers/jalons Figma non utilisés ont été supprimés pour alléger le bundle (attributions, guidelines, store/mock-data, styles additionnels, composants UI génériques, filtres/chat/mobile-nav).
  
