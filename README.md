# PlatoRelay Bypass Discord Bot

บอท Discord สำหรับ bypass ลิงก์ PlatoRelay อัตโนมัติ

## 🚀 วิธีใช้งานบน VPS (PM2)

### 1. ติดตั้ง PM2
```bash
npm install -g pm2
```

### 2. รันบอทครั้งแรก
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. อัปเดตบอท
```bash
node update.js
```

### 4. ตั้ง Auto Update
```bash
node auto-update.js
```

## 📊 คำสั่ง PM2

```bash
pm2 status              # ดูสถานะ
pm2 logs platobypass    # ดู log
pm2 restart platobypass # รีสตาร์ท
pm2 stop platobypass    # หยุด
pm2 delete platobypass  # ลบออกจาก pm2
```

## 📝 คำสั่งบอท

- `/bypass <url>` - Bypass ลิงก์ platorelay
- `/ping` - เช็คสถานะบอท

## ⚡ ฟีเจอร์

- Auto-detect ลิงก์ platorelay
- ลบข้อความต้นฉบับ **ทันที**
- แสดงผลลัพธ์แบบ minimal embed
- Auto-restart ด้วย PM2
- Auto-update จาก GitHub + รีสตาร์ททันที
