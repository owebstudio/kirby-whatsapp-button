<?php

// overwrite to default options
$whatsappButtonOptions = array_replace(option('owebstudio.whatsapp-button', []), $options ?? []);
array_filter($whatsappButtonOptions, function ($value) {
    return $value !== null;
});

// allow callable
$whatsappButtonEnabled = $whatsappButtonOptions['enabled'] ?? true;
if (is_a($whatsappButtonEnabled, 'Closure') === true) {
    $whatsappButtonEnabled = $whatsappButtonEnabled($whatsappButtonOptions);
}
?>

<?php if ($whatsappButtonEnabled === true && empty($whatsappButtonOptions['phone']) === false): ?>
    <div id="whatsapp-button"></div>

    <?= css('media/plugins/owebstudio/whatsapp-button/css/whatsappButton.min.css') ?>
    <?= js('media/plugins/owebstudio/whatsapp-button/js/whatsappButton.min.js') ?>

    <script>
        new WhatsappButton("whatsapp-button", <?= json_encode($whatsappButtonOptions) ?>).init();
    </script>
<?php endif ?>
