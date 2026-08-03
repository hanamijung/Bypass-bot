const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ตั้งค่า
const REPO_URL = 'https://github.com/hanamijung/Bypass-bot.git'; // แก้เป็นของคุณ
const BRANCH = 'main';
const BOT_DIR = __dirname;

console.log('🔄 กำลังตรวจสอบอัปเดตจาก GitHub...');

try {
    // เช็คว่ามี git repo หรือยัง
    const isGitRepo = fs.existsSync(path.join(BOT_DIR, '.git'));

    if (!isGitRepo) {
        console.log('📦 ยังไม่มี Git repo กำลัง clone...');
        execSync(`git clone ${REPO_URL} .`, { cwd: BOT_DIR, stdio: 'inherit' });
    } else {
        // ดึงอัปเดตล่าสุด
        console.log('📥 กำลัง pull โค้ดล่าสุด...');
        execSync('git fetch origin', { cwd: BOT_DIR, stdio: 'inherit' });

        const localHash = execSync('git rev-parse HEAD', { cwd: BOT_DIR }).toString().trim();
        const remoteHash = execSync(`git rev-parse origin/${BRANCH}`, { cwd: BOT_DIR }).toString().trim();

        if (localHash === remoteHash) {
            console.log('✅ โค้ดเป็นเวอร์ชันล่าสุดแล้ว');
            process.exit(0);
        }

        console.log('🆕 พบเวอร์ชันใหม่! กำลังอัปเดต...');
        execSync(`git reset --hard origin/${BRANCH}`, { cwd: BOT_DIR, stdio: 'inherit' });
    }

    // ติดตั้ง dependencies ใหม่
    console.log('📦 กำลังติดตั้ง dependencies...');
    execSync('npm install', { cwd: BOT_DIR, stdio: 'inherit' });

    console.log('✅ อัปเดตเสร็จสิ้น! กรุณารีสตาร์ทบอท');
} catch (error) {
    console.error('❌ อัปเดตล้มเหลว:', error.message);
    process.exit(1);
}
