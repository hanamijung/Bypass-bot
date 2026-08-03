const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_URL = 'https://github.com/YOUR_USERNAME/YOUR_REPO.git';
const BRANCH = 'main';
const BOT_DIR = __dirname;
const PM2_APP_NAME = 'platobypass';

console.log('🔄 กำลังตรวจสอบอัปเดตจาก GitHub...');

async function update() {
    try {
        const isGitRepo = fs.existsSync(path.join(BOT_DIR, '.git'));

        if (!isGitRepo) {
            console.log('📦 ยังไม่มี Git repo กำลัง clone...');
            execSync(`git clone ${REPO_URL} .`, { cwd: BOT_DIR, stdio: 'inherit' });
        } else {
            console.log('📥 กำลัง fetch จาก origin...');
            execSync('git fetch origin', { cwd: BOT_DIR, stdio: 'inherit' });

            const localHash = execSync('git rev-parse HEAD', { cwd: BOT_DIR }).toString().trim();
            const remoteHash = execSync(`git rev-parse origin/${BRANCH}`, { cwd: BOT_DIR }).toString().trim();

            if (localHash === remoteHash) {
                console.log('✅ โค้ดเป็นเวอร์ชันล่าสุดแล้ว');
                return false;
            }

            console.log('🆕 พบเวอร์ชันใหม่! กำลังอัปเดต...');
            execSync(`git reset --hard origin/${BRANCH}`, { cwd: BOT_DIR, stdio: 'inherit' });
        }

        console.log('📦 กำลังติดตั้ง dependencies...');
        execSync('npm install', { cwd: BOT_DIR, stdio: 'inherit' });

        console.log('✅ อัปเดตโค้ดเสร็จสิ้น!');
        return true;
    } catch (error) {
        console.error('❌ อัปเดตล้มเหลว:', error.message);
        process.exit(1);
    }
}

function restartPM2() {
    console.log('🔄 กำลังรีสตาร์ท PM2...');
    try {
        execSync(`pm2 reload ${PM2_APP_NAME}`, { stdio: 'inherit' });
        console.log('🚀 รีสตาร์ท PM2 สำเร็จ!');
    } catch (err) {
        console.error('❌ รีสตาร์ท PM2 ล้มเหลว:', err.message);
        console.log('💡 ลองรัน: pm2 start ecosystem.config.js');
    }
}

(async () => {
    const hasUpdate = await update();
    if (hasUpdate) {
        restartPM2();
    }
    console.log('🏁 เสร็จสิ้น');
})();
