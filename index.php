<?php

use Kirby\Cms\App as Kirby;

load([
    'Owebstudio\\WhatsappButton\\WhatsappButton' => 'src/WhatsappButton.php'
], __DIR__);

Kirby::plugin('owebstudio/whatsapp-button', [
    'options' => [
        'enabled' => true,
        'phone' => '',
        'position' => 'right',
        'showBadge' => true,
        'countBadge' => 1,
        'timeoutBadge' => 1500,
        'alwaysOpen' => false,
        'alwaysOpenTimeout' => 2500,
        'autoOpen' => true,
        'autoOpenTimeout' => 5000,
        'doNotDisturb' => false,
        'name' => null,
        'avatar' => null,
        'status' => null,
        'showStatus' => true,
        'messages' => null,
        'placeholder' => null,
        'defaultMessage' => null,
        'buttonLabel' => null,
        'sendLabel' => null,
        'backLabel' => null,
        'agents' => [],
        'hours' => [],
        'timezone' => null,
        'outsideHours' => 'offline',
        'offlineStatus' => null,
        'offlineMessages' => null,
    ],
    'snippets' => [
        'whatsapp-button' => __DIR__ . '/snippets/whatsapp-button.php'
    ],
    'translations' => [
        'de' => require __DIR__ . '/translations/de.php',
        'en' => require __DIR__ . '/translations/en.php',
        'tr' => require __DIR__ . '/translations/tr.php'
    ]
]);
