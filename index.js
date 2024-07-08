const { Telegraf, Scenes, session, Markup } = require('telegraf');
const { BaseScene, Stage } = Scenes;
const token = '7035543762:AAGR1qM7bt73_G4Pd4QZUF-lCGZUAB5xmXA';

const bot = new Telegraf(token);

// Сцена для кнопок опций
const opsciaScene = new BaseScene("opcia")
opsciaScene.enter((ctx) =>{
    ctx.reply('Выберите одну из опций:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '#Куплю/Продам', callback_data: '#КуплюПродам' },{ text: '#Просто вопросик', callback_data: '#Просто_вопросик' }],
                [{ text: '#Сдам/Сниму', callback_data: '#СдамСниму' },{ text: '#Отдам бесплатно', callback_data: '#Отдам_бесплатно' }]
            ]
        }
    })
})

opsciaScene.action(['#КуплюПродам', '#Просто_вопросик','#СдамСниму', '#Отдам_бесплатно'], (ctx) => {
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
opsciaSceneEdit.enter((ctx) =>{
    ctx.reply('Выберите одну из опций:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '#Куплю/Продам', callback_data: '#КуплюПродам' },{ text: '#Просто вопросик', callback_data: '#Просто_вопросик' }],
                [{ text: '#Сдам/Сниму', callback_data: '#СдамСниму' },{ text: '#Отдам бесплатно', callback_data: '#Отдам_бесплатно' }]
            ]
        }
    })
})

opsciaSceneEdit.action(['#КуплюПродам', '#Просто_вопросик','#СдамСниму', '#Отдам_бесплатно'], (ctx) => {
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
    const tags = ['Apple', 'Шмотки', 'Ноутбук', 'Фототехника', 'Авто', "Билет", "Детям", 'Животные', 'Мебель', 'Медицина', 'Недвижимость', 'Раритет', 'Ремонт', 'Сертификат', "Спортивное", "Стройка", 'Техника', "Халява", 'Игры и консоль', "Электроника"];
    
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
        const description = ctx.message.text;
    
        if (selectedTags.length === 0 || description.trim() === '') {
            ctx.reply('Пожалуйста, выберите теги и введите текст.');
        } else {
            ctx.session.ad.description = description;
            // Переходим к сцене ввода цены
            return ctx.scene.enter('price');
        }
    })
    
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
    ctx.reply('Введите цену вашего объявления:');
});
priceScene.on('text', (ctx) => {
    const price = parseFloat(ctx.message.text);

    if (!isNaN(price)) {
        ctx.session.ad.price = price;
        return ctx.scene.enter('photoUpload');
    } else {
        ctx.reply('Пожалуйста, введите число.');
    }
});

// Сцена для ввода цены
const priceSceneEdid = new BaseScene('priceEdit');
priceSceneEdid.enter((ctx) => {
    ctx.reply('Вы выбрали редактирование цены. Введите цену вашего объявления или услуги:');
});
priceSceneEdid.on('text', (ctx) => {
    const price = parseFloat(ctx.message.text);

    if (!isNaN(price)) {
        ctx.session.ad.price = price;
        return ctx.scene.enter('publishAd');
    } else {
        ctx.reply('Пожалуйста, введите число.');
    }
});

priceSceneEdid.on('message', (ctx) => {
    ctx.reply('Пожалуйста, введите число.');
});



// // Сцена для загрузки фотографий
const photoUploadScene = new BaseScene('photoUpload');

photoUploadScene.enter((ctx) => {
    ctx.reply('Отправьте фотографии для вашего объявления (максимум 10) и готово:');
});

photoUploadScene.on('photo', (ctx) => {
    if (!ctx.session.ad) {
        ctx.session.ad = { photos: [] };
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
}
)

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

    ctx.reply('Вы выбрали редактирование фото. Отправьте фотографии для вашего объявления (максимум 10) и готово:');
})

