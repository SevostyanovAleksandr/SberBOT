const TelegramBot = require('node-telegram-bot-api');
const token = '7035543762:AAGR1qM7bt73_G4Pd4QZUF-lCGZUAB5xmXA';
const bot = new TelegramBot(token, { polling: true });

const userDataStore = {};
function storeUserData(userId, data) {
    userDataStore[userId] = data;
}

class BotState {
    constructor() {
        this.chatStates = {};
        this.bot = bot;
        this.globalData = null;
        this.globalMediaData = [];
        this.globalState = {
            allSelectedTags: {}

        };
        this.userStates = {}; // Stores user-specific states
    }

  
     validateFIOandEmail(input) {
        // Простая регулярная выражение для проверки ФИО и почты
        const regex = /^[^\s]+\s+[^\s]+\s+[^\s]+\s+[^\s]+@[^\s]+$/;
        return regex.test(input);
    }
    async checkUserInChannel(msg) {
        const userId = msg.from.id;
        const channelId =  "-1002196162742" 
        // Используем API Telegram для проверки членства пользователя в канале
        const isUserInChannel = await telegramAPI.checkUserInChannel(channelId, userId);
    
        if (isUserInChannel) {
            this.bot.sendMessage(userId, "Вы успешно добавлены в канал! Теперь у вас есть доступ к функционалsу.");
        }
    }
    async handleMessage(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const channelId =  "-1002196162742" // '-1002214964299'; // канал для авторищации
        if (msg.text === '/start') {
            this.bot.sendMessage(chatId, 'Добрый день, Сберахолка на связи! \nДля попадания в канал вы должны быть сотрудником СБЕРа и написать сюда \n⚡️В ОДНОМ СООБЩЕНИИ!⚡️ фамилия, имя, отчество и сберовская почта. (ДЗО тоже подходит) \nЕсли вдруг, бот говорит, что вы не то отправляете, подайте заново! Нужно всего одно сообщение с ФИО и почтой!');
            
            // Установка состояния для ожидания ввода ФИО и почты
            this.chatStates[chatId] = { state: 'awaiting_fio_email' };
            
        } else {
            // Проверка состояния чата
            const stateData = this.chatStates[chatId] || {};
            
            if (stateData.state === 'awaiting_fio_email') {
                const text = msg.text;
                if (this.validateFIOandEmail(text)) {
                    stateData.userData = text;
                    stateData.state = null; // Сброс состояния после успешной проверки
                    this.bot.sendMessage(chatId, "✨ Спасибо! Ваши данные отправлены на проверку. Пожалуйста, подождите, пока вас проверят и добавят в канал. \n\nПосле добавления у вас станут доступны кнопки: \n📢 /public - публикация объявления \n📝 /create - создание объявления \nℹ️ /help - справка");
                    this.approveUser(chatId, msg); // Вызов метода для отправки сообщения в канал
                } else {
                    this.bot.sendMessage(chatId, "Пожалуйста, отправьте корректные данные ФИО и (ваша почта)@sberbank.ru.");
                }
            } else {
                // Проверка членства пользователя в канале для всех других команд
                const isUserInChannel = await this.isUserInChannel(channelId, userId);
                console.log(`User ${userId} in channel ${channelId}: ${isUserInChannel}`);
    
                if (isUserInChannel) {
                    // Пользователь является членом канала
                    if (msg.text === '/create') {
                        this.createAd(chatId);
                    } else if (msg.text === '/help') {
                        this.chatStates[chatId] = { state: 'awaiting_help' };
                        this.helpUser(chatId);
                    } else if  (msg.text === '/public') {
                        if (!this.globalMediaData || this.globalMediaData.length === 0) {
                            this.bot.sendMessage(chatId, "❗️Объявление еще не создано!❗️ \nCоздайте объявление и попробуйте повторно📩.");
                        } else if (msg.text === '/public') {
                            this.bot.sendMediaGroup(chatId, this.globalMediaData);
                            this.confirmAd(chatId);
                        }

                    } else {
                        this.handleStatefulInput(msg);
                    }
                } else { 
                    this.bot.sendMessage(chatId, "Вы не являетесь членом канала, Пожалуйста, подождите, пока вас проверят и добавят в канал. \n\nПосле добавления у вас станут доступны кнопки: \n📢 /public - публикация объявления \n📝 /create - создание объявления \nℹ️ /help - справка"); 
                }
            }
        }
    }
 
