-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 12, 2019 at 03:46 AM
-- Server version: 8.0.15
-- PHP Version: 7.3.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `loginsystem`
--

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` text,
  `user` int(11) DEFAULT NULL,
  `done` tinyint(4) DEFAULT NULL,
  `created` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `user`, `done`, `created`) VALUES
(13, 'second user', 2, 0, '2019-04-09 02:07:28'),
(14, 'something else', 2, 1, '2019-04-09 02:07:32'),
(16, 'first user', 1, 1, '2019-04-09 02:08:10'),
(17, 'some other third thing for the second user', 2, 0, '2019-04-09 02:11:52'),
(20, 'From mobile', 1, 0, '2019-04-09 03:26:31'),
(22, 'TBE', 5, 0, '2019-04-10 04:13:28'),
(26, 'wae', 6, 1, '2019-04-11 03:32:00'),
(28, 'asdas', 6, 0, '2019-04-11 03:32:07'),
(29, 'asdas', 1, 0, '2019-04-11 05:51:16'),
(30, 'Something from Routes', 1, 0, '2019-04-11 21:04:54'),
(31, 'asdas', 7, 0, '2019-04-11 21:05:36');

-- --------------------------------------------------------

--
-- Table structure for table `pwdreset`
--

CREATE TABLE `pwdreset` (
  `id` int(11) NOT NULL,
  `email` text NOT NULL,
  `selector` text NOT NULL,
  `token` longtext NOT NULL,
  `expires` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `uid` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `pwd` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uid`, `email`, `pwd`) VALUES
(1, 'ddl1nz1mon', 'dcody12@hotmail.com', '$2b$10$kO7tjpJfR7/Ms6ZEndERUuOmrlCvjGV2Ml5lybNtKrBFfu0N7Z4ie'),
(2, 'seconduser', 'second@gmail.com', '$2y$10$q07s296xmdpzTwlJUvYoOO9z7z99EY2Yk8ku7/0HVk31Une8nprHq'),
(3, 'testuser', 'someemail@gmail.com', '$2y$10$ugHtGKc23wO5k5wu1iOslOvp6Vz7E0geJFGbafHZ1pf2MLoxq2SiK'),
(4, 'asdas', 'asdas@gmail.com', '$2y$10$FM3vwZLmF1vGO7CiQlfrSOShMJu7dinVuM1fyrXAke/ksn75ly6cm'),
(5, 'TheBetterEnvy', 'whatshouldprowerplay@gmail.com', '$2y$10$ZrX2zGwDTSqAMS5C450w1e0XREOqhW3nXx.CYzwezBFyhPqAHeYaK'),
(6, 'testnodejs', 'node@gmail.com', '$2b$10$szj5Zvpwk1d8xKxOaYMIzOUNCfqzmVhJz/9F7A4GGcSiH/stgzgdy'),
(7, 'onemoreuser', 'some@email.com', '$2b$10$p/clPt4XPENkAMYuCS6cqu2o65bethYUfIIYpnMIXmYo5lmipO2om');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pwdreset`
--
ALTER TABLE `pwdreset`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `pwdreset`
--
ALTER TABLE `pwdreset`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
