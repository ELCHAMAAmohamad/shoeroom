INSERT INTO utilisateurs (id_util, nom_util, prenom_util, email_util, mot_de_passe_util, role_util, date_inscription_util) VALUES
(1, 'ShoeRoom', 'Admin', 'mchamaa22@gmail.com', '123456', 'admin', '2026-11-01 09:00:00'),
(2, 'El Chamaa', 'Mohamad', 'mohamad@exemple.fr', '123456', 'membre', '2026-11-02 10:15:00'),
(3, 'Martin', 'Sara', 'sara@exemple.fr', '123456', 'membre', '2026-11-03 14:30:00'),
(4, 'Bernard', 'Lucas', 'lucas@exemple.fr', '123456', 'membre', '2026-11-04 18:05:00'),
(5, 'Moreau', 'Inès', 'ines@exemple.fr', '123456', 'membre', '2026-11-05 11:40:00'),
(6, 'Lefèvre', 'Hugo', 'hugo@exemple.fr', '123456', 'membre', '2026-11-06 20:10:00'),
(7, 'Dubois', 'Chloé', 'chloe@exemple.fr', '123456', 'membre', '2026-11-07 08:55:00');

-- 2. ANNONCES (12 annonces, dont 3 vendues)
INSERT INTO annonces (id_annonce, titre_annonce, marque_annonce, size_annonce, prix_annonce, etat_annonce, description_annonce, statut_annonce, date_publication_annonce, id_vendeur_annonce) VALUES
(1, 'Air Max 90 blanches', 'Nike', 42, 85.00, 'occasion', 'Portées une dizaine de fois, très bon état. Semelle propre, aucune déchirure. Vendues avec la boîte d''origine.', 'en vente', '2026-11-10 09:20:00', 3),
(2, 'Stan Smith vert et blanc', 'Adidas', 39, 60.00, 'neuves', 'Jamais portées, reçues en cadeau mais trop petites pour moi. Boîte et papier de soie d''origine.', 'en vente', '2026-11-11 17:45:00', 5),
(3, 'Chuck 70 noires montantes', 'Converse', 44, 45.00, 'occasion', 'Toile noire, semelle crème légèrement patinée. Lacets changés récemment.', 'vendue', '2026-11-11 20:10:00', 4),
(4, 'Old Skool noir et blanc', 'Vans', 41, 40.00, 'occasion', 'Bon état général, un peu d''usure sur le talon gauche (voir photo 2).', 'en vente', '2026-11-12 12:00:00', 6),
(5, '550 crème et vert', 'New Balance', 43, 95.00, 'neuves', 'Neuves, portées une seule fois en intérieur pour essayer. Cuir crème, détails verts.', 'en vente', '2026-11-13 10:30:00', 7),
(6, 'Air Force 1 blanches', 'Nike', 42.5, 70.00, 'occasion', 'Blanches, nettoyées et désodorisées. Petit pli sur le bout, normal pour ce modèle.', 'vendue', '2026-11-13 19:05:00', 2),
(7, 'Samba OG noires', 'Adidas', 40, 90.00, 'neuves', 'Neuves avec étiquettes. Cuir noir, bout en daim, semelle gomme.', 'en vente', '2026-11-14 08:50:00', 3),
(8, 'Club C 85 blanches', 'Reebok', 38, 55.00, 'occasion', 'Cuir blanc souple, détail bleu marine. Portées une saison.', 'en vente', '2026-11-15 15:15:00', 5),
(9, 'Gel-Lyte III grises', 'Asics', 44.5, 75.00, 'occasion', 'Très confortables, languette fendue typique du modèle. Bon état.', 'en vente', '2026-11-16 11:25:00', 4),
(10, 'Suede Classic bleu marine', 'Puma', 42, 50.00, 'neuves', 'Daim bleu marine, jamais portées. Je les vends car j''ai pris la mauvaise pointure.', 'en vente', '2026-11-17 13:40:00', 2),
(11, 'Chuck Taylor basses blanches', 'Converse', 37, 35.00, 'occasion', 'Toile blanche lavée, semelle un peu jaunie. Idéales pour l''été.', 'vendue', '2026-11-17 18:20:00', 7),
(12, '574 grises', 'New Balance', 45, 65.00, 'occasion', 'Daim et mesh gris, très bon état, portées pour le sport en salle seulement.', 'en vente', '2026-11-18 09:10:00', 6);

