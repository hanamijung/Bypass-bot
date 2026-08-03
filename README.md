# PlatoRelay Bypass Discord Bot

บอท Discord สำหรับ bypass ลิงก์ PlatoRelay อัตโนมัติ + ลบข้อความต้นฉบับทันที

## 🚀 วิธี Deploy (เลือกอย่างใดอย่างหนึ่ง)

### วิธีที่ 1: Railway.app (แนะนำ - ฟรี)
1. Fork repo นี้ไป GitHub ของคุณ
2. สมัคร [Railway](https://railway.app)
3. New Project → Deploy from GitHub repo → เลือก repo
4. ไปที่ Variables → เพิ่ม `DISCORD_TOKEN`, `CLIENT_ID`, `BACON_API_KEY`
5. Deploy อัตโนมัติทุกครั้งที่ push ขึ้น GitHub!

### วิธีที่ 2: Render.com (ฟรี)
1. Fork repo นี้ไป GitHub
2. สมัคร [Render](https://render.com)
3. New → Blueprint → Connect GitHub repo
4. ใส่ Environment Variables
5. Auto-deploy ทุกครั้งที่ push!

### วิธีที่ 3: VPS / เครื่องตัวเอง
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
# แก้ไข .env
npm start
```

**อัปเดตอัตโนมัติบน VPS:**
```bash
node update.js
# หรือตั้ง cron job ให้รันทุกชั่วโมง
```

## 📝 คำสั่งบอท

- `/bypass <url>` - Bypass ลิงก์ platorelay
- `/ping` - เช็คสถานะบอท

## ⚡ ฟีเจอร์

- Auto-detect ลิงก์ platorelay
- ลบข้อความต้นฉบับ **ทันที**
- Auto-deploy จาก GitHub
