const TelegramBot = require('node-telegram-bot-api');
const token = '7035543762:AAGR1qM7bt73_G4Pd4QZUF-lCGZUAB5xmXA';
const bot = new TelegramBot(token, { polling: true });

const adminChatId = '@Sevotonya';
const waitingForInput = new Map();
let selectedTags = {}; // Хранение состояния выбранных тегов для каждого пользователя
let userSelections = {}; // Хранение выбранных опций для каждого пользователя

const createTag = (chatId) => {
    const tags = ['Apple', 'Шмотки', 'Ноутбук', 'Фототехника', 'Авто', "Билет", "Детям", 'Животные', 'Мебель', 'Медицина', 'Недвижимость', 'Раритет', 'Ремонт', 'Сертификат', "Спортивное", "Стройка", 'Техника', "Халява", 'Игры и консоль', "Электроника"];
    
    // Разделяем теги на подмассивы по 3 элемента
        
    const rows = [];
    for (let i = 0; i < tags.length; i += 3) {
        rows.push(tags.slice(i, i + 3));
    }
    return {
        reply_markup: {
            inline_keyboard: rows.map(row => row.map(tag => ({
                text: selectedTags[chatId] && selectedTags[chatId][tags.indexOf(tag)] ? `✅ ${tag}` : tag,
                callback_data: `tag_${tags.indexOf(tag)}`
            })))
        }
    };
};


//cпособю получения тегов
function getSelectedTagsString(chatId) {
    const tags = ['Apple', 'Шмотки', 'Ноутбук', 'Фототехника', 'Авто', "Билет", "Детям", 'Животные', 'Мебель', 'Медицина', 'Недвижимость', 'Раритет', 'Ремонт', 'Сертификат', "Спортивное", "Стройка", 'Техника', "Халява", 'Игры и консоль', "Электроника"];
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
                [{ text: 'Куплю/Продам', callback_data: '#Куплю/Продам'}, { text: 'Сдам/Сниму', callback_data: '#Сдам/Сниму' }],
                [{ text: 'Просто вопросик', callback_data: '#Просто вопросик' }, { text: 'Отдам бесплатно', callback_data: '#Отдам бесплатно' }]
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
        
    } 
    // if (data.startsWith('data')) {
    //     userSelections[chatId] = data; // Запоминаем выбор пользователя
    //     bot.answerCallbackQuery(callbackQuery.id)
    // }
    else {
        // Обработка других callback_data
        bot.sendMessage(chatId, 'Назови свою цену в рублях🤑 (число):').then(() => {
            // Ожидаем ответ от пользователя
            bot.once('message', (msg) => {
                const price = msg.text;

                bot.sendMessage(chatId, 'Присылай описание. Не забудь выбрать теги ниже⬇:', createTag(chatId)).then(() => {
                   //handleUserMessage(chatId);
                   let description = '';
                   let photos = [];
                   let awaitingResponse = true;
               
               
               
                   function handleMessage(responseMsg) {

                    const applyPost = {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Верно', callback_data: 'Верно'}, { text: 'Неверно', callback_data: 'Неверно' }]
                            ]
                        }
                    };
                       if (!awaitingResponse) return;
               
                       if (responseMsg.text) {
                           description = responseMsg.text;
                           bot.sendMessage (chatId, "Отлично ты добавил описание, теперь отправь фото (не более 10 штук)")
                           
                       }
               
                       if (responseMsg.photo) {
                           photos.push(responseMsg.photo[responseMsg.photo.length - 1].file_id);
                           awaitingResponse = false; // Завершаем ожидание после получения текста
                       }
               
                       if (!awaitingResponse) {
                           const tagsString = getSelectedTagsString(chatId);
               
                           let mediaGroup = photos.map((photo) => ({
                               type: 'photo',
                               media: photo
                           }));
               
                           if (mediaGroup.length || responseMsg.text > 0 ) {
                               bot.sendMediaGroup(chatId, mediaGroup).then(() => {
                                   bot.sendMessage(chatId, `Новое объявление от @${responseMsg.from.username}:\nОписание: ${description}\nТеги: ${tagsString} \nЦена: ${price} \nОпция: ${data}`);
                                   bot.sendMessage(chatId, "Верно ли составлено обьявление?",applyPost);
                                   
                               });
                           } else {
                               bot.sendMessage(chatId, `Новое объявление от @${responseMsg.from.username}:\nОписание: ${description}\nТеги: ${tagsString} \nЦена ${price} \nОпция: ${data}`);
                           }
                       } else {
                           // Продолжаем ожидание сообщений от пользователя
                           bot.once('message', handleMessage);
                       }
                   }
               
                   // Начинаем ожидание сообщений от пользователя
                   bot.once('message', handleMessage);
                   
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