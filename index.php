<?php

use Kirby\Cms\App as Kirby;

Kirby::plugin('clicktonext/whatsapp-button', [
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
        'name' => site()->title()->value(),
        'avatar' => 'https://ui-avatars.com/api/?background=25D366&color=fff&name=' . rawurlencode(site()->title()->value()),
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
