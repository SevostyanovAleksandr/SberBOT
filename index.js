const TelegramBot = require('node-telegram-bot-api');
const token = '7035543762:AAGR1qM7bt73_G4Pd4QZUF-lCGZUAB5xmXA';
const bot = new TelegramBot(token, {
    polling: true
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет! Пожалуйста, введите свое имя в формате: Имя и Фамилия');
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    const messageArray = messageText.split(' ');
   // const user_id = '@ENigmaA9';


    if (messageArray.length === 2) {
        const [firstName, lastName] = messageArray;
        const message = `Данные приняты! Имя: ${firstName} Фамилия: ${lastName}`;; // Замените @username на фактическое имя пользователя
        bot.sendMessage(chatId , message)


    } else {
        bot.sendMessage(chatId, 'Неверный формат! Пожалуйста, введите данные в формате: Имя Фамилия');
    }
});


bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Доступные команды: /start, /help');
});

// const fetch = import('node-fetch');

// const BOT_TOKEN = '7035543762:AAGR1qM7bt73_G4Pd4QZUF-lCGZUAB5xmXA';
// const CHAT_ID = '@ENigmaA9'; // ID пользователя или группы

// async function sendMessage(message) {
//   const url = https://api.telegram.org/bot${BOT_TOKEN}/sendMessage;
//   const params = new URLSearchParams({
//     chat_id: CHAT_ID,
//     text: message,
//   });

//   try {
//     const response = await (await fetch).default(${url}?${params.toString()});
//     const data = await response.json();
//     console.log(data);
//   } catch (error) {
//     console.error('Error sending message:', error);
//   }
// }

// sendMessage('Привет, это сообщение отправлено с помощью бота Telegram!');