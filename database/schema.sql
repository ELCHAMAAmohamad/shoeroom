-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 11, 2026 at 12:48 AM
-- Server version: 10.11.16-MariaDB
-- PHP Version: 8.3.36

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shoeroom`
--

-- --------------------------------------------------------

--
-- Table structure for table `creations_atelier`
--

CREATE TABLE `creations_atelier` (
  `id_crea` int(11) NOT NULL,
  `nom_crea` varchar(100) NOT NULL DEFAULT 'Ma création',
  `couleur_arriere_crea` int(11) NOT NULL,
  `couleur_milieu_crea` int(11) NOT NULL,
  `couleur_avant_crea` int(11) NOT NULL,
  `couleur_bout_crea` int(11) NOT NULL,
  `couleur_semelle_crea` int(11) NOT NULL,
  `couleur_lacets_crea` int(11) NOT NULL,
  `size_crea` decimal(3,1) NOT NULL,
  `date_crea` datetime NOT NULL DEFAULT current_timestamp(),
  `id_modele_crea` int(11) NOT NULL,
  `id_util_crea` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `creations_atelier`
--
ALTER TABLE `creations_atelier`
  ADD PRIMARY KEY (`id_crea`),
  ADD KEY `couleur_arriere_crea` (`couleur_arriere_crea`),
  ADD KEY `couleur_milieu_crea` (`couleur_milieu_crea`),
  ADD KEY `couleur_avant_crea` (`couleur_avant_crea`),
  ADD KEY `couleur_bout_crea` (`couleur_bout_crea`),
  ADD KEY `couleur_semelle_crea` (`couleur_semelle_crea`),
  ADD KEY `couleur_lacets_crea` (`couleur_lacets_crea`),
  ADD KEY `id_modele_crea` (`id_modele_crea`),
  ADD KEY `id_util_crea` (`id_util_crea`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `creations_atelier`
--
ALTER TABLE `creations_atelier`
  MODIFY `id_crea` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `creations_atelier`
--
ALTER TABLE `creations_atelier`
  ADD CONSTRAINT `creations_atelier_ibfk_1` FOREIGN KEY (`couleur_arriere_crea`) REFERENCES `couleurs_atelier` (`id_col_ate`),
  ADD CONSTRAINT `creations_atelier_ibfk_2` FOREIGN KEY (`couleur_milieu_crea`) REFERENCES `couleurs_atelier` (`id_col_ate`),
  ADD CONSTRAINT `creations_atelier_ibfk_3` FOREIGN KEY (`couleur_avant_crea`) REFERENCES `couleurs_atelier` (`id_col_ate`),
  ADD CONSTRAINT `creations_atelier_ibfk_4` FOREIGN KEY (`couleur_bout_crea`) REFERENCES `couleurs_atelier` (`id_col_ate`),
  ADD CONSTRAINT `creations_atelier_ibfk_5` FOREIGN KEY (`couleur_semelle_crea`) REFERENCES `couleurs_atelier` (`id_col_ate`),
  ADD CONSTRAINT `creations_atelier_ibfk_6` FOREIGN KEY (`couleur_lacets_crea`) REFERENCES `couleurs_atelier` (`id_col_ate`),
  ADD CONSTRAINT `creations_atelier_ibfk_7` FOREIGN KEY (`id_modele_crea`) REFERENCES `modeles` (`id_modele`) ON DELETE CASCADE,
  ADD CONSTRAINT `creations_atelier_ibfk_8` FOREIGN KEY (`id_util_crea`) REFERENCES `utilisateurs` (`id_util`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
