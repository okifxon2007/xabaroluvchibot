import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';

// Telegram Bot tokenini kiriting
const bot = new Telegraf('8010869497:AAE4SbQmHPURFu3dhnqVGBTyW87Vsd7NfxM');

// "andijontoshkentodam" guruhining chat ID-si
const targetChannelId = '-1002254930682'; // Xabar yuboriladigan guruh ID-si

// "/start" buyrug'iga salomlashish javobini berish
bot.start((ctx) => ctx.reply('Salom! Xush kelibsiz!'));

// Guruhdan xabar olish va shartlarni tekshirish
bot.on('text', async (ctx) => {
    const message = ctx.message.text.toLowerCase(); // Kichik harflarga o‘tkazamiz
    const chat_id = ctx.message.chat.id; // Xabar yuborilgan guruhning ID-si
    const sender_id = ctx.message.from.id; // Xabar yuborgan odamning ID-si
    const message_id = ctx.message.message_id; // Xabar ID-si (o‘chirish uchun)
    const sender_username = ctx.message.from.username || ctx.message.from.first_name || 'Anonim'; // Foydalanuvchi nomi yoki ismi

    // Istalmagan iboralar ro‘yxati (kirl va lotin harflarda, simvollar va har qanday korinishda)
    const excludeFilters = [
        "poshta","3 ODAM. KAM","3 Odam","Юрамиз","юрамиз","ЮРАМИЗ","Yuramiz","yuramiz","YURAMIZ","Кам","кам","КАМ","Kam","kam","KAM",
        "2ta odamkam", "2 та одамкам", "Почтаоламиз","почтаоламиз","ПОЧТАОЛАМИЗ","ПоЧтаОламиз","ПочТАоЛамиз","ПочтаОлаМИз","ПОЧтаоламиз","ПочтаоламИз","ПочТАОЛАМИЗ",
        "pochtaolamiz", "poshta","pochta olamiz", "pochta-olamiz", "почтаоламиз", "почта оламиз", "почта-оламиз",
        "oldi bosh", "олди бош", 
        "1odam", "1 одам", 
        "2odam", "2 одам", 
        "3odam", "3 одам", 
        "4odam", "4 одам", 
        "☎️", "📞", "📍", "🚗", "‼️", "⏰", "📦"
    ];

    // Agar xabarda istalmagan iboralardan biri bo‘lsa, hech narsa qilmaymiz
    if (excludeFilters.some(filter => message.includes(filter))) return;

    try {
        // Guruh adminlarini tekshirish
        const res = await fetch(`https://api.telegram.org/bot${bot.token}/getChatAdministrators?chat_id=${chat_id}`);
        const data = await res.json();
        
        if (data.ok) {
            const isAdmin = data.result.some(admin => admin.user.id === sender_id);
            if (isAdmin) {
                // Botning guruhdagi admin holatini tekshirish
                const botRes = await fetch(`https://api.telegram.org/bot${bot.token}/getChatMember?chat_id=${chat_id}&user_id=${bot.botInfo.id}`);
                const botData = await botRes.json();
                
                if (botData.ok && botData.result.status === 'administrator') {
                    // Asl guruhdan xabarni o‘chirish
                    await bot.telegram.deleteMessage(chat_id, message_id);
                    
                    // "andijontoshkentodam" guruhiga xabarni yuborish (lichka va guruh nomi bilan)
                    const fullMessage = `Foydalanuvchi: @${sender_username}\nXabar: ${ctx.message.text}\nGuruh: ${ctx.chat.title || 'Nomsiz guruh'}`;
                    await bot.telegram.sendMessage(targetChannelId, fullMessage);
                }
            }
        }
    } catch (error) {
        console.error('Xato yuz berdi:', error);
    }
});


bot.launch();

console.log('Bot ishga tushdi...');