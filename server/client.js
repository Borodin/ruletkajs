
var lorem = require('./config/lorem');

var clients = {};

var Client = function(socket) {
    this.id = Math.random().toString(16).split('.')[1];
    this.socket = socket;
    this.partner = false;
    this.previousPartner = [];

    var _this = this;

    this.socket.on('message', function(message) {
        message = JSON.parse(message);
        var type = message.type;
        var content = message.content;

        if (type == 'next') {
            _this.next();
        }else if (type == 'webrtc') {
            _this.partner.send(type, content);
        }else if (type == 'message') {
            _this.sendMessage(content);
        }
    });

    this.socket.on('close', function() {
        _this.close();
    });

    clients[this.id] = this;
};

/**
 * Получить свободного пользователя
 *
 * @return {Client} возвращает случайного свободного клиента
 */
Client.prototype.getFreeClient = function() {
    var free = [];

    for (var key in clients) {
        if (!clients[key].partner &&
            clients[key].id != this.id &&
            clients[key].id != this.previousPartner[0]) {
            free.push(clients[key]);
        }
    }

    return free[free.length * Math.random() << 0] || false;
};

/**
 * Соединяет клиента, со следующем случайным клиентом
 */
Client.prototype.next = function() {
    if (this.partner) {
        this.partner.send('next');
    }
    this.part();
    this.join(this.getFreeClient());
};

/**
 * Разъединяет клиента с его собеседником
 */
Client.prototype.part = function() {
    if (this.partner) {
        var partner = this.partner;
        this.partner = false;
        partner.part();
    }
};

/**
 * Подключает к клиенту другого клиента
 *
 * @param  {Client} client Клиент, которого нужно подключить
 * @param  {Boolean} join   Подключить, собеседника?
 */
Client.prototype.join = function(client, join) {
    if (client) {
        this.partner = client;
        this.send(join ? 'conect' : 'join', this.partner.id);
        this.previousPartner.unshift(this.partner.id);
        if (!join) {
            this.partner.join(this, true);
        }
    }
};

/**
 * Отправляет сообщение напарнику
 *
 * @param  {String} type    Тип сообщения
 * @param  {Object} content Содержимое сообщения
 */
Client.prototype.send = function(type, content) {
    if (this.socket.readyState == 1) {
        this.socket.send(JSON.stringify({
            type: type,
            content: content || false
        }));
    }
};

/**
 *
 */
Client.prototype.sendMessage = function(message) {
    if (message) {
        message = message.substr(-1024);
        this.send('message', {text: message, author: 'your'});
        if (message[0] == '/') {
            this.send('message', {text: this.console(message), author: 'system'});
        } else if (this.partner) {
            this.partner.send('message', {text: message, author: 'partner'});
        }
    }
};

/**
 *
 */
Client.prototype.console = function(message) {
    var command = message.substr(1).split(' ');
    switch (command[0]) {
        case 'id': return 'Your ID: ' + this.id;
        case 'date': return 'Date: ' + (new Date());
        case 'uptime': return 'Uptime: ' + this.getUpTime();
        case 'help': return '/id — get your ID\n/date\n/help\n/uptime\n/status\n/lorem — History demo\n/github';
        case 'lorem': return this.lorem();
        case 'github': return 'GitHub - https://github.com/Borodin/ruletkajs';
        case 'status': return Object.keys(clients).length + ' Users online';
        default: return 'Command "' + message + '" not found, use /help';
    }
};

/**
 *
 */
Client.prototype.getUpTime = function() {
    var uptime = process.uptime();

    var hours = Math.floor(uptime / (60 * 60));
    var minutes = Math.floor(uptime % (60 * 60) / 60);
    var seconds = Math.floor(uptime % 60);

    return ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
};


/**
 *
 */
Client.prototype.lorem = function() {
    for (var i = 0; i < lorem.length; i++) {
        this.send('message', lorem[i]);
    }
    return 'Lorem end.';
};

/**
 * Разрывает связь и удаляет клиента
 */
Client.prototype.close = function() {
    console.log('clouse conecting ' + this.id);
    if (this.partner) {
        this.partner.send('leave');
    }
    this.part();
    delete clients[this.id];
};

module.exports = Client;
