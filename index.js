const {Telegraf,Scenes,session,Markup} = require('telegraf');
const {BaseScene,Stage} = Scenes;
const token = '7035543762:AAGR1qM7bt73_G4Pd4QZUF-lCGZUAB5xmXA';

const bot = new Telegraf(token);

//Cцена авторизации start
function validateFIOandEmail(input) {
    // Регулярное выражение для проверки ФИО и почты, оканчивающейся на @sberbank.ru
    const regex = /^[^\s]+\s+[^\s]+\s+[^\s]+\s+[^\s]+@sberbank\.ru$/;
    return regex.test(input);}

const authScene = new BaseScene("auth")
authScene.enter((ctx) => {
    ctx.reply('Добрый день, Сберахолка на связи✅! \nДля попадания в канал вы должны быть сотрудником СБЕРа и написать сюда \n⚡️В ОДНОМ СООБЩЕНИИ!⚡️ фамилия, имя, отчество и сберовская почта (ДЗО тоже подходит). \nЕсли вдруг, бот говорит, что вы не то отправляете, подайте заново! Нужно всего одно сообщение с ФИО и почтой!');

})
authScene.on('text', (ctx) => {
    const authText = ctx.message.text;
    const channelChatId = '-1002214964299' ; // ID канала для авторизации
    if (validateFIOandEmail(authText)){
ctx.reply("✨ Спасибо! Ваши данные отправлены на проверку. Пожалуйста, подождите, пока вас проверят и добавят в канал. \n\nПосле добавления у вас станут доступны кнопки:\n📝 /create - создание объявления \nℹ️ /help - справка");
const message = `Желающий вступить в канал🗞: \n${authText} \nИмя пользователя: @${ctx.from.username}`;
ctx.telegram.sendMessage(channelChatId, message);
ctx.scene.leave();
}
 else {
   ctx.reply( "Пожалуйста, отправьте корректные данные ФИО и (ваша почта)@sberbank.ru.")
}
});

// Сцена для кнопок опций
const opsciaScene = new BaseScene("opcia")
opsciaScene.enter((ctx) => {
    ctx.reply('Выберите одну из опций:', {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Куплю',
                    callback_data: '#Куплю'
                }, {
                    text: 'Продам',
                    callback_data: '#Продам'
                }],
                [{
                    text: 'Сдам',
                    callback_data: '#Сдам'
                }, {
                    text: 'Сниму',
                    callback_data: '#Сниму'
                }],
                [{
                    text: 'Просто вопросик',
                    callback_data: '#Просто_вопросик'
                }, {
                    text: 'Отдам бесплатно',
                    callback_data: '#Отдам_бесплатно'
                }]
            ]
        }
    })
})

opsciaScene.action(['#Куплю', '#Продам', '#Сдам', '#Сниму', '#Просто_вопросик', '#Отдам_бесплатно' ], (ctx) => {
    const selectedOption = ctx.callbackQuery.data;
    // Сохраняем выбранную опцию в сессии
    if (!ctx.session.ad) {
        ctx.session.ad = {};
    }
    ctx.session.ad.option = selectedOption;
    ctx.scene.enter('tag');

});

// Сцена для кнопок опций
const opsciaSceneEdit = new BaseScene("opciaEdit")
opsciaSceneEdit.enter((ctx) => {
    ctx.reply('Вы в режиме редактирования. Выберите одну из опций:', {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Куплю',
                    callback_data: '#Куплю'
                }, {
                    text: 'Продам',
                    callback_data: '#Продам'
                }],
                [{
                    text: 'Сдам',
                    callback_data: '#Сдам'
                }, {
                    text: 'Сниму',
                    callback_data: '#Сниму'
                }],
                [{
                    text: 'Просто вопросик',
                    callback_data: '#Просто_вопросик'
                }, {
                    text: 'Отдам бесплатно',
                    callback_data: '#Отдам_бесплатно'
                }]
            ]
        }
    })
})

opsciaSceneEdit.action(['#Куплю', '#Продам', '#Сдам', '#Сниму', '#Просто_вопросик', '#Отдам_бесплатно'], (ctx) => {
    const selectedOption = ctx.callbackQuery.data;
    // Сохраняем выбранную опцию в сессии
    if (!ctx.session.ad) {
        ctx.session.ad = {};
    }
    ctx.session.ad.option = selectedOption;
    ctx.scene.enter('publishAd');

});

const tagScene = new BaseScene('tag');

// Инициализация состояния тегов
let tagState = {};
let selectedTags = {};

