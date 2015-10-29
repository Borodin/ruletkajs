var Lang = {};

/**
 * Язык по умолчанию, он будет выбран,
 * если в словаре нет нужного языка.
 *
 * @type {String}
 */
Lang.default = 'en';

/**
 * Словарь враз на нескольких языхах
 * коды языков ISO 639-1
 *
 * @type {Object}
 */
Lang.dictionary = {
    'next': {
        'en': 'Next',
        'ru': 'Далее'
    },
    'stop': {
        'en': 'Stop',
        'ru': 'Стоп'
    },
    'start': {
        'en': 'Start',
        'ru': 'Старт'
    },
    'audio': {
        'en': 'Audio',
        'ru': 'Аудио'
    },
    'video': {
        'en': 'Video',
        'ru': 'Видео'
    },
    'option': {
        'en': 'Option',
        'ru': 'Опции'
    },
    'report': {
        'en': 'Report abuse',
        'ru': 'Сообщить о нарушении'
    },
    'log_start': {
        'en': 'Click "Start" to start a video chat with a random person.',
        'ru': 'Нажмите кнопку «Старт», чтобы начать видеочат с случайным человеком.'
    },
    'log_get_stream': {
        'en': 'Allow this site to use your camera.',
        'ru': 'Разрешите этому сайту использовать вашу камеру.'
    },
    'log_search': {
        'en': 'Search companion...',
        'ru': 'Идет поиск собеседника...'
    },
    'log_leave': {
        'en': 'The caller left a chat.',
        'ru': 'Ваш собеседник покинул видеочат.'
    },
    'log_next': {
        'en': 'The caller clicked "Next"',
        'ru': 'Ваш собеседник нажал «Далее»'
    },
    'log_clouse_conecting': {
        'en': 'Clouse conecting.',
        'ru': 'Вы отключились от сервера.'
    },
    'log_clouse_disconected': {
        'en': 'Server disconected.',
        'ru': 'Соединение с сервером разорвано.'
    },
    'log_socket_error': {
        'en': 'Socket Error.',
        'ru': 'Ошибка Socket соединения'
    },
    'log_no_conection': {
        'en': 'Server not connected',
        'ru': 'Соединение с сервером не установлено'
    },
    'log_stream_error': {
        'en': 'Stream error, you need access to the camera',
        'ru': 'Ошибка получения потока, необходим доступ к камере'
    },
    'log_partner_conected': {
        'en': 'The connection is established with the interlocutor.',
        'ru': 'Соединение с собеседником установлено.'
    },
    'log_webrtc_error': {
        'en': 'WebRTC Error',
        'ru': 'Ошибка WebRTC'
    },
    'camera-on': {
        'en': 'Turn on the camera',
        'ru': 'Включите камеру'
    },
    'flip_video': {
        'en': 'Flip video',
        'ru': 'Отразить видео'
    },
    'smile_people': {
        'en': 'People',
        'ru': 'Люди'
    },
    'smile_nature': {
        'en': 'Nature',
        'ru': 'Природа'
    },
    'smile_food': {
        'en': 'Food & Drink',
        'ru': 'Еда и Напитки'
    },
    'smile_celebration': {
        'en': 'Celebration',
        'ru': 'Праздник'
    },
    'smile_activity': {
        'en': 'Activity',
        'ru': 'Мероприятия'
    },
    'smile_travel': {
        'en': 'Travel & Places',
        'ru': 'Путешествия и Места'
    },
    'smile_objects': {
        'en': 'Objects & Symbols',
        'ru': 'Объекты и Символы'
    }
};

/**
 * Устанавливает язык на тот, что указан в первом параметре,
 * или из тега <html lang>,
 * или navigator.language
 * или navigator.userLanguage (EI)
 * или на русский "ru"
 *
 * @param {String} language ISO 639-1 Код языка
 * @return {String} Возвращает ISO 639-1 код установленного языка
 */
Lang.setLanguage = function(language) {
    this.language = (
        language                      ||
        document.documentElement.lang ||
        navigator.language            ||
        navigator.userLanguage        ||
        this.default
    ).split('-')[0];

    return this.language;
};

/**
 * Преобразует Языковой объект во вразу установленного языка.
 * Если фразы нужного языка нет, то возвращает враузу языка по умолчанию.
 * Если передан не объект, то возвращает его без преобразований.
 *
 * @param  {Object} value Языковой объект или строка
 * @return {String}       Фразу установленного языка
 */
Lang.translate = function(value) {
    if (typeof value === 'object') {
        return value[this.language] || value[this.default];
    } else {
        return value;
    }
};

/**
 * Возвращает фразу по ключу из словаря
 *
 * @param  {String} key Ключ фразы в словаре
 * @return {String}     Фраза из словаря
 */
Lang.get = function(key) {
    if (Lang.dictionary[key]) {
        return this.translate(this.dictionary[key]);
    } else {
        return '[' + key + ']';
    }
};
