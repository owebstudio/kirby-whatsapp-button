<?php

namespace Owebstudio\WhatsappButton;

use Closure;
use DateTimeZone;
use Exception;
use Kirby\Cms\App;
use Kirby\Cms\Page;
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
        'offlineMessages',
        'offlineStatus',
        'placeholder',
        'sendLabel',
        'status'
    ];

    /**
     * Options that can contain page placeholders
     */
    public const PLACEHOLDERS = [
        'defaultMessage',
        'messages',
        'offlineMessages',
        'placeholder'
    ];

    protected array|null $resolved = null;

    public function __construct(
        protected App $kirby,
        protected array $options = [],
        protected Page|null $page = null
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
                'status' => $agent['status'] ?? null,
                'hours'  => $this->hours($agent['hours'] ?? $options['hours'] ?? [])
            ], fn ($value) => $value !== null && $value !== '');
        }

        return $list;
    }

    /**
     * Converts the office hours to a list of
     * `[day, from, to]` with the ISO day of the week
     * and the minutes since midnight
     *
     * Accepts days or day ranges as keys with time ranges as values
     * (`'mon-fri' => '09:00-12:00, 13:00-17:00'`) and a list of
     * entries with `days`, `from` and `to` (Panel structure field)
     */
    public function hours(array|string|null $hours): array
    {
        $list = [];

        foreach ((array)$hours as $key => $value) {
            if (is_array($value) === true && isset($value['days']) === true) {
                $days   = $value['days'];
                $ranges = [($value['from'] ?? '') . '-' . ($value['to'] ?? '')];
            } else {
                $days   = $key;
                $ranges = is_array($value) === true ? $value : explode(',', (string)$value);
            }

            foreach ($this->days($days) as $day) {
                foreach ($ranges as $range) {
                    $times = explode('-', (string)$range);
                    $from  = $this->minutes($times[0] ?? '');
                    $to    = $this->minutes($times[1] ?? '');

                    if ($from === null || $to === null) {
                        continue;
                    }

                    // a range that ends before it starts continues on the next day
                    if ($to <= $from) {
                        $list[] = [$day, $from, 1440];

                        if ($to > 0) {
                            $list[] = [$day % 7 + 1, 0, $to];
                        }

                        continue;
                    }

                    $list[] = [$day, $from, $to];
                }
            }
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
        $config['agents']   = $this->agents();
        $config['timezone'] = $this->timezone();

        foreach (static::PLACEHOLDERS as $key) {
            $config[$key] = $this->placeholders($config[$key]);
        }

        unset($config['enabled'], $config['phone'], $config['hours']);

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

    /**
     * Replaces `{{ page.title }}`, `{{ page.url }}`, `{{ site.title }}`
     * and `{{ site.url }}` in a text or a list of texts. Other queries
     * are not resolved, because the texts can come from the Panel.
     */
    public function placeholders(array|string $text): array|string
    {
        if (is_array($text) === true) {
            return array_map(fn ($item) => $this->placeholders((string)$item), $text);
        }

        $site   = $this->kirby->site();
        $page   = $this->page ?? $site->page();
        $values = [
            'page.title' => $page?->title()->value() ?? '',
            'page.url'   => $page?->url() ?? '',
            'site.title' => $site->title()->value(),
            'site.url'   => $site->url()
        ];

        return preg_replace_callback(
            '/\{\{\s*(page|site)\.(title|url)\s*\}\}/',
            fn ($matches) => $values[$matches[1] . '.' . $matches[2]],
            $text
        );
    }

    /**
     * Time zone of the office hours
     */
    public function timezone(): string
    {
        $timezone = $this->options()['timezone'] ?? null;

        try {
            return (new DateTimeZone($timezone ?? date_default_timezone_get()))->getName();
        } catch (Exception) {
            return date_default_timezone_get();
        }
    }

    /**
     * ISO days of the week for `mon`, `mon-fri`,
     * `sat, sun` or a list of day names
     */
    protected function days(array|string|int $days): array
    {
        $names = ['mon' => 1, 'tue' => 2, 'wed' => 3, 'thu' => 4, 'fri' => 5, 'sat' => 6, 'sun' => 7];
        $list  = [];

        foreach (is_array($days) === true ? $days : explode(',', (string)$days) as $day) {
            $range = explode('-', strtolower(trim((string)$day)));
            $start = $names[substr(trim($range[0]), 0, 3)] ?? null;
            $end   = $names[substr(trim($range[1] ?? $range[0]), 0, 3)] ?? null;

            if ($start === null || $end === null) {
                continue;
            }

            // ranges can wrap around the end of the week (`fri-mon`)
            for ($day = $start; true; $day = $day % 7 + 1) {
                $list[] = $day;

                if ($day === $end) {
                    break;
                }
            }
        }

        return array_values(array_unique($list));
    }

    /**
     * Minutes since midnight for `9`, `09:00` or `09:00:00`
     */
    protected function minutes(string $time): int|null
    {
        if (preg_match('/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?$/', trim($time), $matches) !== 1) {
            return null;
        }

        $minutes = (int)$matches[1] * 60 + (int)($matches[2] ?? 0);

        return $minutes <= 1440 ? $minutes : null;
    }
}