tagScene.enter((ctx) => {
    const tags = ['Apple', 'Шмотки', 'Ноутбук', 'Фототехника', 'Авто', "Билет", "Детям", 'Животные', 'Мебель', 'Медицина', 'Недвижимость', 'Раритет', 'Ремонт', 'Сертификат', "Спортивное", "Стройка", 'Техника', "Халява", 'Игры', "Электроника"];

    // Инициализация состояния тегов как false (не выбран)
    tags.forEach(tag => {
        tagState[tag] = false;
    });
    sendTagMessage(ctx);

    tagScene.on('text', (ctx) => {
        if (!ctx.session.ad) {
            ctx.session.ad = {};
        }
    
        const selectedTags = Object.keys(tagState).filter(tag => tagState[tag] === true);
        let description = ctx.message.text;
    
        if (description.length > 760) {
            ctx.reply('Вы ввели слишком большое количество символов для телеграмма. Пожалуйста, попробуйте еще раз.');
            return;
        }
    
        if (selectedTags.length === 0 || description.trim() === '') {
            ctx.reply('Пожалуйста, выберите теги и введите текст.');
        } else {
            ctx.session.ad.description = description;
            // Переходим к сцене ввода цены
            return ctx.scene.enter('price');
        }
    })

});

const tagSceneEdit = new BaseScene('tagEdit');

tagSceneEdit.enter((ctx) => {
    const tags = ['Apple', 'Шмотки', 'Ноутбук', 'Фототехника', 'Авто', "Билет", "Детям", 'Животные', 'Мебель', 'Медицина', 'Недвижимость', 'Раритет', 'Ремонт', 'Сертификат', "Спортивное", "Стройка", 'Техника', "Халява", 'Игры', "Электроника"];
   
    // Инициализация состояния тегов как false (не выбран)
    tags.forEach(tag => {
        tagState[tag] = false;
    });
    sendTagMessage(ctx);

tagSceneEdit.on('text', (ctx) => {
    if (!ctx.session.ad) {
        ctx.session.ad = {};
    }

    const selectedTags = Object.keys(tagState).filter(tag => tagState[tag] === true);
    let description = ctx.message.text;

    if (description.length > 760) {
        ctx.reply('Вы ввели слишком большое количество символов для телеграмма. Пожалуйста, попробуйте еще раз.');
        return;
    }

    if (selectedTags.length === 0 || description.trim() === '') {
        ctx.reply('Пожалуйста, выберите теги и введите текст.');
    } else {
        ctx.session.ad.description = description;
        // Переходим к сцене ввода цены
        return ctx.scene.enter('price');
    }
})

});
// Обработка нажатий на кнопки
tagSceneEdit.action(/tag_(.+)/, async (ctx) => {
    const tag = ctx.match[1];

    // Переключение состояния тега
    tagState[tag] = !tagState[tag];

    // Обновление выбранных тегов
    if (tagState[tag]) {
        selectedTags[tag] = true;
    } else {
        delete selectedTags[tag];
    }

    // Редактирование текущего сообщения с обновленной клавиатурой
    const rows = [];
    const tags = Object.keys(tagState);

    for (let i = 0; i < tags.length; i += 4) {
        const row = tags.slice(i, i + 4).map(tag => ({
            text: tagState[tag] ? `✅ ${tag}` : tag,
            callback_data: `tag_${tag}`
        }));
        rows.push(row);
    }

    await ctx.editMessageReplyMarkup({
        inline_keyboard: rows
    });
});
// Функция для отправки сообщения с клавиатурой
function sendTagMessage(ctx) {
    const rows = [];
    const tags = Object.keys(tagState);

    for (let i = 0; i < tags.length; i += 4) {
        const row = tags.slice(i, i + 4).map(tag => ({
            text: tagState[tag] ? `✅ ${tag}` : tag,
            callback_data: `tag_${tag}`
        }));
        rows.push(row);
    }

    ctx.reply('Теперь напишите описание товара или услуги и не забудьте выбрать теги ⬇️:', {
        reply_markup: {
            inline_keyboard: rows
        }
    });
}


// Обработка нажатий на кнопки
tagScene.action(/tag_(.+)/, async (ctx) => {
    const tag = ctx.match[1];

    // Переключение состояния тега
    tagState[tag] = !tagState[tag];

    // Обновление выбранных тегов
    if (tagState[tag]) {
        selectedTags[tag] = true;
    } else {
        delete selectedTags[tag];
    }

    // Редактирование текущего сообщения с обновленной клавиатурой
    const rows = [];
    const tags = Object.keys(tagState);

    for (let i = 0; i < tags.length; i += 4) {
        const row = tags.slice(i, i + 4).map(tag => ({
            text: tagState[tag] ? `✅ ${tag}` : tag,
            callback_data: `tag_${tag}`
        }));
        rows.push(row);
    }

    await ctx.editMessageReplyMarkup({
        inline_keyboard: rows
    });
});