-- 3. PHOTOS DES ANNONCES (1 à 3 par annonce ; fichiers dans backend/uploads)
INSERT INTO photos_annonces (chemin_photo, id_annonce_photo) VALUES
('annonce-01-1.jpg', 1),
('annonce-01-2.jpg', 1),
('annonce-01-3.jpg', 1),
('annonce-02-1.jpg', 2),
('annonce-02-2.jpg', 2),
('annonce-03-1.jpg', 3),
('annonce-03-2.jpg', 3),
('annonce-03-3.jpg', 3),
('annonce-04-1.jpg', 4),
('annonce-04-2.jpg', 4),
('annonce-05-1.jpg', 5),
('annonce-05-2.jpg', 5),
('annonce-05-3.jpg', 5),
('annonce-06-1.jpg', 6),
('annonce-06-2.jpg', 6),
('annonce-07-1.jpg', 7),
('annonce-07-2.jpg', 7),
('annonce-07-3.jpg', 7),
('annonce-08-1.jpg', 8),
('annonce-09-1.jpg', 9),
('annonce-09-2.jpg', 9),
('annonce-10-1.jpg', 10),
('annonce-10-2.jpg', 10),
('annonce-11-1.jpg', 11),
('annonce-12-1.jpg', 12),
('annonce-12-2.jpg', 12);

-- 4. ACHATS (les 3 annonces vendues)
INSERT INTO achats (id_achat, date_achat, id_annonce_achat, id_acheteur_achat) VALUES
(1, '2026-11-12 10:05:00', 3, 2),
(2, '2026-11-15 21:30:00', 6, 3),
(3, '2026-11-19 16:45:00', 11, 6);

-- 5. FAVORIS (table facultative)
INSERT INTO favoris (id_util_fav, id_annonce_fav) VALUES
(2, 1), (2, 5), (3, 4), (3, 9), (6, 2);

-- 6. MARQUES DE LA BOUTIQUE (les marques maison de ShoeRoom)
INSERT INTO marques (id_marque, nom_marque, logo_marque, description_marque) VALUES
(1, 'ShoeRoom Originals', 'logo-shoeroom-originals.png', 'La ligne maison de ShoeRoom : des sneakers simples et intemporelles, toutes personnalisables dans l''Atelier.'),
(2, 'Maison Camel', 'logo-maison-camel.png', 'Chaussures de ville en cuir, aux tons naturels camel et chocolat. Fabrication soignée, coutures apparentes.'),
(3, 'Atlantique Run', 'logo-atlantique-run.png', 'Chaussures de sport légères, pensées pour courir le long de la côte, par tous les temps.');

