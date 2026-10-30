# 💬 Kirby WhatsApp Button

This is a very simple floating WhatsApp button plugin for Kirby.

![preview](https://user-images.githubusercontent.com/3393422/156775716-75ccee3b-2d3c-4bce-9811-85f462d570a0.png)

## Requirements

- Kirby 3.4+, 4 or 5

## Installation

1. Download the latest release
2. Unzip downloaded file
3. Copy/paste unzipped folder in your `/site/plugins` folder

## Usage

You can use sample basic snippet of plugin:

```php
<?php snippet('whatsapp-button') ?>
```

## Options

The default values of the package are:

| Option  | Type              | Default                     | Description                                                             |
|:--------|:------------------|:----------------------------|:------------------------------------------------------------------------|
| enabled | bool&#124;closure | true                        | Enable/disable the button                                               |
| phone   | string            |                             | Whatsapp number (required)                                              |
| position    | string            | right                       | Button position (left-right)                                            |
| showBadge  | bool              | true                        | Enable/disable badge of button                                          |
| countBadge  | int               | 1                           | Badge text of button                                                    |
| timeoutBadge  | int               | 1500                        | Badge delay time (ms)                                                   |
| alwaysOpen  | bool              | false                       | Sets chat window whether to be always on                                |
| alwaysOpenTimeout  | int               | 2500                        | After the specified time (ms), chat window will always open             |
| autoOpen  | bool              | true                        | Chat window opens automatically                                         |
| autoOpenTimeout  | int               | 5000                        | After the specified time (ms), the chat window opens automatically      |
| doNotDisturb  | bool              | false                       | When enabled chat window will not open automatically on every page load |
| name   | string            | Site title                  | Shows your/site name in the header of the chat window                  |
| avatar   | string            | Placeholder of site title   | Show your/site image in the header of the chat window                   |
| status   | string            | online                      | Show status text under the name                                         |
| showStatus   | bool              | true                        | Enable/disable the status text                                          |
| messages   | string&#124;array | Hello, how can we help you? | Preloaded messages when the chat window is opened                       |
| placeholder   | string            | Type here...                | Placeholder of input in the chat window                                 |
| defaultMessage   | string            | Hello                       | Text to be sent to WhatsApp API if user leaves input blank              |

All the values can be updated in the `config.php` file and prefixed with `owebstudio.whatsapp-button.`

## Sample options

```php
<?php

// /site/config/config.php
return [
    'owebstudio.whatsapp-button' => [
        'phone' => '4912345678',
    ]
];
```

### Conditional button

```php
<?php

// /site/config/config.php
return [
    'debug' => true,
    'owebstudio.whatsapp-button' => [
        'phone' => '4912345678',
        'enabled' => function () {
            // enabled only weekdays and 08:00-17:00
            return date('N') <= 5 && date('G') >= 8 && date('G') <= 17;
        },
    ],
];
```

### Multiple messages

```php
<?php

// /site/config/config.php
return [
    'debug' => true,
    'owebstudio.whatsapp-button' => [
        'phone' => '4912345678',
        'messages' => [
            'Welcome to our site!', 
            'How can I help you?'
        ],
    ],
];
```

### Overwrite options on fly

```php
<?php 
    snippet('whatsapp-button', ['options' => [
        'name' => 'John Doe', 
        'phone' => '4912345678'
    ]]) 
?>
```
