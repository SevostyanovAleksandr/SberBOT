const TelegramBot = require('node-telegram-bot-api');
const token = '7035543762:AAGR1qM7bt73_G4Pd4QZUF-lCGZUAB5xmXA';
const bot = new TelegramBot(token, {
    polling: true
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добрый день, Сберахолка на связи! \nДля попадания в канал вы должны быть сотрудником СБЕРа и написать сюда \n⚡️В ОДНОМ СООБЩЕНИИ!⚡️  фамилии имени отчетсва и сберовскую почту . (ДЗО тоже подходит)  \nЕсли вдруг, бот говорит, что вы не то отправляете, подайте заново! Нужно всего одно сообщение с ФИО и почтой!');
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    const messageArray = messageText.split(' ');
   // const user_id = '@ENigmaA9';


    if (messageArray.length === 4) {
        const [firstName, lastName, otchestvo, email] = messageArray;
        const message = `Данные приняты! \nФИО: ${firstName} ${lastName} ${otchestvo} \nПочта: ${email}`;// Замените @username на фактическое имя пользователя
        bot.sendMessage(chatId , message)


    } else {
        bot.sendMessage(chatId, 'Неверный формат! \nПожалуйста, введите данные в формате ФИО и внешней почты');
    }
});


bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Доступные команды: /start, /help');
});
