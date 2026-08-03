require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const BACON_API_URL = 'https://baconbypass.online/bypass';

const commands = [
    new SlashCommandBuilder()
        .setName('bypass')
        .setDescription('Bypass platorelay link')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('ลิงก์ platorelay ที่ต้องการ bypass')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('เช็คสถานะบอท')
];

client.once('ready', async () => {
    console.log(`✅ บอท ${client.user.tag} พร้อมทำงานแล้ว!`);
    try {
        await client.application.commands.set(commands);
        console.log('✅ Slash commands ถูกลงทะเบียนเรียบร้อย');
    } catch (error) {
        console.error('❌ ลงทะเบียน commands ไม่สำเร็จ:', error);
    }
});

async function bypassLink(url) {
    try {
        const response = await axios.post(BACON_API_URL, {
            url: url,
            apikey: process.env.BACON_API_KEY
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Unknown error'
        };
    }
}

function isPlatorelayLink(url) {
    const platorelayPatterns = [
        /platorelay\.com/i,
        /platorelay\.online/i,
        /platorelay\.xyz/i,
        /plato\.relay/i,
        /platorelay/i
    ];
    return platorelayPatterns.some(pattern => pattern.test(url));
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🏓 Pong!')
            .setDescription(`Latency: ${client.ws.ping}ms\nUptime: ${Math.floor(client.uptime / 1000)}s`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'bypass') {
        await interaction.deferReply();
        const url = interaction.options.getString('url');

        const result = await bypassLink(url);

        if (result.success) {
            const bypassedUrl = result.data.result || result.data.url || 'ไม่พบลิงก์';
            const successEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Bypass Successful')
                .addFields({
                    name: '🔗 Bypassed Result',
                    value: '```' + bypassedUrl + '```',
                    inline: false
                })
                .setFooter({ text: 'Made by Bacon Script | Join discord.gg/baconscript' })
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Bypass Failed')
                .addFields({
                    name: '❌ Error',
                    value: '```' + result.error + '```',
                    inline: false
                })
                .setFooter({ text: 'Made by Bacon Script | Join discord.gg/baconscript' })
                .setTimestamp();
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(urlRegex);
    if (!urls) return;

    const platorelayUrls = urls.filter(url => isPlatorelayLink(url));
    if (platorelayUrls.length === 0) return;

    const botMember = message.guild?.members.me;
    const canDelete = botMember?.permissionsIn(message.channel).has(PermissionsBitField.Flags.ManageMessages);

    if (canDelete) {
        try {
            await message.delete();
            console.log(`🗑️ ลบข้อความต้นฉบับของ ${message.author.tag} ทันที`);
        } catch (err) {
            console.error('❌ ไม่สามารถลบข้อความต้นฉบับได้:', err.message);
        }
    } else {
        console.log('⚠️ บอทไม่มีสิทธิ์ ManageMessages');
    }

    const processingEmbed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('🔍 Bypassing...')
        .setDescription('กำลังประมวลผล รอสักครู่...')
        .setTimestamp();

    const replyMsg = canDelete
        ? await message.channel.send({ embeds: [processingEmbed] })
        : await message.reply({ embeds: [processingEmbed] });

    const results = [];
    for (const url of platorelayUrls) {
        const result = await bypassLink(url);
        results.push({ url, ...result });
    }

    const resultEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Bypass Successful');

    results.forEach((res) => {
        const bypassedUrl = res.success ? (res.data.result || res.data.url || 'ไม่พบลิงก์') : res.error;
        resultEmbed.addFields({
            name: '🔗 Bypassed Result',
            value: '```' + bypassedUrl + '```',
            inline: false
        });
    });

    resultEmbed.setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

    await replyMsg.edit({ embeds: [resultEmbed] });
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

client.on('error', (error) => {
    console.error('Discord Client Error:', error);
});

client.login(process.env.DISCORD_TOKEN);
