<?php

namespace Owebstudio\WhatsappButton;

use Closure;
use Kirby\Cms\App;

/**
 * Resolves the options of a widget
 * and the data for its snippet
 */
class WhatsappButton
{
    protected array|null $resolved = null;

    public function __construct(
        protected App $kirby,
        protected array $options = []
    ) {
    }

    /**
     * URL of a plugin asset with a hash for cache busting
     */
    public function asset(string $path): string
    {
        return $this->kirby->plugin('owebstudio/whatsapp-button')->asset($path)->url();
    }

    /**
     * Options for the widget script
     */
    public function config(): array
    {
        $config = $this->options();

        unset($config['enabled']);

        return $config;
    }

    public function isEnabled(): bool
    {
        $options = $this->options();
        $enabled = $options['enabled'] ?? true;

        if ($enabled instanceof Closure) {
            $enabled = $enabled($options);
        }

        return $enabled === true && empty($options['phone']) === false;
    }

    /**
     * Plugin options, overwritten by the options of the snippet
     */
    public function options(): array
    {
        if ($this->resolved !== null) {
            return $this->resolved;
        }

        $options = array_filter(
            array_replace($this->kirby->option('owebstudio.whatsapp-button', []), $this->options),
            fn ($value) => $value !== null
        );

        // resolve the site title on render, when all plugins and the current language are loaded
        $options['name'] ??= $this->kirby->site()->title()->value();

        return $this->resolved = $options;
    }
}
