const TelegramBot = require('node-telegram-bot-api');
const token = '7035543762:AAGR1qM7bt73_G4Pd4QZUF-lCGZUAB5xmXA';
const bot = new TelegramBot(token, { polling: true });

let globalTextnewUser;
const chatStates = {};
let globalData; 
let globalMediaData = [];
const adminChatId = '@Sevotonya';
const waitingForInput = new Map();
let selectedTags = {}; // Хранение состояния выбранных тегов для каждого пользователя
let userSelections = {}; // Хранение выбранных опций для каждого пользователя
let globalselectedTags = [];


bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === '/start') {
        chatStates[chatId] = { state: 'awaiting_fio_email' };
        validationUser(chatId);
    } else if (msg.text === '/create') {
        createAd(chatId);
        
    } 
    else if (msg.text === '/help') {
        chatStates[chatId] = { state: 'awaiting_help' };
        helpUser(chatId)
    }
    else if (msg.text === '/public') {
        bot.sendMediaGroup(chatId, me);
        confirmAd(chatId);

    }
    else {
        handleStatefulInput(msg);
    }
    
});
function helpUser (chatId) {    
    bot.sendMessage(chatId, 'Привет! Чтобы начать создание объявления - используй кнопку [Новое объявление] или команду /create. \nЯ предложу наполнить объявление текстом или фото. При этом новый текст будет заменять предыдущий, а не дополнять.Также у Телеграм есть ограничение на 10 фото в одном сообщении, поэтому не получится опубликовать объявление с большим количеством фото. \nУдалять фото нельзя, поэтому, если случайно добавлено не то фото, следует начать создание объявления заново. \nЧтобы опубликовать объявление - используй кнопку [Опубликовать] или команду /public. \nПеред публикацией я создам макет объявления и предложу подтвердить публикацию. Если все ок - жми [Да]. \nПомимо этого я пришлю сообщение об успешной публикации с ссылкой на объявление и с кнопкой его удаления. К сожалению, Телеграм не позволяет ботам удалять сообщения старше 48 часов.');
}
function validationUser(chatId) {
    bot.sendMessage(chatId, 'Добрый день, Сберахолка на связи! \nДля попадания в канал вы должны быть сотрудником СБЕРа и написать сюда \n⚡️В ОДНОМ СООБЩЕНИИ!⚡️ фамилия, имя, отчество и сберовская почта. (ДЗО тоже подходит) \nЕсли вдруг, бот говорит, что вы не то отправляете, подайте заново! Нужно всего одно сообщение с ФИО и почтой!');
}
function createAd(chatId) {
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Куплю/Продам', callback_data: '#Куплю/Продам' }, { text: 'Сдам/Сниму', callback_data: '#Сдам/Сниму' }],
                [{ text: 'Просто вопросик', callback_data: '#Просто вопросик' }, { text: 'Отдам бесплатно', callback_data: '#Отдам бесплатно' }]
            ]
        }
    };
    bot.sendMessage(chatId, 'Выберите одну из опций:', options);
    
}
bot
//метод отпрвки в канал введенные данные пользователь для апрува
function approveUser(chatId) {
    const userData = chatStates[chatId].userData;
    if (userData) {
        const channelChatId = '-1002196162742'; // ID вашего канала
        bot.sendMessage(channelChatId, `Новый сотрудник добавлен: ${userData}`);
    }
}
function confirmAd(chatId) {
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Опубликовать', callback_data: 'publish' }, { text: 'Изменить', callback_data: 'edit' }]
            ]
        }
    };
    bot.sendMessage(chatId, 'Верно ли составлено объявление?', options);
}

const tags = ['Apple', 'Шмотки', 'Ноутбук', 'Фототехника', 'Авто', "Билет", "Детям", 'Животные', 'Мебель', 'Медицина', 'Недвижимость', 'Раритет', 'Ремонт', 'Сертификат', "Спортивное", "Стройка", 'Техника', "Халява", 'Игры и консоль', "Электроника"];