photoUploadSceneEdit.on('photo', (ctx) => {
    if (!ctx.session.ad) {
        ctx.session.ad = { photos: [] };
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
            //         return ctx.scene.leave(); // Завершение сцен
    
}
}
)

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
        caption: index === 0 ? `Описание: ${ctx.session.ad.description} \nТеги: ${taggedArray}\n \nОпция: ${ctx.session.ad.option}\n \nЦена: ${ctx.session.ad.price}₽\n \nАвтор: @${ctx.from.username} `: undefined,
    }));
    ctx.telegram.sendMediaGroup(ctx.chat.id, media)
    .then(() => {
        ctx.reply('Верно ли составлено объявление🤔?', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Опубликовать', callback_data: 'publish' },{ text: 'Изменить', callback_data: 'edit' }]
                ]
            }
        })
    })
    .catch((error) => {
        console.error('Ошибка при отправке медиа-группы:', error);
        ctx.reply('Произошла ошибка при создании объявления.');
    });
        
} else {
   // media = ` Описание: ${ctx.session.ad.description} \nОпция: ${ctx.session.ad.option} \nТеги: ${taggedArray} \nЦена: ${ctx.session.ad.price}₽  \nАвтор: @${ctx.from.username}`
  media =  `Описание: ${ctx.session.ad.description} \nТеги: ${taggedArray}\n \nОпция: ${ctx.session.ad.option}\n \nЦена: ${ctx.session.ad.price}₽\n  \nАвтор: @${ctx.from.username} `,
    ctx.telegram.sendMessage(ctx.chat.id, media)
    .then(() => {
        ctx.reply('Верно ли составлено объявление🤔?', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Опубликовать', callback_data: 'publish' },{ text: 'Изменить', callback_data: 'edit' }]
                ]
            }
        })
    })
    .catch((error) => {
        console.error('Ошибка при отправке медиа-группы:', error);
        ctx.reply('Произошла ошибка при создании объявления.');
    });
        
}})

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
                caption: index === 0 ? `${ctx.session.ad.description}\n${taggedArray}\n \n${ctx.session.ad.option} за ${ctx.session.ad.price}₽\n \n@${ctx.from.username} `: undefined,
            }));
            try {
                ctx.telegram.sendMediaGroup(channelChatId, media);
                ctx.editMessageReplyMarkup(); // Скрыть клавиатуру
                ctx.reply('Объявление опубликовано!');
                
                
                
            } catch (error) {
                console.error('Ошибка при отправке сообщения в канал:', error);
                ctx.reply('Произошла ошибка при публикации объявления.');
            }
            
        } else {
            const message = `${ctx.session.ad.description}\n${taggedArray}\n \n${ctx.session.ad.option} за ${ctx.session.ad.price}₽\n  \n@${ctx.from.username}`;
            try {
                ctx.telegram.sendMessage(channelChatId, message);
                ctx.editMessageReplyMarkup(); // Скрыть клавиатуру
                ctx.reply('Объявление опубликовано!');
                
                
            } catch (error) {
                console.error('Ошибка при отправке сообщения в канал:', error);
                ctx.reply('Произошла ошибка при публикации объявления.');
            }
        }
    }
            break;
        case 'edit':

        ctx.reply('Что хотите изменить🤔?', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Опции', callback_data: 'opciaEditBut' },{ text: 'Теги и описание', callback_data: 'tagEdit' }],
                    [{ text: 'Цена', callback_data: 'cenaEdit' },{ text: 'Фото', callback_data: 'photoEdit' }]

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
    ctx.reply('Вы выбрали редактирование тегов и описания.');
});

publishAdScene.action('cenaEdit', (ctx) => {
    // Действия при выборе "Цена" для редактирования
    ctx.scene.enter('priceEdit');
    
});

publishAdScene.action('photoEdit', (ctx) => {
    ctx.scene.enter('photoUploadEdit');
});





// Создание и регистрация сцен
const stage = new Stage([photoUploadSceneEdit, opsciaSceneEdit, priceSceneEdid, photoUploadScene, publishAdScene, priceScene, opsciaScene, tagScene]);
bot.use(session());
bot.use(stage.middleware());


// Обработка команд
bot.start((ctx) => {
    ctx.reply('Добро пожаловать! Введите /create для создания нового объявления.');
});

bot.command('create', (ctx) => {
    ctx.session = {}; // Обнулить сессию
    selectedTags = {}; // Обнулить теги
    ctx.scene.enter('opcia');
});

bot.command('edit', (ctx) => {
    ctx.scene.enter('editAd');
});

// Запуск бота
bot.launch()
    .then(() => console.log('Бот запущен'))
    .catch((error) => console.error('Ошибка при запуске бота:', error));