    async isUserInChannel(channelId, userId) {
        try {
            const member = await bot.getChatMember(channelId, userId);
            console.log(`Chat member status: ${member.status}`);
            return ['member', 'administrator', 'creator'].includes(member.status);
        } catch (error) {
            console.error(`Error checking user ${userId} in channel ${channelId}:, error`);
            return false;
        }
    }
    
    handleCallbackQuery(callbackQuery) {
        const message = callbackQuery.message;
        const chatId = message.chat.id;
        const data = callbackQuery.data;

        console.log("Получен callback_query:", data);
        console.log("chatId:", chatId);

        if (!this.chatStates[chatId]) {
            this.chatStates[chatId] = {};
        }

        switch (data) {
            case '#КуплюПродам':
            case '#СдамСниму':
            case '#Просто_вопросик':
            case '#Отдам_бесплатно':
                this.globalData = data;
                this.chatStates[chatId] = { state: 'awaiting_tag' };
                const fakeMsg = { chat: { id: chatId }, text: "Продолжить" };
                this.handleStatefulInput(fakeMsg);
                console.log("Обработан основной кейс:", data);
                break;

            case 'edit':
                this.createAd(chatId);
                console.log('Обработка команды edit');
                break;

            case 'publish':
                console.log('Обработка команды publish');
                const channelChatId = '-1002196162742';
                bot.sendMediaGroup(channelChatId, this.globalMediaData)
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
                    this.handleTagSelection(chatId, tag);
                } else {
                    bot.sendMessage(chatId, 'Неизвестная команда');
                }
                break;
        }