function createTag(chatId) {
    const selectedTags = chatStates[chatId]?.selectedTags || [];
    const rows = [];
    
    for (let i = 0; i < tags.length; i += 4) {
        rows.push(tags.slice(i, i + 4));
    }
    
    return {
        reply_markup: {
            inline_keyboard: rows.map(row => row.map(tag => ({
                text: selectedTags.includes(tag) ? `✅ ${tag}` : tag,
                callback_data: `tag_${tag}`
            })))
        }
    };
}
const globalState = {
    allSelectedTags: {}
};

// function handleTagSelection(chatId, tag) {
//     try {
//         if (!chatStates[chatId]) {
//             chatStates[chatId] = { selectedTags: [] };
//         }

//         // Инициализация массива selectedTags, если он не существует
//         if (!chatStates[chatId].selectedTags) {
//             chatStates[chatId].selectedTags = [];
//         }

//         const selectedTags = chatStates[chatId].selectedTags;
//         console.log("Текущие выбранные теги:", selectedTags);
        
//         // Добавляем хэштег к тегу
//         const hashtaggedTag = `#${tag}`;

//         const index = selectedTags.indexOf(hashtaggedTag);

//         if (index > -1) {
//             selectedTags.splice(index, 1); // Удаление тега из списка
//         } else {
//             selectedTags.push(hashtaggedTag); // Добавление тега в список
//         }

//         // Записываем все выбранные теги в глобальный объект
//         globalState.allSelectedTags[chatId] = [...selectedTags];
//         console.log("Все выбранные теги для чата", chatId, ":", globalState.allSelectedTags[chatId]);

//         if (chatStates[chatId].message_id) {
//             bot.editMessageReplyMarkup(createTag(chatId).reply_markup, {
//                 chat_id: chatId,
//                 message_id: chatStates[chatId].message_id
//             }).catch(error => {
//                 console.error('Ошибка при обновлении сообщения:', error);
//             });
//         } else {
//             console.error('message_id не установлен для чата:', chatId);
//         }
//     } catch (error) {
//         console.error('Произошла ошибка в handleTagSelection:', error);
//     }
// }
function handleTagSelection(chatId, tag) {
    try {
        if (!chatStates[chatId]) {
            chatStates[chatId] = { selectedTags: [] };
        }

        // Инициализация массива selectedTags, если он не существует
        if (!chatStates[chatId].selectedTags) {
            chatStates[chatId].selectedTags = [];
        }

        const selectedTags = chatStates[chatId].selectedTags;
        console.log("Текущие выбранные теги:", selectedTags);
        const index = selectedTags.indexOf(tag);

        if (index > -1) {
            selectedTags.splice(index, 1); // Удаление тега из списка
        } else {
            selectedTags.push(tag); // Добавление тега в список
        }

        // Записываем все выбранные теги в глобальный объект
        globalState.allSelectedTags[chatId] = [...selectedTags];
        console.log("Все выбранные теги для чата", chatId, ":", globalState.allSelectedTags[chatId]);

        if (chatStates[chatId].message_id) {
            bot.editMessageReplyMarkup(createTag(chatId).reply_markup, {
                chat_id: chatId,
                message_id: chatStates[chatId].message_id
            }).catch(error => {
                console.error('Ошибка при обновлении сообщения:', error);
            });
        } else {
            console.error('message_id не установлен для чата:', chatId);
        }
    } catch (error) {
        console.error('Произошла ошибка в handleTagSelection:', error);
    }
}

bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;

    console.log("Получен callback_query:", data);
    console.log("chatId:", chatId);

    if (!chatStates[chatId]) {
        chatStates[chatId] = {};
    }

    switch (data) {
        case '#Куплю/Продам':
        case '#Сдам/Сниму':
        case '#Просто вопросик':
        case '#Отдам бесплатно':
            globalData = data;
            chatStates[chatId] = { state: 'awaiting_tag' };
            const fakeMsg = { chat: { id: chatId }, text: "Продолжить" };
            handleStatefulInput(fakeMsg);
            console.log("Обработан основной кейс:", data);
            break;

        case 'edit':
            createAd(chatId);
            console.log('Обработка команды edit');
            break;

        case 'publish':
            console.log('Обработка команды publish');
            const channelChatId = '-1002196162742';
            bot.sendMediaGroup(channelChatId, globalMediaData)
                .then(() => {
                    bot.editMessageText('Ваше объявление опубликовано в канале.', {
                        chat_id: chatId,
                        message_id: message.message_id,
                        reply_markup: { inline_keyboard: [] } // Удаляем клавиатуру
                    });
                })
                .catch(error => {
                    console.error('Ошибка при отправке сообщения в канал:', error);
                    bot.sendMessage(chatId, 'Произошла ошибка при публикации объявления.');
                });
            break;

        default:
            if (data.startsWith('tag_')) {
                const tag = data.substring(4);
                console.log("Выбор тега:", tag);
                handleTagSelection(chatId, tag);
            } else {
                bot.sendMessage(chatId, 'Неизвестная команда');
            }
            break;
    }

    bot.answerCallbackQuery(callbackQuery.id).catch(error=> {
        console.error('Ошибка при ответе на callback_query:', error);
    });
});


function handleStatefulInput(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const stateData = chatStates[chatId];
    const tags = globalState.allSelectedTags[chatId];

    switch(stateData.state) {   
             case 'awaiting_fio_email':
                    if (validateFIOandEmail(text)) {
                        bot.sendMessage(chatId, 'Спасибо, ваши данные приняты!\nОжидайте проверки модератором. Когда модератор проверит ваши данные и добавит вас в частный канал для сотрудников СБЕРа и ДЗО, у вас появится возможность публиковать объявления.');
                        chatStates[chatId].userData = text;
                         globalTextnewUser = text;
                       approveUser(chatId); // Сохраняем данные пользователя
                        chatStates[chatId].state = null; // Сброс состояния после успешной валидации
                    } else {
                        bot.sendMessage(chatId, 'Пожалуйста, введите корректные ФИО и почту в одном сообщении.');
                    }
                    break;
            
            case 'awaiting_tag':
    stateData.state = 'awaiting_description';
    bot.sendMessage(chatId, 'Теперь напишите описание товара или услуги и не забудьте выбрать теги ниже', {
        reply_markup: createTag(chatId).reply_markup
    }).then(message => {
        chatStates[chatId].message_id = message.message_id;
    }).catch(error => {
        console.error('Ошибка при отправке сообщения:', error);
    });
    
    break;
    
        case 'awaiting_description':
            stateData.description = msg.text;
            stateData.photos = []; // Инициализация массива для фотографий
            stateData.state = 'awaiting_photo';
            bot.sendMessage(chatId, 'Теперь отправьте фото (до 10 штук). Отправьте "Готово", когда закончите.');
            break;
        case 'awaiting_photo':
            if (msg.photo) {
                if (stateData.photos.length < 10) {
                    stateData.photos.push(msg.photo[0].file_id);
                } else {
                    bot.sendMessage(chatId, 'Уже добавлено максимальное количество фото (10).');
                }
            } else if (text.toLowerCase() === 'готово' && stateData.photos.length > 0) {
                stateData.state = 'awaiting_price';
                bot.sendMessage(chatId, 'Введите цену вашего товара или услуги.');
            } else {
                bot.sendMessage(chatId, 'Пожалуйста, отправьте фотографии или напишите "Готово", если закончили.');
            }
            break;
        case 'awaiting_price':
            const price = msg.text;
            const mediaGroup = stateData.photos.map((photo, index) => ({
                type: 'photo',
                media: photo,
                caption: index === 0 ? `Описание: ${stateData.description}\nЦена: ${price}\nАвтор: @${msg.from.username} \nОпция: ${globalData} \nТеги: ${tags}` : undefined
            }));
            bot.sendMediaGroup(chatId, mediaGroup);
            confirmAd(chatId);
            globalMediaData = mediaGroup;
            chatStates[chatId].state = null; // Сброс состояния после завершения процесса
            break;
        default:
            // Никаких действий, если состояние не определено или не ожидается ввод
            break;
    }
}

function validateFIOandEmail(input) {
    // Простая регулярная выражение для проверки ФИО и почты
    const regex = /^[^\s]+\s+[^\s]+\s+[^\s]+\s+[^\s]+@[^\s]+$/;
    return regex.test(input);
}