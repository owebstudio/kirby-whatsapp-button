<?php

// overwrite to default options
$whatsappButtonOptions = array_replace(option('owebstudio.whatsapp-button', []), $options ?? []);
array_filter($whatsappButtonOptions, function ($value) {
    return $value !== null;
});

// resolve the site title on render, when all plugins and the current language are loaded
$whatsappButtonOptions['name'] ??= site()->title()->value();
$whatsappButtonOptions['avatar'] ??= 'https://ui-avatars.com/api/?background=25D366&color=fff&name=' . rawurlencode($whatsappButtonOptions['name']);

// allow callable
$whatsappButtonEnabled = $whatsappButtonOptions['enabled'] ?? true;
if (is_a($whatsappButtonEnabled, 'Closure') === true) {
    $whatsappButtonEnabled = $whatsappButtonEnabled($whatsappButtonOptions);
}
?>

<?php if ($whatsappButtonEnabled === true && empty($whatsappButtonOptions['phone']) === false): ?>
    <div id="whatsapp-button"></div>

    <?php $whatsappButtonPlugin = kirby()->plugin('owebstudio/whatsapp-button') ?>
    <?= css($whatsappButtonPlugin->asset('whatsapp-button.css')->url()) ?>
    <?= js($whatsappButtonPlugin->asset('whatsapp-button.js')->url()) ?>

    <script>
        new WhatsappButton("whatsapp-button", <?= json_encode($whatsappButtonOptions, JSON_HEX_TAG) ?>).init();
    </script>
<?php endif ?>
