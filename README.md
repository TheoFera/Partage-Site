# TEST Site Partage

This is a code bundle for TEST Site Partage. The original project is available at https://www.figma.com/design/P9emQ4BFG9AFnHOr58OaXz/TEST-Site-Partage.

## Running the code

1. Run `npm i` to install the dependencies.
2. Run `npm run dev` to start the development server.
3. Copiez `.env.example` vers `.env` et renseignez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` si vous branchez Supabase.

## Routing

L'application utilise `react-router-dom` (BrowserRouter). Les routes principales sont :

- `/` produits, `/carte` deck/carte, `/creer` creation (client/prod/partageur), `/messages`, `/profil` (profil personnel), `/profil/:handle` (profil public), `/produit/:id` (fiche produit), `/commande/:id` (vue commande).

## Supabase

`src/lib/supabaseClient.ts` expose `getSupabaseClient()`/`supabase`. Le client est instancie si `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont renseignees dans votre `.env`.

## Structure du dossier `src`

- `src/main.tsx` : point d'entree Vite, monte React dans `#root` et injecte les styles globaux.
- `src/App.tsx` : orchestre les vues en fonction du role utilisateur, controle le deck, les produits et les actions de navigation.
- `src/index.css` : styles base generes depuis la charte Figma.
- `src/data/mockData.ts` : donnees factices (produits, commandes et utilisateur) pour prototyper l'interface.
- `src/types/index.ts` : definitions TypeScript pour `User`, `Product`, `DeckCard` et `GroupOrder`.

### Composants applicatifs (`src/components`)

- `Header.tsx` : en-tete fixe avec recherche, informations utilisateur et status du panier.
- `Navigation.tsx` : barre de navigation en bas qui cache ou affiche les onglets selon le role.
- `Logo.tsx` : affichage du logo et du badge.
- `ProductCard.tsx` : carte produit reutilisee par `Home`, `Deck` et `ClientSwipeView`.
- `DeckView.tsx` : liste des produits sauvegardes, permet de retirer un article.
- `CreateOrderForm.tsx` : creation de commande partagee pour les role autre que client.
- `AddProductForm.tsx` : ajout rapide d'un produit pour les producteurs.
- `ProfileView.tsx` : formulaire de profil qui permet aussi de changer de role.
- `MessagesView.tsx` : espace de messagerie avec liste de conversations fictives.
- `ClientSwipeView.tsx` : experience swipe dediee aux clients pour enregistrer un produit sans creer de commande encore.
- `ProducerOrdersView.tsx` : suivi des commandes entrantes filtrees sur le producteur actif.
- `ProducerProductsView.tsx` : liste dediee des produits du producteur, avec etat de stock et volume.
- `MapView.tsx` : onglet Carte (clients/partageurs) affichant les partageurs proches + gestion rapide des favoris/selection.
- `ProfileView.tsx` : profil type Instagram avec onglets Produits (producteur), Commandes publiques et Favoris (client) + passage en mode edition.

### Composants figma utilitaires (`src/components/figma`)

- `ImageWithFallback.tsx` : wrapper d'image qui affiche un placeholder si le chargement echoue.

## Affichage par type de compte

- **Producteur**
  - Onglet **Accueil** : `ProducerProductsView` affiche uniquement les produits dont l'identifiant du producteur correspond au profil actif, ainsi que leur stock et localisation.
  - Onglet **Deck/Commandes** : `ProducerOrdersView` liste les commandes groupées en cours portees par ce producteur.
  - Onglet **Creer** : `AddProductForm` pour ajouter ou mettre a jour une fiche produit, puis retour automatique a l'accueil.
  - Les onglets **Messages** et **Profil** restent accessibles pour visualiser les conversations et ajuster les informations du producteur.

- **Partageur** (role mock `sharer`)
  - Onglet **Accueil** : grille de `ProductCard` qui combine produits locaux, barre de recherche et filtres automatiques sur nom/description/producteur.
  - Onglet **Deck** : `DeckView` affiche la selection sauvegardee avec possibilite de retirer un produit.
  - Onglet **Creer** : `CreateOrderForm` pour composer une commande partagee en utilisant les produits du deck.
  - Les onglets **Messages** et **Profil** sont des vues de support pour suivre les echanges et mettre a jour le profil.

- **Client**
  - Onglet **Accueil** : meme grille de produits que pour les partageurs afin de visualiser l'offre locale.
  - Onglet **Deck** : `DeckView` montre les produits enregistres (titre "Enregistre").
  - Onglet **Creer** : `ClientSwipeView` fournit un swipe natif avec bouton de sauvegarde rapide vers le deck et etiquette de localisation.
  - Onglets **Messages** et **Profil** identiques aux autres roles, utiles pour verifier l'adresse et les notifications.

Les roles sont definis via `ProfileView`, mis a jour par `App.tsx` et influencent directement le contenu rendu par `renderHomeContent`, `renderDeckContent` et `renderCreateContent`.

### Remarques

- Les composants/ressources Figma inutilises ont ete supprimes pour garder le bundle lean (attributions, guidelines, store/mock-data, styles additionnels, composants generiques, filtres/chat/mobile-nav).
