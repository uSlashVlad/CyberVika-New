const Discord = require('discord.js'); // получение discord.js
const bot = new Discord.Client(); // создание клиента
const prefix = "!"; // префик бота
const axios = require('axios');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
bot.login(token); // подключение по токену

const langRoles = [
    'питон',
    'паскаль',
    'c++',
    'c#',
    'javascript',
    'dart',
    'java'
];

const emojis = {
    ok: '✅',
    warn: '⚠',
    error: '🚫',
    block: '⛔'
}

const helpEmbed = new Discord.RichEmbed({
    title: '**Информация и помощь**',
    color: 0x7FFFD4,
    fields: [
        {
            name: 'Помощь',
            value: `**${prefix}помощь**\n**${prefix}помощь *<команда>***`
        },
        {
            name: 'Роль',
            value: `**${prefix}роль *<название>***`
        }
    ]
});

const roleHelpEmbed = new Discord.RichEmbed({
    title: '**!помощь роль**',
    color: 0x8B00FF,
    fields: [
        {
            name: 'Использование',
            value: `**${prefix}роль *<название>***`
        },
        {
            name: 'Список доступных ролей',
            value: '**' + langRoles.join('\n') + '**'
        }
    ]
});


bot.on('ready', () => {
    console.log('Бот запущен');
    bot.user.setActivity('вебинар', { type: "WATCHING" }); // установка активности
});


bot.on('message', message => {
    if (message.content.startsWith(prefix) && message.author != bot.user) {
        procMessage(message);
    }
});


async function procMessage(message) {
    let args = message.content.substring(prefix.length).split(' ').join('\n').split('\n');
    args = deleteEmpty(args);

    let command = args[0].toLowerCase();
    args.shift();

    switch (command) {
        case 'помощь':
            if (args[0]) {
                switch (args[0]) {
                    case 'роль':
                        send(message, roleHelpEmbed);
                        break;
                    default:
                        send(message, 'Не найдено информации об этой команде');
                }
            } else {
                send(message, helpEmbed);
            }
            break;
        case 'роль':
            let role = args[0];
            if (role) {
                role = role.toLowerCase();
                if (role.startsWith('с')) {
                    role = 'c' + role.slice(1);
                }
                let getRole = await message.guild.roles.find(x => x.name === upFirstLetter(role));
                if (getRole) {
                    let indexOfRole = langRoles.indexOf(getRole.name);
                    if (indexOfRole !== null && indexOfRole !== undefined) {
                        // Проверка на наличие роли у пользователя
                        if (message.member.roles.find(x => x.name === upFirstLetter(role))) {
                            // Удаление роли
                            await message.member.removeRole(getRole);
                            await send(message, '**' + message.author.username + '** убрал с себя роль **' + getRole.name + '**');
                            await message.react(emojis.ok);

                        } else {
                            // Добавление роли
                            await message.member.addRole(getRole);
                            await send(message, `Роль **${getRole.name}** выдана пользователю **${message.author.username}**`);
                            await message.react(emojis.ok);
                        }
                    }
                } else {
                    await send(message, 'Неизвестная роль, используй **!помощь роль**');
                    await message.react(emojis.warn);
                }
            } else {
                await send(message, 'Неверный аргумент, используй **!помощь роль**');
                await message.react(emojis.warn);
            }
            break;
    }
}


// Функция для упрощения отправки сообщений
async function send(message, content) {
    return new Promise(resolve => {
        message.channel.send(content);
        resolve();
    });
}

function deleteEmpty(arr) {
    return arr.filter(el => { return el != '' });
}

function upFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}