// Сцена для ввода цены
const priceScene = new BaseScene('price');
priceScene.enter((ctx) => {
    ctx.reply('Введите цену вашего товара или услуги(число)💰:');
});
// priceScene.on('text', (ctx) => {
//     const price = parseFloat(ctx.message.text);

//     if (!isNaN(price) && price > 0) {
//         ctx.session.ad.price = price;
//         return ctx.scene.enter('photoUpload');
//     } else {
//         ctx.reply('Пожалуйста, введите число.');
//     }
// });
priceScene.on('text', (ctx) => {
    const priceInput = ctx.message.text.trim();

    if (priceInput.length <= 15) {
        const price = parseFloat(priceInput);

        if (!isNaN(price) && price > 0) {
            ctx.session.ad.price = price;
            return ctx.scene.enter('photoUpload');
        } else {
            ctx.reply('Пожалуйста, введите положительное число.');
        }
    } else {
        ctx.reply('Превышено допустимое количество символов. Пожалуйста, введите цену до 10 символов.');
    }
});

// Сцена для ввода цены
const priceSceneEdid = new BaseScene('priceEdit');
priceSceneEdid.enter((ctx) => {
    ctx.reply('Вы выбрали редактирование цены.\nВведите цену вашего товара или услуги(число)💰:');
});
priceSceneEdid.on('text', (ctx) => {
    const priceInput = ctx.message.text.trim();

    if (priceInput.length <= 15) {
        const price = parseFloat(priceInput);

        if (!isNaN(price) && price > 0) {
            ctx.session.ad.price = price;
            return ctx.scene.enter('photoUpload');
        } else {
            ctx.reply('Пожалуйста, введите положительное число.');
        }
    } else {
        ctx.reply('Превышено допустимое количество символов. Пожалуйста, введите цену до 10 символов.');
    }
});
// // Сцена для загрузки фотографий
const photoUploadScene = new BaseScene('photoUpload');

photoUploadScene.enter((ctx) => {
    ctx.reply('Теперь отправьте фото📸 (до 10 штук). Отправьте "Готово", когда закончите✔️:');
});

photoUploadScene.on('photo', (ctx) => {
    if (!ctx.session.ad) {
        ctx.session.ad = {
            photos: []
        };
    }

    if (!ctx.session.ad.photos) {
        ctx.session.ad.photos = [];
    }

    const photo = ctx.message.photo[0].file_id;
    ctx.session.ad.photos.push(photo);

    if (ctx.session.ad.photos.length >= 10) {
        ctx.reply('Вы добавили максимальное количество фотографий.');
        ctx.reply('Отправьте "готово", чтобы завершить процесс.');
    }
});
photoUploadScene.on('text', (ctx) => {
    if (ctx.message.text.toLowerCase() === 'готово') {

        ctx.scene.enter('publishAd');

    }
})

const photoUploadSceneEdit = new BaseScene('photoUploadEdit');
// Флаг для отслеживания первого входа

photoUploadSceneEdit.enter((ctx) => {
    let isFirstEntry = true;
    if (isFirstEntry) {
        if (ctx.session.ad && ctx.session.ad.photos) {
            ctx.session.ad.photos = []; // Обнуляем массив фотографий только при первом входе
        }
        isFirstEntry = false; // После первого входа меняем значение флага
    }

    ctx.reply('Вы выбрали редактирование фото. Теперь отправьте фото📸 (до 10 штук). Отправьте "Готово", когда закончите✔️:');
})

photoUploadSceneEdit.on('photo', (ctx) => {
    if (!ctx.session.ad) {
        ctx.session.ad = {
            photos: []
        };
    }

    if (!ctx.session.ad.photos) {
        ctx.session.ad.photos = [];
    }


    const photo = ctx.message.photo[0].file_id;
    ctx.session.ad.photos.push(photo);

    if (ctx.session.ad.photos.length >= 10) {
        ctx.reply('Вы добавили максимальное количество фотографий.');
        ctx.reply('Отправьте "готово", чтобы завершить процесс.');
    }
});
photoUploadSceneEdit.on('text', (ctx) => {
    if (ctx.message.text.toLowerCase() === 'готово') {
        ctx.scene.enter('publishAd');

    }
})

