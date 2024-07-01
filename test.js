const TelegramBot = require('node-telegram-bot-api');
const token = '7035543762:AAGR1qM7bt73_G4Pd4QZUF-lCGZUAB5xmXA';
const bot = new TelegramBot(token, { polling: true });


let stateData = {
    state: '',
    selectedTags: {},
    message_id: {}
};

const tags = ['Apple', 'Шмотки', 'Ноутбук', 'Фототехника', 'Авто', "Билет", "Детям", 'Животные', 'Мебель', 'Медицина', 'Недвижимость', 'Раритет', 'Ремонт', 'Сертификат', "Спортивное", "Стройка", 'Техника', "Халява", 'Игры и консоль', "Электроника"];

function createTag(chatId) {
    const selectedTags = stateData.selectedTags[chatId] || [];
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

function handleTagSelection(chatId, tag) {
    if (!stateData.selectedTags[chatId]) {
        stateData.selectedTags[chatId] = [];
    }

    const selectedTags = stateData.selectedTags[chatId];
    const index = selectedTags.indexOf(tag);

    if (index > -1) {
        selectedTags.splice(index, 1); // Удаление тега из списка
    } else {
        selectedTags.push(tag); // Добавление тега в список
    }

    // Проверяем наличие message_id перед обновлением сообщения
    if (stateData.message_id[chatId]) {
        bot.editMessageReplyMarkup(createTag(chatId).reply_markup, {
            chat_id: chatId,
            message_id: stateData.message_id[chatId]
        }).catch(error => {
            console.error('Ошибка при обновлении сообщения:', error);
        });
    } else {
        console.error('message_id не установлен');
    }
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    stateData.state = 'awaiting_tag';
    
    bot.sendMessage(chatId, 'Теперь напишите описание товара или услуги и не забудьте выбрать теги ниже', {
        reply_markup: createTag(chatId).reply_markup
    }).then(message => {
        // Сохраняем message_id для последующего использования
        stateData.message_id[chatId] = message.message_id;
    }).catch(error => {
        console.error('Ошибка при отправке сообщения:', error);
    });
});

bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    switch (stateData.state) {
        case 'awaiting_tag':
            if (data.startsWith('tag_')) {
                const tag = data.substring(4);
                handleTagSelection(chatId, tag);
            } else {
                bot.sendMessage(chatId, 'Неизвестная команда');
            }
            break;
        
        // Другие состояния можно обрабатывать здесь
        default:
            bot.sendMessage(chatId, 'Неизвестная команда');
            break;
    }
});