        bot.answerCallbackQuery(callbackQuery.id).catch(error => {
            console.error('Ошибка при ответе на callback_query:', error);
        });
    }

    handleStatefulInput(msg) {
        const chatId = msg.chat.id;
        const text = msg.text;
        const stateData = this.chatStates[chatId] || {};

        if (!stateData || !stateData.state) return;
        console.log(`Handling stateful input for chat ${chatId} with state ${stateData.state}`);
        switch (stateData.state) {

            case 'awaiting_tag':
                if (text === "Продолжить") {
                    stateData.state = 'awaiting_description';
                    bot.sendMessage(chatId, "Теперь напишите описание товара или услуги и не забудьте выбрать теги ⬇️:", this.createTag(chatId)).then((sentMessage) => {
                        // Сохраняем message_id после отправки сообщения
                        this.chatStates[chatId].message_id = sentMessage.message_id;
                        console.log(`message_id установлен для чата ${chatId}: ${sentMessage.message_id}`);
                    }).catch(error => {
                        console.error('Ошибка при отправке сообщения:', error);
                    });
                }
                break;
                case 'awaiting_description':
            stateData.description = msg.text;
            stateData.photos = []; // Инициализация массива для фотографий
            stateData.state = 'awaiting_photo';
            bot.sendMessage(chatId, 'Теперь отправьте фото📸 (до 10 штук). Отправьте "Готово", когда закончите✔️:');
            break;
        case 'awaiting_photo':
            if (msg.photo) {
                if (!stateData.photos) stateData.photos = [];
                if (stateData.photos.length < 10) {
                    stateData.photos.push(msg.photo[0].file_id);
                    bot.sendMessage(chatId, `Фото добавлено (${stateData.photos.length}/10).`);
                } else {
                    bot.sendMessage(chatId, 'Уже добавлено максимальное количество фото (10).');
                }
            } else if (text.toLowerCase() === 'готово' && stateData.photos && stateData.photos.length > 0) {
                stateData.state = 'awaiting_price';
                bot.sendMessage(chatId, 'Введите цену вашего товара или услуги(число)💰:');
            } else {
                bot.sendMessage(chatId, 'Пожалуйста, отправьте фотографии или напишите "Готово", если закончили.');
            }
            break;

        case 'awaiting_price':
            // const price = msg.text;
            const price = parseFloat(msg.text);
     if (!isNaN(price) && price >= 0) {
            const tags = this.globalState.allSelectedTags[chatId]?.join(', ') || '';
            const mediaGroup = stateData.photos.map((photo, index) => ({
                type: 'photo',
                media: photo,
                caption: index === 0 ? `🔥Описание: ${stateData.description}\n\n💡Опция: ${this.globalData}\n\n💥Теги: ${tags}\n\n💰Цена: ${price}₽\n\n🌟@${msg.from.username}` : ''
            }));
            
            bot.sendMediaGroup(chatId, mediaGroup)
                .then(() => {
                    this.confirmAd(chatId);
                    this.globalMediaData[chatId] = mediaGroup;
                    this.chatStates[chatId].state = null; // Сброс состояния после завершения процесса
                    console.log(`Объявление создано и отправлено пользователю ${chatId}`);
                })
                .catch(error => {
                    console.error('Ошибка при отправке медиа-группы:', error);
                    bot.sendMessage(chatId, 'Произошла ошибка при создании объявления.');
                });
     } else {
            bot.sendMessage(chatId, 'Пожалуйста, введите корректное числовое значение для цены❗️.');
         }
     break;
   
        }
    }

    helpUser(chatId) {    
        bot.sendMessage(chatId, 'Привет! 🌟 Для начала создания объявления нажмите кнопку [Создать объявление] или воспользуйтесь командой /create. \nЯ помогу вам заполнить объявление текстом или фото✍️. Новый текст будет заменять предыдущий, а не дополнять его. Помните, что в одном сообщении можно прикрепить не более 10 фото из-за ограничений Телеграма👀. \nЕсли вам нужно удалить фото, придется начать создание объявления заново. После того как вы подготовите объявление, нажмите кнопку [Опубликовать объявление] или используйте команду /public📩. \nПосле этого я создам макет объявления и предложу вам подтвердить его публикацию. Если все правильно, нажмите [Опубликовать]. \nЕсли у вас возникнут вопросы или потребуется помощь — обращайтесь🧑‍💻!');
    }

    createAd(chatId) {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Куплю/Продам', callback_data: '#КуплюПродам' }, { text: 'Сдам/Сниму', callback_data: '#СдамСниму' }],
                    [{ text: 'Просто вопросик', callback_data: '#Просто_вопросик' }, { text: 'Отдам бесплатно', callback_data: '#Отдам_бесплатно' }]
                ]
            }
        };
        bot.sendMessage(chatId, 'Выберите одну из опций:', options);
    }

    approveUser(chatId, msg) {
        const userData = this.chatStates[chatId].userData;
        if (userData) {
            const channelChatId = '-1002214964299' ; // ID канала для авторизации
            const userNickname = msg.from.username; // Получаем никнейм пользователя
            bot.sendMessage(channelChatId, `Желающий вступить в канал🗞: \n${userData} \nИмя пользователя: @${userNickname}`);
        }
    }

    confirmAd(chatId) {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Опубликовать', callback_data: 'publish' }, { text: 'Изменить', callback_data: 'edit' }]
                ]
            }
        };
        bot.sendMessage(chatId, 'Верно ли составлено объявление?', options);
    }

    createTag(chatId) {
        const tags = ['Apple', 'Шмотки', 'Ноутбук', 'Фототехника', 'Авто', "Билет", "Детям", 'Животные', 'Мебель', 'Медицина', 'Недвижимость', 'Раритет', 'Ремонт', 'Сертификат', "Спортивное", "Стройка", 'Техника', "Халява", 'Игры и консоль', "Электроника"];
        
        const selectedTags = this.chatStates[chatId]?.selectedTags || [];
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

    handleTagSelection(chatId, tag) {
        try {
            if (!this.chatStates[chatId]) {
                this.chatStates[chatId] = { selectedTags: [] };
            }

            // Инициализация массива selectedTags, если он не существует
            if (!this.chatStates[chatId].selectedTags) {
                this.chatStates[chatId].selectedTags = [];
            }

            const selectedTags = this.chatStates[chatId].selectedTags;
            console.log("Текущие выбранные теги:", selectedTags);
            const index = selectedTags.indexOf(tag);
            if (index > -1) {
                selectedTags.splice(index, 1); // Удаление тега из списка
            } else {
                selectedTags.push(tag); // Добавление тега в список
            }
            const updatedTags = selectedTags.map(tag => `#${tag}`);

            // Записываем обновленные теги в глобальный объект
            this.globalState.allSelectedTags[chatId] = [...updatedTags];
            // Записываем все выбранные теги в глобальный объект
            console.log("Все выбранные теги для чата", chatId, ":", this.globalState.allSelectedTags[chatId]);

            if (this.chatStates[chatId].message_id) {
                bot.editMessageReplyMarkup(this.createTag(chatId).reply_markup, {
                    chat_id: chatId,
                    message_id: this.chatStates[chatId].message_id
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
    
}


const botState = new BotState();

bot.on('message', (msg) => botState.handleMessage(msg));
bot.on('callback_query', (callbackQuery) => botState.handleCallbackQuery(callbackQuery));