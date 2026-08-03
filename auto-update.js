const { execSync } = require('child_process');
const cron = require('node-cron');

console.log('⏰ Auto Update Scheduler เริ่มทำงาน...');
console.log('🕐 ตรวจสอบอัปเดตทุก ๆ 5 นาที');

cron.schedule('*/5 * * * *', () => {
    console.log(`[${new Date().toLocaleString()}] กำลังตรวจสอบอัปเดต...`);
    try {
        execSync('node update.js', { stdio: 'inherit' });
    } catch (err) {
        console.error('❌ Auto update error:', err.message);
    }
});

try {
    execSync('node update.js', { stdio: 'inherit' });
} catch (err) {
    console.error('❌ Initial update error:', err.message);
}
