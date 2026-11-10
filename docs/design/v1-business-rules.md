# DocuPro V1 — Règles Métier et Arbitrages Fonctionnels (Lot A)

Ce document fige et formalise les règles de gestion pour la première version (V1) de DocuPro. Il résout les cas limites fonctionnels afin de préparer un modèle de données et une implémentation sans ambiguïtés.

Conformément à la méthode de travail sans infrastructure réelle, chaque point distingue :
- **Décision de conception** : Principe acté et structurant pour la V1.
- **Proposition à arbitrer** : Choix recommandé soumis à validation formelle.
- **Élément vérifiable par analyse statique** : Cohérence logique, types, contraintes de schéma.
- **Élément nécessitant une future exécution** : RLS, concurrence SQL, vérifications sous base réelle.

---

## A. Entreprises et Utilisateurs

| Sujet | Proposition | Justification | Décision à valider |
| :--- | :--- | :--- | :--- |
| **Création d'une entreprise** | Réservée au rôle `SUPER_ADMIN` de la plateforme via un écran / endpoint dédié. | Empêche l'auto-inscription publique incontrôlée et garantit un onboarding contrôlé pour le marché initial. | Validation du mode exclusif par administrateur de plateforme. |
| **Premier administrateur** | Lors de la création du tenant, le super-admin saisit l'email du premier administrateur. Le système crée une invitation au rôle `ADMIN` avec un jeton sécurisé. | Ne crée pas de mot de passe temporaire en clair et force l'administrateur client à initialiser son propre mot de passe et son MFA. | Validation du flux d'onboarding par invitation du premier admin. |
| **Statuts d'une entreprise** | Trois statuts : `ACTIVE`, `SUSPENDED`, `CLOSED`. | `ACTIVE` autorise les opérations ; `SUSPENDED` bloque toutes les requêtes mutantes et consultations pour tous ses membres ; `CLOSED` archive l'accès avant export/purge. | Validation des 3 états du cycle de vie du tenant. |
| **Statut du compte utilisateur global** | Deux statuts : `ACTIVE`, `SUSPENDED`. | Un utilisateur physique a un compte unique. La suspension globale bloque toute connexion à la plateforme, quelle que soit l'entreprise ciblée. | Validation de la dissociation compte global vs appartenance. |
| **Statuts d'une appartenance (Membership)** | Trois statuts : `INVITED`, `ACTIVE`, `SUSPENDED`. | Permet de désactiver un collaborateur au sein d'une entreprise sans toucher à son compte global ni à ses accès dans d'autres entreprises. | Validation des 3 statuts d'appartenance. |
| **Dernier administrateur actif** | Règle de verrou : Interdiction formelle de suspendre, supprimer ou rétrograder le dernier membre `ACTIVE` ayant le rôle `ADMIN` d'un tenant. | Évite qu'une entreprise devienne orpheline sans administrateur capable de gérer les accès. Seul le super-admin plateforme dispose d'une procédure d'urgence. | Validation de la contrainte applicative du dernier admin actif. |
| **Accès de l'administrateur plateforme** | Zéro accès par défaut aux documents des clients. Le super-admin gère l'état du tenant, les quotas et les diagnostics techniques sans visibilité sur l'arborescence ni les fichiers. | Respect strict du secret des affaires, d'OWASP SaaS et de la loi camerounaise n° 2024/017 relative à la protection des données. | Validation du cloisonnement strict du super-admin hors documents. |
| **Utilisateur multi-entreprises** | Un utilisateur peut appartenir à N entreprises avec des rôles distincts. Chaque requête métier exige le contexte explicite de l'entreprise ciblée (`X-Tenant-Id`). | Évite toute confusion ou fuite de contexte lors de sessions simultanées dans plusieurs onglets. | Validation de l'en-tête explicite obligatoire par requête. |

---

## B. Invitations

