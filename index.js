const { Telegraf, Scenes, session } = require('telegraf');
const { BaseScene, Stage } = Scenes;
const token = '7035543762:AAGR1qM7bt73_G4Pd4QZUF-lCGZUAB5xmXA';

const bot = new Telegraf(token);

// Сцена для ввода описания
const descriptionScene = new BaseScene('description');

descriptionScene.enter((ctx) => {
    ctx.reply('Введите описание вашего объявления:');
});

descriptionScene.on('text', (ctx) => {
    if (!ctx.session.ad) {
        ctx.session.ad = {};
    }
    ctx.session.ad.description = ctx.message.text;
    ctx.reply('Описание сохранено. Теперь введите цену вашего объявления.');
    return ctx.scene.enter('price'); // Переход к сцене ввода цены
});

descriptionScene.on('message', (ctx) => {
    ctx.reply('Пожалуйста, введите текст.');
});

// Сцена для ввода цены
const priceScene = new BaseScene('price');

priceScene.enter((ctx) => {
    ctx.reply('Введите цену вашего объявления:');
});

priceScene.on('text', (ctx) => {
    ctx.session.ad.price = ctx.message.text;
    ctx.reply('Цена сохранена. Теперь перейдем к загрузке фотографий.');
    return ctx.scene.enter('photoUpload'); // Переход к сцене загрузки фотографий
});

priceScene.on('message', (ctx) => {
    ctx.reply('Пожалуйста, введите текст.');
});
// Сцена для загрузки фотографий
const photoUploadScene = new BaseScene('photoUpload');

photoUploadScene.enter((ctx) => {
    ctx.reply('Отправьте фотографии для вашего объявления (максимум 3):');
});

photoUploadScene.on('photo', (ctx) => {
    if (!ctx.session.ad.photos) {
        ctx.session.ad.photos = [];
    }
    ctx.session.ad.photos.push(ctx.message.photo[0].file_id);

    if (ctx.session.ad.photos.length >= 3) {
        ctx.scene.enter('publishAd');
        return ctx.scene.leave(); // Завершение сцены
    }
});

photoUploadScene.on('message', (ctx) => {
    ctx.reply('Пожалуйста, отправьте фотографию.');
});

// Создание сцены для публикации объявления
const publishAdScene = new BaseScene('publishAd');

publishAdScene.enter((ctx) => {
    const ad = ctx.session.ad;
    // const mediaGroup = ad.photos.map((photo, index) => ({
    //     type: 'photo',
    //     media: photo,
    //     caption: index === 0 ? `Описание: ${ad.description}\nЦена: ${ad.const username = ctx.from.username ? \nПользователь: @${ctx.from.username} : '';
    const media = ctx.session.ad.photos.map((photoId, index) => ({
        type: 'photo',
        media: photoId,
        caption: index === 0 ? `${ctx.session.ad.description}\nЦена: ${ctx.session.ad.price}\nПользователь: @${ctx.from.username}` : undefined,
    }));
    ctx.telegram.sendMediaGroup(ctx.chat.id, media)
        .then(() => {
            ctx.reply('Ваше объявление готово к публикации. Введите /publish для публикации.');
        })
        .catch((error) => {
            console.error('Ошибка при отправке медиа-группы:', error);
            ctx.reply('Произошла ошибка при создании объявления.');
        });
});

// Создание и регистрация сцен
const stage = new Stage([descriptionScene, photoUploadScene, publishAdScene, priceScene]);
bot.use(session());
bot.use(stage.middleware());

// Обработка команд
bot.start((ctx) => {
    ctx.reply('Добро пожаловать! Введите /create для создания нового объявления.');
});

bot.command('create', (ctx) => {
    ctx.session = {}; // Обнулить сессию
    ctx.scene.enter('description');
});

bot.command('publish', async (ctx) => {
    const ad = ctx.session.ad;

    if (!ad || !ad.photos || ad.photos.length === 0) {
        return ctx.reply('Сначала создайте объявление с помощью команды /create.');
    }

    //const channelChatId = process.env.CHANNEL_ID; // ID канала, куда будет публиковаться объявление
    const channelChatId =  "-1002196162742" 
    const mediaGroup = ad.photos.map((photo, index) => ({
        type: 'photo',
        media: photo,
        caption: index === 0 ?`${ctx.session.ad.description}\nЦена: ${ctx.session.ad.price}\nПользователь: @${ctx.from.username}`: ''
    }));

    try {
        await ctx.telegram.sendMediaGroup(channelChatId, mediaGroup);
        ctx.reply('Ваше объявление опубликовано в канале.');
        
        
    } catch (error) {
        console.error('Ошибка при отправке сообщения в канал:', error);
        ctx.reply('Произошла ошибка при публикации объявления.');
    }
});

bot.command('edit', (ctx) => {
    ctx.scene.enter('editAd');
});

// Запуск бота
bot.launch()
    .then(() => console.log('Бот запущен'))
    .catch((error) => console.error('Ошибка при запуске бота:', error));

