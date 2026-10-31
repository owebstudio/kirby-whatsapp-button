<?php

namespace Owebstudio\WhatsappButton;

use Closure;
use Kirby\Cms\App;
use Kirby\Toolkit\I18n;

/**
 * Resolves the options of a widget
 * and the data for its snippet
 */
class WhatsappButton
{
    /**
     * Options with a default text in the plugin translations
     */
    public const TEXTS = [
        'backLabel',
        'buttonLabel',
        'defaultMessage',
        'messages',
        'placeholder',
        'sendLabel',
        'status'
    ];

    protected array|null $resolved = null;

    public function __construct(
        protected App $kirby,
        protected array $options = []
    ) {
    }

    /**
     * Agents with a phone number; without the `agents`
     * option, the options are the only agent
     */
    public function agents(): array
    {
        $options = $this->options();
        $agents  = $options['agents'] ?? [];
        $list    = [];

        if (empty($agents) === true) {
            $agents = [$options];
        }

        foreach ($agents as $agent) {
            if (empty($agent['phone']) === true) {
                continue;
            }

            $list[] = array_filter([
                'name'   => (string)($agent['name'] ?? $agent['phone']),
                'phone'  => (string)$agent['phone'],
                'avatar' => $agent['avatar'] ?? null,
                'status' => $agent['status'] ?? null
            ], fn ($value) => $value !== null && $value !== '');
        }

        return $list;
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
        $config['agents'] = $this->agents();

        unset($config['enabled'], $config['phone']);

        return $config;
    }

    public function isEnabled(): bool
    {
        $options = $this->options();
        $enabled = $options['enabled'] ?? true;

        if ($enabled instanceof Closure) {
            $enabled = $enabled($options);
        }

        return $enabled === true && $this->agents() !== [];
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

        foreach (static::TEXTS as $key) {
            $options[$key] ??= I18n::translate('owebstudio.whatsapp-button.' . $key);
        }

        return $this->resolved = $options;
    }
}
