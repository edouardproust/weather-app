<?php
$title = 'Weather app';
require 'config.php';

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- app -->
    <link rel="stylesheet" href="<?= APP_PATH ?>style.css">
    <script defer type='module' src="<?= APP_PATH ?>app.js"></script>
    <!-- fonts -->
    <link rel="stylesheet" href="<?= APP_PATH ?>lib/fonts/montserrat/montserrat.css">
    <!-- libs -->
    <link rel="stylesheet" href="<?= APP_PATH ?>lib/fonts/weather-icons/all.css">
    <link rel="stylesheet" href="<?= APP_PATH ?>components/popup/popup.css">
    <link rel="stylesheet" href="<?= APP_PATH ?>components/tooltip/tooltip.css">
    <script defer src="<?= APP_PATH ?>lib/js/gsap/gsap.min.js"></script>
    <script defer src="<?= APP_PATH ?>lib/js/lottie.min.js"></script>

    <title><?= $title ?></title>
</head>

<body>

    <section id='weather-app'>
        <div class="section-overlay"></div>
        <div class="data-container">
            <h1 class="city">
                <span class="city-data text-shadow" contenteditable="true"></span>
            </h1>
            <div class="icon-data text-shadow"></div>
            <div class="details">
                <div class="temp">
                    <span class="temp-data text-shadow"></span><span class="temp-unit text-shadow"></span>
                </div>
                <div class="desc-data text-shadow"></div>
            </div>
        </div>
    </section>

</body>

</html>