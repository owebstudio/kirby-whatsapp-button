<?php

/**
 * @var array|null $options Options that overwrite the plugin options
 */

$whatsappButton = new Owebstudio\WhatsappButton\WhatsappButton(kirby(), $options ?? []);
?>
<?php if ($whatsappButton->isEnabled() === true): ?>
    <div <?= attr(['class' => 'whatsappButton', 'data-whatsapp-button' => json_encode($whatsappButton->config())]) ?>></div>

    <?= css($whatsappButton->asset('whatsapp-button.css')) ?>
    <?= js($whatsappButton->asset('whatsapp-button.js'), ['defer' => true]) ?>
<?php endif ?>