// Создание сцены для публикации объявления
const publishAdScene = new BaseScene('publishAd');

publishAdScene.enter((ctx) => {

    const allKeysArray = Object.keys(selectedTags);

    // Добавляем # к каждому элементу массива
    const taggedArray = allKeysArray.map(key => `#${key}`);
    const ad = ctx.session.ad;
    if (ctx.session.ad.photos && ctx.session.ad.photos.length > 0) {
        media = ctx.session.ad.photos.map((photoId, index) => ({
            type: 'photo',
            media: photoId,
            caption: index === 0 ? `Описание: ${ctx.session.ad.description} \nТеги: ${taggedArray}\n \nОпция: ${ctx.session.ad.option}\n \nЦена: ${ctx.session.ad.price}₽\n \nАвтор: @${ctx.from.username} ` : undefined,
        }));
        ctx.telegram.sendMediaGroup(ctx.chat.id, media)
            .then(() => {
                ctx.reply('Верно ли составлено объявление🤔?', {
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'Опубликовать',
                                callback_data: 'publish'
                            }, {
                                text: 'Изменить',
                                callback_data: 'edit'
                            }]
                        ]
                    }
                })
            })
            .catch((error) => {
                console.error('Ошибка при отправке медиа-группы:', error);
                ctx.reply('Произошла ошибка при создании объявления❗\nВидимо вы пытались отправить более чем 10 фотографий, пробуйте заново создать объявление /create.');
            });

    } else {
        // media = ` Описание: ${ctx.session.ad.description} \nОпция: ${ctx.session.ad.option} \nТеги: ${taggedArray} \nЦена: ${ctx.session.ad.price}₽  \nАвтор: @${ctx.from.username}`
        media = `Описание: ${ctx.session.ad.description} \nТеги: ${taggedArray}\n \nОпция: ${ctx.session.ad.option}\n \nЦена: ${ctx.session.ad.price}₽\n  \nАвтор: @${ctx.from.username} `,
            ctx.telegram.sendMessage(ctx.chat.id, media)
            .then(() => {
                ctx.reply('Верно ли составлено объявление🤔?', {
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'Опубликовать',
                                callback_data: 'publish'
                            }, {
                                text: 'Изменить',
                                callback_data: 'edit'
                            }]
                        ]
                    }
                })
            })
            .catch((error) => {
                console.error('Ошибка при отправке медиа-группы:', error);
                ctx.reply('Произошла ошибка при создании объявления❗\nВидимо вы пытались отправить более чем 10 фотографий, пробуйте заново создать объявление /create.');
            });
    }
})

//Обработчик нажатия на кнопки 'publish' и 'edit'
publishAdScene.action(['publish', 'edit'], (ctx) => {
    const creatApr = ctx.callbackQuery.data;

    switch (creatApr) {
        case 'publish':
            // При нажатии на кнопку "publish" вызываем обработчик команды /publish
            const ad = ctx.session.ad;

            if (!ctx.session.ad.description || !ctx.session.ad.option || !ctx.session.ad.price) {
                return ctx.reply('Сначала создайте объявление с помощью команды /create.');
            } else {
                const channelChatId = "-1002196162742";
                // const allKeysArray = Object.keys(selectedTags);
                // const taggedArray = allKeysArray.join(', '); // Преобразование массива тегов в строку
                const allKeysArray = Object.keys(selectedTags);

                // Добавляем # к каждому элементу массива
                const taggedArray = allKeysArray.map(key => `#${key}`);
                if (ctx.session.ad.photos && ctx.session.ad.photos.length > 0) {
                    media = ctx.session.ad.photos.map((photoId, index) => ({
                        type: 'photo',
                        media: photoId,
                        caption: index === 0 ? `${ctx.session.ad.description}\n${taggedArray}\n \n${ctx.session.ad.option} за ${ctx.session.ad.price}₽\n \n@${ctx.from.username} ` : undefined,
                    }));
                    try {
                        ctx.telegram.sendMediaGroup(channelChatId, media);
                        ctx.editMessageReplyMarkup(); // Скрыть клавиатуру
                        ctx.reply('Объявление опубликовано!');



                    } catch (error) {
                        console.error('Ошибка при отправке сообщения в канал:', error);
                        ctx.reply('Произошла ошибка при публикации объявления❗');
                    }

                } else {
                    const message = `${ctx.session.ad.description}\n${taggedArray}\n \n${ctx.session.ad.option} за ${ctx.session.ad.price}₽\n  \n@${ctx.from.username}`;
                    try {
                        ctx.telegram.sendMessage(channelChatId, message);
                        ctx.editMessageReplyMarkup(); // Скрыть клавиатуру
                        ctx.reply('Объявление опубликовано!');


                    } catch (error) {
                        console.error('Ошибка при отправке сообщения в канал:', error);
                        ctx.reply('Произошла ошибка при публикации объявления❗');
                    }
                }
            }
            break;
        case 'edit':
            ctx.editMessageReplyMarkup(); 
            ctx.reply('Что хотите изменить🤔?', {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Опции',
                            callback_data: 'opciaEditBut'
                        }, {
                            text: 'Теги и описание',
                            callback_data: 'tagEdit'
                        }],
                        [{
                            text: 'Цена',
                            callback_data: 'cenaEdit'
                        }, {
                            text: 'Фото',
                            callback_data: 'photoEdit'
                        }]

                    ]
                }
            })
            break;
    }
});
publishAdScene.action('opciaEditBut', (ctx) => {

    // Действия при выборе "Опции" для редактирования
    ctx.scene.enter('opciaEdit');
});