| Sujet | Proposition | Justification | Décision à valider |
| :--- | :--- | :--- | :--- |
| **Création de l'invitation** | Émise par un `ADMIN` du tenant en indiquant l'adresse email et le rôle attribué (`ADMIN`, `DOCUMENT_MANAGER`, `CONTRIBUTOR`, `VIEWER`). | Seuls les administrateurs du tenant sont habilités à agrandir le cercle de collaborateurs. | Validation du droit d'invitation réservé aux admins. |
| **Durée et validité** | Expiration fixée à 48 heures. Stockage exclusif du hash SHA-256 du jeton d'invitation en base (`token_hash`). | Réduit la fenêtre d'attaque en cas d'interception d'un lien d'invitation. | Validation du délai d'expiration à 48h. |
| **Renvoi d'invitation** | Un `ADMIN` peut renvoyer une invitation en attente. Le système génère un nouveau jeton, réinitialise le délai à 48h et invalide l'ancien jeton. | Permet de relancer un collaborateur sans multiplier les lignes actives en base. | Validation de l'invalidation de l'ancien jeton lors d'un renvoi. |
| **Révocation d'invitation** | Un `ADMIN` peut révoquer une invitation en attente (`status = REVOKED` ou suppression). Le lien devient immédiatement inopérant. | Empêche l'accès si l'invitation a été envoyée par erreur ou à un collaborateur sortant. | Validation de la révocation immédiate. |
| **Compte existant vs Nouveau compte** | Si l'email correspond à un `User` existant : l'acceptation crée directement le `Membership` actif après connexion. Si l'email est inconnu : redirection vers le formulaire de création de compte (nom, prénom, mot de passe) puis activation du `Membership`. | Parcours fluide unifiant les collaborateurs déjà inscrits sur la plateforme et les nouveaux arrivants. | Validation du double parcours selon l'existence de l'email. |
| **Utilisateur déjà membre** | Si l'email ciblé dispose déjà d'un `Membership` (actif ou suspendu) pour ce tenant : l'API rejette la création d'invitation avec une erreur explicite `ALREADY_MEMBER`. | Empêche la création d'invitations incohérentes ou de doublons de rattachement. | Validation du rejet si appartenance existante. |
| **Vérification de l'adresse** | L'acceptation de l'invitation certifie automatiquement l'adresse email pour le compte concerné (`is_email_verified = true`). | La réception et le clic sur le lien reçu par email constituent une preuve matérielle de possession de l'adresse. | Validation de la validation implicite de l'email par invitation. |

---

## C. Rôles et Permissions (Matrice Détaillée V1)

### Matrice Complète d'Autorisation V1

| Ressource & Action | `ADMIN` | `DOCUMENT_MANAGER` | `CONTRIBUTOR` | `VIEWER` | Règle Métier Spécifique |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Entreprise** | | | | | |
| Consulter le profil | ✅ | ✅ | ✅ | ✅ | Nom, logo, coordonnées publiques. |
| Modifier profil / logo / quotas | ✅ | ❌ | ❌ | ❌ | Réservé à l'administrateur du tenant. |
| **Membres** | | | | | |
| Inviter / Relancer / Révoquer | ✅ | ❌ | ❌ | ❌ | Seul l'admin gère les accès. |
| Modifier le rôle d'un membre | ✅ | ❌ | ❌ | ❌ | Avec protection du dernier admin actif. |
| Suspendre / Réactiver membre | ✅ | ❌ | ❌ | ❌ | Révocation immédiate des sessions du tenant. |
| Consulter la liste des membres | ✅ | ✅ | ✅ | ✅ | Nécessaire pour identifier les déposants. |
| **Dossiers** | | | | | |
| Créer / Renommer un dossier | ✅ | ✅ | ❌ | ❌ | Gestion de la structure documentaire. |
| Déplacer un dossier | ✅ | ✅ | ❌ | ❌ | Avec contrôle anti-cycle. |
| Mettre un dossier à la corbeille | ✅ | ✅ | ❌ | ❌ | Marque le dossier et son contenu. |
| Restaurer un dossier | ✅ | ✅ | ❌ | ❌ | Restaure l'arborescence associée. |
| **Documents** | | | | | |
| Importer un fichier | ✅ | ✅ | ✅ | ❌ | Dépôt en quarantaine pour scan. |
| Consulter métadonnées & aperçu | ✅ | ✅ | ✅ | ✅ | Uniquement si statut = `READY`. |
| Télécharger le fichier original | ✅ | ✅ | ✅ | ✅ | Uniquement si statut = `READY` (URL signée). |
| Modifier métadonnées | ✅ | ✅ | 👤 *Propriétaire* | ❌ | **Arbitrage validé** : le contributeur modifie uniquement ses dépôts. |
| Déplacer vers un autre dossier | ✅ | ✅ | 👤 *Propriétaire* | ❌ | Le contributeur peut ranger ses propres dépôts. |
| Mettre à la corbeille | ✅ | ✅ | 👤 *Propriétaire* | ❌ | Le contributeur peut supprimer ses propres brouillons/dépôts. |
| Restaurer de la corbeille | ✅ | ✅ | ❌ | ❌ | Seuls admin et gestionnaire restaurent. |
| **Corbeille Globale** | | | | | |
| Consulter les éléments supprimés | ✅ | ✅ | ❌ | ❌ | Vue dédiée sur `is_deleted = true`. |
| **Audit & Exports** | | | | | |
| Consulter les journaux d'audit | ✅ | ❌ | ❌ | ❌ | Réservé à l'admin du tenant. |
| Déclencher un export administratif | ✅ | ❌ | ❌ | ❌ | Génération d'archive ZIP (métadonnées + fichiers). |

