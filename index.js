require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const BACON_API_URL = 'https://baconbypass.online/bypass';

// ==================== SLASH COMMANDS ====================

const commands = [
    new SlashCommandBuilder()
        .setName('bypass')
        .setDescription('Bypass platorelay link ให้ได้ลิงก์ต้นทางจริง')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('ลิงก์ platorelay ที่ต้องการ bypass')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('เช็คสถานะบอท')
];

// Register slash commands เมื่อบอทพร้อม
client.once('ready', async () => {
    console.log(`✅ บอท ${client.user.tag} พร้อมทำงานแล้ว!`);

    try {
        await client.application.commands.set(commands);
        console.log('✅ Slash commands ถูกลงทะเบียนเรียบร้อย');
    } catch (error) {
        console.error('❌ ลงทะเบียน commands ไม่สำเร็จ:', error);
    }
});

// ==================== BYPASS FUNCTION ====================

async function bypassLink(url) {
    try {
        const response = await axios.post(BACON_API_URL, {
            url: url,
            apikey: process.env.BACON_API_KEY
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });

        return {
            success: true,
            data: response.data
        };
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

// ==================== SLASH COMMAND HANDLER ====================

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // /ping
    if (interaction.commandName === 'ping') {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🏓 Pong!')
            .setDescription(`Latency: ${client.ws.ping}ms\nUptime: ${Math.floor(client.uptime / 1000)}s`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    // /bypass
    if (interaction.commandName === 'bypass') {
        await interaction.deferReply();

        const url = interaction.options.getString('url');

        if (!isPlatorelayLink(url)) {
            const warnEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('⚠️ คำเตือน')
                .setDescription('ลิงก์ที่ให้มาอาจไม่ใช่ platorelay link\nบอทจะพยายาม bypass ต่อไป...')
                .setTimestamp();

            await interaction.editReply({ embeds: [warnEmbed] });
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        const result = await bypassLink(url);

        if (result.success) {
            const successEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Bypass สำเร็จ!')
                .setDescription('ลิงก์ต้นทางที่ได้รับ:')
                .addFields(
                    { name: '🔗 Original URL', value: url, inline: false },
                    { name: '✨ Bypassed URL', value: result.data.result || result.data.url || 'ไม่พบลิงก์', inline: false }
                )
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            if (result.data.message) {
                successEmbed.addFields({ name: '📋 Message', value: String(result.data.message), inline: false });
            }
            if (result.data.time) {
                successEmbed.addFields({ name: '⏱️ Time', value: `${result.data.time}s`, inline: true });
            }

            await interaction.editReply({ embeds: [successEmbed] });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Bypass ล้มเหลว')
                .setDescription('ไม่สามารถ bypass ลิงก์นี้ได้')
                .addFields(
                    { name: '🔗 URL', value: url, inline: false },
                    { name: '❌ Error', value: result.error, inline: false }
                )
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
});

// ==================== AUTO DETECT ====================

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(urlRegex);

    if (!urls) return;

    const platorelayUrls = urls.filter(url => isPlatorelayLink(url));
    if (platorelayUrls.length === 0) return;

    const processingEmbed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('🔍 พบ PlatoRelay Link')
        .setDescription('กำลัง bypass ให้... รอสักครู่')
        .setTimestamp();

    const replyMsg = await message.reply({ embeds: [processingEmbed] });

    const results = [];
    for (const url of platorelayUrls) {
        const result = await bypassLink(url);
        results.push({ url, ...result });
    }

    const resultEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Bypass เสร็จสิ้น')
        .setDescription(`พบ ${platorelayUrls.length} ลิงก์ | สำเร็จ ${results.filter(r => r.success).length} ลิงก์`)
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

    results.forEach((res, index) => {
        const bypassedUrl = res.success ? (res.data.result || res.data.url || 'สำเร็จแต่ไม่พบลิงก์') : '❌ ล้มเหลว';
        const status = res.success ? '✅' : '❌';

        resultEmbed.addFields({
            name: `${status} Link #${index + 1}`,
            value: `**Original:** ${res.url}\n**Result:** ${bypassedUrl}`,
            inline: false
        });
    });

    await replyMsg.edit({ embeds: [resultEmbed] });
});

// ==================== ERROR HANDLING ====================

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

client.on('error', (error) => {
    console.error('Discord Client Error:', error);
});

// ==================== LOGIN ====================

client.login(process.env.DISCORD_TOKEN);