publishAdScene.action('tagEdit', (ctx) => {
    // Действия при выборе "Теги и описание" для редактирования
    ctx.scene.enter('tagEdit');
    selectedTags = {}
    //console.log(Object.keys(selectedTags))
    
});

publishAdScene.action('cenaEdit', (ctx) => {
    // Действия при выборе "Цена" для редактирования
    ctx.scene.enter('priceEdit');

});

publishAdScene.action('photoEdit', (ctx) => {
    ctx.scene.enter('photoUploadEdit');
});

// Создание и регистрация сцен
const stage = new Stage([authScene, tagSceneEdit, photoUploadSceneEdit, opsciaSceneEdit, priceSceneEdid, photoUploadScene, publishAdScene, priceScene, opsciaScene, tagScene]);
bot.use(session());
bot.use(stage.middleware());

// Обработка команд
bot.start((ctx) => {
    ctx.scene.enter('auth');
    
});

const channelChatId = '-1002196162742';

bot.command('create', async (ctx) => {
    const chatMember = await ctx.telegram.getChatMember(channelChatId, ctx.from.id);

    if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
        ctx.session = {}; // Обнулить сессию
        selectedTags = {}; // Обнулить теги
        ctx.scene.enter('opcia');
    } else {
        ctx.reply('Вы не являетесь членом канала😬. Пожалуйста, подождите, пока вас проверят и добавят в канал. \n\nПосле добавления у вас станут доступны кнопки: \n📝 /create - создание объявления \nℹ️ /help - справка');
    }
});

bot.command('help', async (ctx) => {
    const chatMember = await ctx.telegram.getChatMember(channelChatId, ctx.from.id);

    if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
        ctx.reply('Привет! 🌟 Для начала создания объявления нажмите кнопку [Создать объявление] или воспользуйтесь командой /create. \nЯ помогу вам заполнить объявление текстом или фото✍️. Помните, что в одном сообщении можно прикрепить не более 10 фото из-за ограничений Телеграма👀. \nПосле того как вы подготовите объявление, вы получите макет объялвения, у вас будет возможность проверить или изменить его. \nЕсли все ок у вас появится кнопка [Опубликовать]. \nЕсли у вас возникнут вопросы или потребуется помощь — обращайтесь🧑‍💻.');
    } else {
        ctx.reply('Вы не являетесь членом канала😬. Пожалуйста, подождите, пока вас проверят и добавят в канал. \n\nПосле добавления у вас станут доступны кнопки: \n📝 /create - создание объявления \nℹ️ /help - справка');
    }
});
// bot.command('public', async (ctx) => {
//     const chatMember = await ctx.telegram.getChatMember(channelChatId, ctx.from.id);

//     if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
//         const messages = await ctx.telegram.getChatHistory(channelChatId);

//         messages.forEach(async (message) => {
//             if (message.from.id === ctx.from.id) {
//                 if (message.text) {
//                     await ctx.reply(message.text);
//                 } else if (message.photo) {
//                     await ctx.replyWithPhoto({ source: message.photo[0].file_id });
//                 } // Добавьте другие типы сообщений по необходимости
//             }
//         });

//     } else {
//         ctx.reply('Извините, команда /sendPosts недоступна для этого канала.');
//     }
// });

// Запуск бота
bot.launch()
    .then(() => console.log('Бот запущен'))
    .catch((error) => console.error('Ошибка при запуске бота:', error));