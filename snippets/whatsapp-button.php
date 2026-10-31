<?php

// overwrite to default options
$whatsappButtonOptions = array_filter(
    array_replace(option('owebstudio.whatsapp-button', []), $options ?? []),
    function ($value) {
        return $value !== null;
    }
);

// resolve the site title on render, when all plugins and the current language are loaded
$whatsappButtonOptions['name'] ??= site()->title()->value();

// allow callable
$whatsappButtonEnabled = $whatsappButtonOptions['enabled'] ?? true;
if (is_a($whatsappButtonEnabled, 'Closure') === true) {
    $whatsappButtonEnabled = $whatsappButtonEnabled($whatsappButtonOptions);
}

// the widget itself doesn't need the condition
unset($whatsappButtonOptions['enabled']);
?>

<?php if ($whatsappButtonEnabled === true && empty($whatsappButtonOptions['phone']) === false): ?>
    <div <?= attr(['class' => 'whatsappButton', 'data-whatsapp-button' => json_encode($whatsappButtonOptions)]) ?>></div>

    <?php $whatsappButtonPlugin = kirby()->plugin('owebstudio/whatsapp-button') ?>
    <?= css($whatsappButtonPlugin->asset('whatsapp-button.css')->url()) ?>
    <?= js($whatsappButtonPlugin->asset('whatsapp-button.js')->url(), ['defer' => true]) ?>
<?php endif ?>
