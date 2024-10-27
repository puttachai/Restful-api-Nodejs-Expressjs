async function fetchClientIP() {
    try {
        const response = await fetch('https://api.bigdatacloud.net/data/client-ip');
        if (!response.ok) {
            throw new Error('การตอบสนองของเครือข่ายไม่สำเร็จ');
        }
        const data = await response.json();
        return data.ipString; // ส่งค่า IP address กลับเพื่อใช้งานต่อไป
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึง IP:', error);
        return null; // หรือจัดการข้อผิดพลาดตามที่เหมาะสม
    }
}

// เรียกใช้ฟังก์ชันเพื่อดึง IP address และใช้งาน
fetchClientIP().then(ipAddress => {
    if (ipAddress) {
        console.log('IP ของลูกค้า:', ipAddress);
        // ทำสิ่งที่คุณต้องการด้วย IP address ที่ได้ เช่น บันทึกลงฐานข้อมูลหรือใช้ในการวิเคราะห์
    } else {
        console.log('ไม่สามารถดึง IP address ได้');
        // จัดการข้อผิดพลาดตามที่เหมาะสม
    }
});