-- 7. MODÈLES (8 modèles ; personnalisable = 1 -> visible dans l'Atelier)
INSERT INTO modeles (id_modele, nom_modele, description_modele, photo_modele, prix_modele, size_disponibles_modele, personnalisable_modele, date_ajout_modele, id_marque_modele) VALUES
(1, 'Runner 01', 'La basket emblématique de ShoeRoom : tige en cuir lisse, semelle crème, bout et talon camel.', 'modele-01.jpg', 89.00, '36,37,38,39,40,41,42,43,44,45,46', 1, '2026-11-08 09:00:00', 1),
(2, 'Court Classic', 'Inspirée des chaussures de tennis : tige blanche, talon bleu marine, lignes épurées.', 'modele-02.jpg', 79.00, '36,37,38,39,40,41,42,43,44,45', 1, '2026-11-08 09:30:00', 1),
(3, 'High Street', 'Montante en toile épaisse, couleur bordeaux, semelle crème vulcanisée.', 'modele-03.jpg', 95.00, '37,38,39,40,41,42,43,44,45,46', 1, '2026-11-09 10:00:00', 1),
(4, 'Derby Cuir', 'Derby en cuir marron, semelle en gomme foncée. Pour le bureau comme pour le week-end.', 'modele-04.jpg', 129.00, '39,40,41,42,43,44,45', 0, '2026-11-09 11:00:00', 2),
(5, 'Chelsea Boot', 'Bottine chocolat avec élastiques latéraux, sans lacets, se met en une seconde.', 'modele-05.jpg', 149.00, '39,40,41,42,43,44,45', 0, '2026-11-10 09:00:00', 2),
(6, 'Mocassin Brest', 'Mocassin camel en cuir souple, semelle fine. Le classique de la maison.', 'modele-06.jpg', 119.00, '38,39,40,41,42,43,44', 0, '2026-11-12 14:00:00', 2),
(7, 'Atlantique Trail', 'Chaussure de trail vert forêt, semelle moutarde crantée pour les sentiers côtiers.', 'modele-07.jpg', 109.00, '38,39,40,41,42,43,44,45,46', 1, '2026-11-15 09:00:00', 3),
(8, 'Atlantique Light', 'Running légère bleu ciel, mesh respirant, idéale pour les sorties courtes.', 'modele-08.jpg', 99.00, '36,37,38,39,40,41,42,43,44,45', 0, '2026-11-18 09:00:00', 3);

-- 8. COULEURS DE L'ATELIER (14 couleurs ; Orange retirée : disponible = 0)
INSERT INTO couleurs_atelier (id_col_ate, nom_col_ate, code_hex_col_ate, disponible_col_ate) VALUES
(1, 'Blanc', '#FFFFFF', 1),
(2, 'Noir', '#1C1C1C', 1),
(3, 'Camel', '#B5835A', 1),
(4, 'Crème', '#F2E8D5', 1),
(5, 'Gris', '#9E9E9E', 1),
(6, 'Rouge', '#C0392B', 1),
(7, 'Bleu marine', '#1F3A5F', 1),
(8, 'Bleu ciel', '#8EC5E8', 1),
(9, 'Vert forêt', '#2E5E4E', 1),
(10, 'Vert sauge', '#A3B18A', 1),
(11, 'Jaune moutarde', '#D4A72C', 1),
(12, 'Rose poudré', '#E8B4B8', 1),
(13, 'Bordeaux', '#6D1F2F', 1),
(14, 'Orange', '#E67E22', 0);

-- 9. CRÉATIONS DE L'ATELIER (couleurs : arrière, milieu, avant, bout, semelle, lacets)
INSERT INTO creations_atelier (id_crea, nom_crea, couleur_arriere_crea, couleur_milieu_crea, couleur_avant_crea, couleur_bout_crea, couleur_semelle_crea, couleur_lacets_crea, size_crea, date_crea, id_modele_crea, id_util_crea) VALUES
(1, 'Runner rose et crème', 12, 1, 1, 12, 4, 1, 39, '2026-11-16 15:20:00', 1, 3),
(2, 'Court marine', 7, 1, 1, 7, 1, 7, 42, '2026-11-17 21:00:00', 2, 2),
(3, 'High Street forêt', 9, 9, 9, 4, 4, 11, 44, '2026-11-19 10:10:00', 3, 4);

-- 10. COMMANDES (3 boutique + 2 atelier ; adresses fictives)
INSERT INTO commandes (id_cmd, type_cmd, size_cmd, prix_cmd, adresse_livraison_cmd, statut_cmd, date_cmd, id_modele_cmd, id_crea_cmd, id_util_cmd) VALUES
(1, 'boutique', 42, 129.00, '12 rue de l''Exemple, 29200 Brest', 'envoyée', '2026-11-14 12:30:00', 4, NULL, 5),
(2, 'atelier', 39, 89.00, '4 place du Test, 29200 Brest', 'en fabrication', '2026-11-16 15:30:00', 1, 1, 3),
(3, 'boutique', 43, 89.00, '8 avenue Fictive, 29000 Quimper', 'reçue', '2026-11-18 18:00:00', 1, NULL, 6),
(4, 'atelier', 42, 79.00, '21 rue Imaginaire, 29200 Brest', 'reçue', '2026-11-19 09:15:00', 2, 2, 2),
(5, 'boutique', 38, 99.00, '3 impasse Modèle, 29280 Plouzané', 'reçue', '2026-11-20 11:45:00', 8, NULL, 7);