> [!NOTE]
> **Règle stricte V1** : Aucune permission granulaire par dossier ou par document. Tous les documents de l'organisation sont visibles par tous les membres actifs de cette organisation (selon les droits du rôle ci-dessus).

---

## D. Gestion des Dossiers

| Sujet | Proposition | Justification | Décision à valider |
| :--- | :--- | :--- | :--- |
| **Racine de l'espace documentaire** | **Racine virtuelle** (`parent_id = NULL`). Tout dossier sans parent est situé au premier niveau de l'entreprise. | Plus simple et plus robuste qu'un enregistrement physique "Racine" risquant d'être accidentellement altéré ou supprimé. | Validation de la racine virtuelle (`parent_id = NULL`). |
| **Règles de nommage** | Chaîne de 1 à 100 caractères. Caractères interdits : `/`, `\`, caractères de contrôle ASCII. Espaces superflus rognés (*trimmed*). | Assure la lisibilité et évite les conflits d'injection de chemins de fichiers. | Validation des contraintes de nommage de dossiers. |
| **Doublons et sensibilité à la casse** | **Insensibilité à la casse**. Deux dossiers sous le même parent (ou à la racine) ne peuvent pas avoir le même nom (ex: "Factures" et "factures" sont considérés identiques). | Évite la confusion utilisateur et les incohérences lors de synchronisations de systèmes de fichiers. | Validation de l'unicité insensible à la casse par niveau (`LOWER(name)`). |
| **Déplacement et anti-cycle** | Lors du déplacement d'un dossier `D` vers un nouveau parent `P`, l'API vérifie par parcours d'ancêtres que `P` n'est ni `D` ni un descendant de `D`. | Évite de créer une boucle infinie qui rendrait l'arborescence inaccessible. | Validation de la vérification récursive anti-cycle avant déplacement. |
| **Suppression d'un dossier non vide** | **Mise à la corbeille en cascade** : le dossier est marqué `is_deleted = true`, et tous ses sous-dossiers et documents rattachés reçoivent le même marqueur temporel `deleted_at`. | Comportement naturel pour l'utilisateur sans supprimer physiquement les données. | Validation de la mise à la corbeille récursive. |
| **Visibilité dans la corbeille** | L'écran Corbeille affiche uniquement le dossier racine supprimé (pas l'avalanche de tous les fichiers enfants). | Offre une vue claire et compréhensible de ce qui a été jeté. | Validation de l'affichage groupé de la corbeille. |
| **Restauration et conflits de nom** | Si le dossier parent d'origine a été purgé ou n'existe plus : restauration automatique à la **racine**. Si un dossier portant le même nom existe déjà à cet emplacement : ajout d'un suffixe horodaté ou numérique (ex: `Factures (restauré le 2026-11-10)`). | Garantit que la restauration réussit toujours sans écraser ni bloquer pour conflit de contrainte d'unicité. | Validation de la règle de renommage automatique en cas de collision. |

---

## E. Gestion des Documents

| Sujet | Proposition | Justification | Décision à valider |
| :--- | :--- | :--- | :--- |
| **Métadonnées obligatoires** | - **Titre** (1 à 255 caractères)<br>- **Fichier original** (binaire valide déposé)<br>- **Déposant** (`created_by_user_id`)<br>- **Date de dépôt** (automatique). | Socle minimal indispensable pour identifier et tracer le document. | Validation du caractère obligatoire du titre et du fichier. |
| **Métadonnées facultatives** | - **Référence interne** (ex: N° de contrat, facture)<br>- **Description** (texte libre)<br>- **Type documentaire** (liste normalisée)<br>- **Date du document** (date d'émission métier)<br>- **Dossier de rattachement** (`folder_id`, racine si `NULL`). | Flexibilité documentaire sans complexifier la V1 avec des formulaires dynamiques. | Validation de la liste des métadonnées facultatives V1. |
| **Types documentaires initiaux** | Liste fermée prédéfinie :<br>1. `FACTURE`<br>2. `CONTRAT`<br>3. `COURRIER`<br>4. `PIECE_IDENTITE`<br>5. `BULLETIN_PAIE`<br>6. `RAPPORT`<br>7. `AUTRE` | Couvre 95% des besoins courants d'entreprise au lancement sans éditeur dynamique de métadonnées. | Validation de la nomenclature initiale des types documentaires. |
| **Unicité de la référence** | La référence métier **n'est pas strictement unique** au niveau de la base, mais un avertissement non-bloquant est affiché dans l'UI si elle existe déjà dans l'entreprise. | Dans la pratique métier, des avenants ou des factures rectificatives portent souvent la même référence qu'un document existant. | Validation de la référence non bloquante avec avertissement. |
| **Immutabilité de l'original** | Règle V1 : **Un document = un seul fichier original**. Le fichier original ne peut être ni écrasé ni remplacé. Pour corriger un fichier, l'utilisateur crée un nouveau document. | Évite la complexité de gestion du versionnement successif, de recalcul des quotas et d'intégrité en V1. | Validation de l'immutabilité du fichier original en V1. |
| **Visibilité pendant le scan** | Tant que le statut est `QUARANTINED`, `SCANNING` ou `SCAN_FAILED_TEMPORARY`, le document apparaît dans la liste avec un badge explicite "En cours d'analyse", mais son visualiseur et son bouton de téléchargement sont **désactivés**. | Permet à l'utilisateur de constater que son import a été pris en compte sans risquer de diffuser un fichier suspect. | Validation du blocage strict de téléchargement avant statut `READY`. |
| **Visibilité après rejet** | Si statut = `REJECTED_SECURITY` ou `REJECTED_FORMAT`, le fichier physique en quarantaine est supprimé. La fiche documentaire subsiste 7 jours avec le motif de rejet pour information de l'utilisateur, puis est purgée. | Clarté pour l'utilisateur sans polluer l'espace documentaire de manière permanente. | Validation de la rétention d'information de rejet temporaire. |
| **Suppression et corbeille** | La mise à la corbeille place le document en `is_deleted = true`. Il disparaît des recherches et de l'explorateur standard. Seuls les profils autorisés (`ADMIN`, `DOCUMENT_MANAGER`) peuvent le consulter dans la Corbeille ou le restaurer. | Empêche les destructions accidentelles et préserve la chaîne d'audit. | Validation de la corbeille documentaire. |

---

## F. Limites et Quotas

| Sujet | Proposition V1 (Provisoire) | Justification | Décision à valider |
| :--- | :--- | :--- | :--- |
| **Taille maximale par fichier** | **50 Mo** par fichier. | Suffisant pour des PDFs volumineux de plusieurs centaines de pages et des scans haute résolution, tout en préservant la mémoire des workers. | Validation du seuil maximal de 50 Mo par fichier. |
| **Fichiers par import multiple** | Maximum **20 fichiers** par lot de téléversement. | Évite la saturation du navigateur, la congestion réseau et les timeouts HTTP. | Validation du lot maximal de 20 fichiers par import. |
| **Longueur des champs texte** | - Titre : max 255 caractères<br>- Référence : max 100 caractères<br>- Description : max 2 000 caractères<br>- Nom de dossier : max 100 caractères. | Préserve les index PostgreSQL et évite les abus de stockage de texte en base. | Validation des bornes de longueur de champs. |
| **Profondeur d'arborescence** | Maximum **5 niveaux** sous la racine. | Prévient les structures inutilement profondes, complexes à restituer en UI et coûteuses en CTE SQL récursives. | Validation de la limite de 5 niveaux de dossiers. |
| **Stockage par entreprise** | Quota initial par défaut : **5 Go** par tenant (modifiable par le super-admin). | Valeur de lancement généreuse pour une PME en phase pilote, maîtrisant les coûts de stockage local / S3. | Validation du quota par défaut de 5 Go. |
| **Imports simultanés par tenant** | Maximum **5 uploads en parallèle** par entreprise. | Empêche un seul client de saturer les files d'attente BullMQ et le CPU du worker antivirus. | Validation du plafond de 5 imports simultanés. |
| **Calcul du stockage consommé** | Comptabilisé dans `storage_used` :<br>1. Originaux validés (`READY`)<br>2. Documents en quarantaine active (`QUARANTINED`, `SCANNING`)<br>3. Documents placés dans la corbeille (`is_deleted = true`).<br>*Non comptabilisés* : aperçus/vignettes dérivés et documents rejetés. | Les fichiers en corbeille et en quarantaine occupent réellement de l'espace disque. Seule leur purge libère le quota. | Validation du périmètre de calcul du stockage utilisé. |
| **Prévention du dépassement de quota (Réservation)** | Avant d'autoriser l'upload d'un fichier de taille $S$, le backend exécute une réservation conditionnelle en base :<br>`UPDATE tenants SET storage_used = storage_used + S WHERE id = :id AND storage_used + S <= storage_quota`. Si aucune ligne n'est mise à jour : rejet immédiat avec code `QUOTA_EXCEEDED`. Si l'import échoue : $S$ est restitué. | **Résout le risque de concurrence** : impossible de dépasser le quota même en lançant 10 uploads simultanés à la limite du stockage. | Validation du mécanisme de réservation atomique de quota. |

---

## G. Sessions et Entreprise Active

| Sujet | Proposition | Justification | Décision à valider |
| :--- | :--- | :--- | :--- |
| **Durée d'inactivité (Rolling)** | **2 heures**. Chaque requête authentifiée valide prolonge la durée de 2 heures si la session n'a pas expiré. | Standard de sécurité ergonomique pour les applications de gestion d'entreprise. | Validation de l'inactivité fixée à 2h. |
| **Durée absolue maximale** | **24 heures**. Au terme de 24h consécutives, la session expire obligatoirement et l'utilisateur doit se réauthentifier. | Réduit l'impact de la compromission d'un token ou d'un poste laissé ouvert indéfiniment. | Validation de l'expiration absolue à 24h. |
| **Jeton de session et empreinte** | Cookie `docupro_session` contenant un secret cryptographique opaque (64 hex). Seul son hash SHA-256 est persisté dans la table `sessions`. | Empêche un attaquant disposant d'une lecture de base de données d'usurper des sessions actives. | Validation du stockage par hash SHA-256 des tokens de session. |
| **Changement de mot de passe** | La modification ou réinitialisation du mot de passe révoque automatiquement toutes les sessions existantes de l'utilisateur. | Règle fondamentale de sécurité pour expulser tout intrus éventuel. | Validation de la révocation globale lors du reset mot de passe. |
| **Déconnexion d'un vs tous les appareils** | Endpoint standard `POST /auth/logout` révoque la session courante. Option `POST /auth/logout-all` révoque toutes les sessions du compte. | Donne à l'utilisateur le contrôle sur ses sessions actives. | Validation des deux modes de déconnexion. |
| **Suspension d'une appartenance** | La suspension de l'appartenance d'un utilisateur à l'Entreprise A bloque immédiatement toute requête portant `X-Tenant-Id: <A>`. Ses sessions et accès à l'Entreprise B restent totalement opérationnels. | Cloisonnement précis : la sanction au sein d'une organisation ne pénalise pas les autres contrats de l'utilisateur. | Validation du blocage sélectif par entreprise ciblée. |
| **Multi-onglets et contexte explicite** | L'UI transmet l'identifiant de l'entreprise visée via l'en-tête HTTP `X-Tenant-Id: <uuid>` sur chaque requête métier. Le backend valide que l'utilisateur possède un `Membership` actif sur cette entreprise. | Élimine les erreurs dramatiques où un utilisateur navigant dans l'onglet de l'Entreprise A enregistre par mégarde un document dans l'Entreprise B suite à un changement de focus. | Validation de l'en-tête `X-Tenant-Id` obligatoire sur les routes d'entreprise. |

---

## 4. Synthèse des Décisions Bloquantes à Valider (Checklist)

Pour considérer le **Lot A** comme clôturé et pouvoir démarrer le **Lot B (Modèle de données logique)**, veuillez confirmer votre accord sur les 6 arbitrages suivants :

1. **Règle du dernier administrateur actif** : Confirmation de l'interdiction applicative stricte de suspendre, supprimer ou rétrograder le dernier `ADMIN` actif d'une entreprise.
2. **Droits du Contributeur sur les métadonnées** : Confirmation que le profil `CONTRIBUTOR` peut modifier les métadonnées et déplacer uniquement les documents **dont il est l'auteur**, tandis que `DOCUMENT_MANAGER` et `ADMIN` peuvent agir sur tous les documents du tenant.
3. **Immutabilité de l'original en V1** : Confirmation qu'un document V1 ne supporte pas le remplacement de son fichier original (un correctif nécessite un nouveau dépôt).
4. **Plafond d'arborescence et racine** : Confirmation d'une racine virtuelle (`parent_id = NULL`) et d'un plafond de profondeur fixé à 5 niveaux sous la racine.
5. **Réservation atomique de quota** : Confirmation du mécanisme SQL atomique incrémentant `storage_used` avant téléversement pour bloquer tout dépassement concurrent.
6. **Contexte multi-onglets via en-tête `X-Tenant-Id`** : Confirmation de l'obligation de passer l'ID de l'entreprise cible dans l'en-tête sur chaque appel API métier.
