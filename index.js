const TelegramBot = require('node-telegram-bot-api');
const token = '7035543762:AAGR1qM7bt73_G4Pd4QZUF-lCGZUAB5xmXA';
const bot = new TelegramBot(token, { polling: true });

const adminChatId = '@Sevotonya';
const waitingForInput = new Map();
let selectedTags = {}; // Хранение состояния выбранных тегов для каждого пользователя

const createTag = (chatId) => {
    const tags = ['Apple', 'Игры и консоль', 'Ноутбук', 'Фототехника', 'Авто', "Билет", "Детям", 'Животные', 'Мебель', 'Медицина', 'Недвижимость', 'Раритет', 'Ремонт', 'Сертификат', "Спортивное", "Стройка", 'Техника', "Халява", 'Шмотки', "Электроника"];
    return {
        reply_markup: {
            inline_keyboard: tags.map((tag, index) => [{
                text: selectedTags[chatId] && selectedTags[chatId][index] ? `✅ ${tag}` : tag,
                callback_data: `tag_${index}`
            }])
        }
    };
};
//cпособю получения тегов
function getSelectedTagsString(chatId) {
    const tags = ['Apple', 'Игры и консоль', 'Ноутбук', 'Фототехника', 'Авто', "Билет", "Детям", 'Животные', 'Мебель', 'Медицина', 'Недвижимость', 'Раритет', 'Ремонт', 'Сертификат', "Спортивное", "Стройка", 'Техника', "Халява", 'Шмотки', "Электроника"];
    if (!selectedTags[chatId]) return '';
    
    return Object.keys(selectedTags[chatId])
        .filter(index => selectedTags[chatId][index])
        .map(index => tags[index])
        .join(', ');
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добрый день, Сберахолка на связи! \\nДля попадания в канал вы должны быть сотрудником СБЕРа и написать сюда \\n⚡️В ОДНОМ СООБЩЕНИИ!⚡️ фамилии имени отчества и сберовскую почту. (ДЗО тоже подходит) \\nЕсли вдруг, бот говорит, что вы не то отправляете, подайте заново! Нужно всего одно сообщение с ФИО и почтой!');
    waitingForInput.set(chatId, true); // Устанавливаем флаг ожидания ввода
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Проверяем, ожидается ли ввод от пользователя и не является ли сообщение командой
    if (waitingForInput.get(chatId) && !messageText.startsWith('/')) {
        const messageArray = messageText.split(' ');

        if (messageArray.length >= 4) {
            const firstName = messageArray[0];
            const lastName = messageArray[1];
            const otchestvo = messageArray[2];
            const email = messageArray.slice(3).join(' '); // Объединяем остальные слова в email
            const responseMessage = `Данные приняты, ожидайте проверки данных администратором\! \nФИО: ${firstName} ${lastName} ${otchestvo} \nПочта: ${email}`;
            bot.sendMessage(chatId, responseMessage);
            waitingForInput.set(chatId, false); // Сбрасываем флаг ожидания ввода

            // Отправляем данные администратору
            const adminMessage = `Пользователь ${chatId} ввел следующие данные: \nФИО: ${firstName} ${lastName} ${otchestvo} \nПочта: ${email}`;
            bot.sendMessage(adminChatId, adminMessage).catch(error => {
                console.error(`Не удалось отправить сообщение администратору: ${error}`);
            });
        } else {
            bot.sendMessage(chatId, 'Неверный формат! \nПожалуйста, введите данные в формате ФИО и внешней почты');
        }
    }
});

// Обработка команды /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = 'Привет! Чтобы начать создание объявления - используй кнопку [Новое объявление] или команду /create. \nЯ предложу наполнить объявление текстом или фото. При этом новый текст будет заменять предыдущий, а не дополнять.Также у Телеграм есть ограничение на 10 фото в одном сообщении, поэтому не получится опубликовать объявление с большим количеством фото. \nУдалять фото нельзя, поэтому, если случайно добавлено не то фото, следует начать создание объявления заново. \nЧтобы опубликовать объявление - используй кнопку [Опубликовать] или команду /public. \nПеред публикацией я создам макет объявления и предложу подтвердить публикацию. Если все ок - жми [Да]. \nПомимо этого я пришлю сообщение об успешной публикации с ссылкой на объявление и с кнопкой его удаления. К сожалению, Телеграм не позволяет ботам удалять сообщения старше 48 часов.';
    bot.sendMessage(chatId, helpMessage);
});

// Обработка команды /create
bot.onText(/\/create/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Куплю/Продам',
                    callback_data: 'data1'
                }],
                [{
                    text: 'Сдам/Сниму',
                    callback_data: 'data2'
                }],
                [{
                    text: 'Посто вопросик',
                    callback_data: 'data3'
                }],
                [{
                    text: 'Отдам бесплатно',
                    callback_data: 'data4'
                }]
            ]
        }
    };

    bot.sendMessage(chatId, 'Выберите одну из опций:', options);
});

bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;

    if (data.startsWith('tag_')) {
        const tagIndex = parseInt(data.split('_')[1], 10);

        // Инициализация selectedTags для данного пользователя, если еще не инициализировано
        if (!selectedTags[chatId]) {
            selectedTags[chatId] = {};
        }

        // Переключение состояния тега
        selectedTags[chatId][tagIndex] = !selectedTags[chatId][tagIndex];

        // Обновление сообщения с тегами
        bot.editMessageReplyMarkup(createTag(chatId).reply_markup, {
            chat_id: chatId,
            message_id: message.message_id
        });
    } else {
        // Обработка других callback_data
        bot.sendMessage(chatId, 'Назови свою цену в рублях:').then(() => {
            // Ожидаем ответ от пользователя
            bot.once('message', (msg) => {
                const price = msg.text;

                bot.sendMessage(chatId, 'Присылай описание или фотки. Не забудь выбрать теги ниже', createTag(chatId)).then(() => {
                    // Ожидаем ответ от пользователя
                    bot.once('message', (msg) => {
                        const description = msg.text;
                        const tagsString = getSelectedTagsString(chatId);
                        
                        // Здесь можно сохранить цену и описание в базу данных или отправить администратору
                        bot.sendMessage(chatId, `Новое объявление от @${msg.from.username}:\nЦена: ${price} руб.\nОписание: ${description} Теги: ${tagsString} `);
                    });
                });
            });
        });
    }
});
// Обработка команды /public
bot.onText(/\/public/, (msg) => {
    const chatId = msg.chat.id;
    // Добавьте здесь логику для обработки команды /public
    bot.sendMessage(chatId, 'Команда /public была вызвана. Здесь будет ваша логика.');
});

// Обработка сообщений пользователей
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Проверяем, ожидается ли ввод от пользователя и не является ли сообщение командой
    if (waitingForInput.get(chatId) && !messageText.startsWith('/')) {
        const messageArray = messageText.split(' ');
        // Здесь можно обработать введенные данные
        waitingForInput.set(chatId, false); // Сбрасываем флаг ожидания ввода
    }
});