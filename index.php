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
        'status' => 'online',
        'showStatus' => true,
        'messages' => 'Hello, how can we help you?',
        'placeholder' => 'Type here...',
        'defaultMessage' => 'Hello',
    ],
    'snippets' => [
        'whatsapp-button' => __DIR__ . '/snippets/whatsapp-button.php'
    ]
]);
