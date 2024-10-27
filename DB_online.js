const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS module
//const { networkAddress } = require('./networkAddress'); // นำเข้า localAddress และ networkAddress จากไฟล์ networkAddress.js

const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;//3002 process.env.PORT ||
const BASE_URL = process.env.REACT_APP_BASE_URL;
//const HOST = "https://5991-49-49-230-168.ngrok-free.app";

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all origins
// การตั้งค่า CORS
// app.use(cors({
//   origin: 'http://localhost:3002', // เปลี่ยน URL ให้ตรงกับ Frontend ของคุณ
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true
// }));

const mariadb = require('mariadb');
const crypto = require('crypto');
//require('dotenv').config();

function hashPassword(password) {
  const hashedPassword = crypto.createHash('sha512').update(password).digest('hex');
  return hashedPassword;
}

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3310
});
// สร้างพูลการเชื่อมต่อสำหรับฐานข้อมูล flutter_login
const poolLogin = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'flutter_login',
  port: process.env.DB_PORT || 3310
});

// สร้างพูลการเชื่อมต่อสำหรับฐานข้อมูล db_showproduct
const poolProduct = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'db_showproduct',
  port: process.env.DB_PORT || 3310
});

// สร้างพูลการเชื่อมต่อสำหรับฐานข้อมูล db_e_commerce
const poolBestSaller = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'db_e_commerce',
  port: process.env.DB_PORT || 3310
});

// สร้างพูลการเชื่อมต่อสำหรับฐานข้อมูล laravel
const poolLaravel = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'laravel',
  port: process.env.DB_PORT || 3310
});

// Connect to MariaDB
pool.getConnection()
  .then(conn => {
    console.log('MariaDB Connected...');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to MariaDB:', err);
    process.exit(1);
  });

  // Middleware to set cache-control header
  app.use((req, res, next) => {
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    next();
  });

  app.get('/manifest.json', (req, res) => {
    const manifest = {
        "name": "Gekko Shopping",
        "short_name": "Gekko",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#000000",
        "theme_color": "#000000",
        "icons": [
          {
            "src": "favicon.ico",
            "sizes": "64x64 32x32 24x24 16x16",
            "type": "image/x-icon"
          },
          {
            "src": "logo192.png",
            "type": "image/png",
            "sizes": "192x192"
          },
          {
            "src": "logo512.png",
            "type": "image/png",
            "sizes": "512x512"
          }
        ]
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(manifest);
});



// API Endpoint to handle signup
app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = hashPassword(password);

  const INSERT_USER_QUERY = ` INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

  poolLogin.getConnection()
    .then(conn => {
      return conn.query(INSERT_USER_QUERY, [username, email, hashedPassword])
        .then(result => {
          console.log('User added to database.');
          res.status(200).json({ message: 'User added successfully.' });
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Failed to insert user.' });
          conn.release();
        });
    })
    .catch(err => {
      console.error('Error connecting to MariaDB:', err);
      res.status(500).json({ message: 'Failed to insert user.' });
    });
});

// API Endpoint to handle login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = hashPassword(password);

  const SELECT_USER_QUERY = ` SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?`;

  poolLogin.getConnection()
    .then(conn => {
      return conn.query(SELECT_USER_QUERY, [email, email, hashedPassword])
        .then(results => {
          if (results.length > 0) {
            console.log('Login successful:', results[0]);
            res.status(200).json({ message: 'Login successful' });
          } else {
            console.log('Login failed: Invalid email/username or password');
            res.status(401).json({ message: 'Invalid email/username or password' });
          }
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Login failed' });
          conn.release();
        });
    })
    .catch(err => {
      console.error('Error connecting to MariaDB:', err);
      res.status(500).json({ message: 'Login failed' });
    });
});



// API Endpoint to fetch sale images from the database
app.get('/api/sale-images', (req, res) => {
    const SELECT_IMAGES_QUERY = `SELECT image2 FROM marketing1`; // Assuming `sale_images` table contains image data
    
    poolProduct.getConnection()
      .then(conn => {
        return conn.query(SELECT_IMAGES_QUERY)
          .then(results => {
            res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
            conn.release();
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch images.' });
            conn.release();
          });
      })
      .catch(err => {
        console.error('Error connecting to MariaDB:', err);
        res.status(500).json({ message: 'Failed to fetch images.' });
      });
  });

  // เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ images
// const path = require('path');
// app.use('/images/saleimage', express.static(path.join(__dirname, '../frontend/public/images/saleimage')));


// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ images
const path = require('path');
// ตรวจสอบเส้นทาง
console.log(path.join(__dirname, '../frontend/public/images'));
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));

// ตรวจสอบเส้นทาง
// console.log(path.join(__dirname, '../frontend/public/images'));
// // เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ best sellers images
// app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));

// app.use((req, res, next) => {
//   console.log('Request URL:', req.url);
//   next();
// });


// API Endpoint to fetch sale images from the database
app.get('/api/categories-images', (req, res) => {
  const SELECT_IMAGES_QUERY = `SELECT image, productName FROM cetegoriespro`; // Assuming `sale_images` table contains image data SELECT image FROM cetegoriespro
  
  poolBestSaller.getConnection()
    .then(conn => {
      return conn.query(SELECT_IMAGES_QUERY)
        .then(results => {
          res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Failed to fetch images.' });
          conn.release();
        });
    })
    .catch(err => {
      console.error('Error connecting to MariaDB:', err);
      res.status(500).json({ message: 'Failed to fetch images.' });
    });
});


// ตรวจสอบเส้นทาง
console.log(path.join(__dirname, '../frontend/public/images/categories'));
// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ best sellers images
app.use('/images/categories', express.static(path.join(__dirname, '../frontend/public/images/categories')));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});

// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ images
// const path = require('path');
// app.use('/images/saleimage', express.static(path.join(__dirname, '../frontend/public/images/saleimage')));


// // เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ images
// const path = require('path');
// // ตรวจสอบเส้นทาง
// console.log(path.join(__dirname, '../frontend/public/images/cetegories'));
// app.use('/images', express.static(path.join(__dirname, '../frontend/public/images/cetegories')));



// API Endpoint เพื่อดึงรูปภาพและข้อมูลของสินค้าขายดีจากฐานข้อมูล
app.get('/api/best-sellers-images', (req, res) => {
  const SELECT_BEST_SELLERS_QUERY = `SELECT _id, image2, productName, price, color, badge, des FROM best_sellers`; // แก้ไขตามชื่อตารางและคอลัมน์ของคุณ
  
  poolBestSaller.getConnection()
    .then(conn => {
      return conn.query(SELECT_BEST_SELLERS_QUERY)
        .then(results => {
          res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Failed to fetch best sellers.' });
          conn.release();
        });
    })
    .catch(err => {
      console.error('Error connecting to MariaDB:', err);
      res.status(500).json({ message: 'Failed to fetch best sellers.' });
    });
});

// ตรวจสอบเส้นทาง
console.log(path.join(__dirname, '../frontend/public/images/bestsele'));
// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ best sellers images
app.use('/images/bestsele', express.static(path.join(__dirname, '../frontend/public/images/bestsele')));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});

// API Endpoint เพื่อดึงรูปภาพและข้อมูลของสินค้าขายดีจากฐานข้อมูล
app.get('/api/Pagination', (req, res) => {
  const SELECT_BEST_SELLERS_QUERY = `SELECT _id, image2, productName, price, color, badge, des FROM best_sellers`; // แก้ไขตามชื่อตารางและคอลัมน์ของคุณ
  
  poolBestSaller.getConnection()
    .then(conn => {
      return conn.query(SELECT_BEST_SELLERS_QUERY)
        .then(results => {
          res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Failed to fetch best sellers.' });
          conn.release();
        });
    })
    .catch(err => {
      console.error('Error connecting to MariaDB:', err);
      res.status(500).json({ message: 'Failed to fetch best sellers.' });
    });
});

// ตรวจสอบเส้นทาง
console.log(path.join(__dirname, '../frontend/public/images/product'));
// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ best sellers images
app.use('/images/product', express.static(path.join(__dirname, '../frontend/public/images/product')));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});



// API Endpoint เพื่อดึงรูปภาพและข้อมูลของสินค้าขายดีจากฐานข้อมูล
app.get('/api/Pagination_laravel', (req, res) => {
  const SELECT_BEST_SELLERS_QUERY = `SELECT id, barcode, name, qty, price, image, description FROM products`; // แก้ไขตามชื่อตารางและคอลัมน์ของคุณ
  
  poolLaravel.getConnection()
    .then(conn => {
      return conn.query(SELECT_BEST_SELLERS_QUERY)
        .then(results => {
          res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Failed to fetch best sellers.' });
          conn.release();
        });
    })
    .catch(err => {
      console.error('Error connecting to MariaDB:', err);
      res.status(500).json({ message: 'Failed to fetch best sellers.' });
    });
});

// ตรวจสอบเส้นทาง
console.log(path.join(__dirname, '../frontend/public/images/product'));
// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ best sellers images
app.use('/images/product', express.static(path.join(__dirname, '../frontend/public/images/product')));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});


// API Endpoint เพื่อดึงรูปภาพและข้อมูลของสินค้าขายดีจากฐานข้อมูล
app.get('/api/new-arrivals-images', (req, res) => {
  const SELECT_BEST_SELLERS_QUERY = `SELECT _id, image2, productName, price, color, badge, des FROM new_arrivals`; // แก้ไขตามชื่อตารางและคอลัมน์ของคุณ
  
  poolBestSaller.getConnection()
    .then(conn => {
      return conn.query(SELECT_BEST_SELLERS_QUERY)
        .then(results => {
          res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Failed to fetch best sellers.' });
          conn.release();
        });
    })
    .catch(err => {
      console.error('Error connecting to MariaDB:', err);
      res.status(500).json({ message: 'Failed to fetch best sellers.' });
    });
});

// ตรวจสอบเส้นทาง
console.log(path.join(__dirname, '../frontend/public/images/NewArrivals'));
// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ best sellers images
app.use('/images/NewArrivals', express.static(path.join(__dirname, '../frontend/public/images/NewArrivals')));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);0
  next();
});


// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ images
//app.use('/images', express.static(path.join(__dirname, '../public/images')));

//https://5991-49-49-230-168.ngrok-free.app
// const HOST = '127.0.0.1';
// app.listen(PORT, HOST, () => {//networkAddress
//   console.log(`Server is running on http://${HOST}:${PORT}`);//${networkAddress}192.168.0.105
//   console.log(`Access via ngrok: https://5991-49-49-230-168.ngrok-free.app`); // แสดง URL ของ ngrok
// });

// const ngrokUrl = 'https://7343-49-49-230-168.ngrok-free.app'; // ใช้ URL ที่ ngrok สร้างขึ้น
// app.listen(PORT, () => {
//   console.log(`Server is running on ${ngrokUrl} to port ${PORT}`);
// });

// app.listen(PORT, 'https://7343-49-49-230-168.ngrok-free.app', () => {
//   console.log(`Server running at http://https://7343-49-49-230-168.ngrok-free.app:${[PORT]}/`);
// });

app.listen(PORT, () => {
  console.log(`Server is running at http://host:${PORT}`);
});
//  console.log(`Server is running host ${BASE_URL} on port ${PORT}`);
// แก้ไขส่วนที่เปิดให้บริการ server
// app.listen(port, '0.0.0.0', () => {
//   console.log(`Server is running on http://0.0.0.0:${port}`);
//   console.log(`Accessible on your network via http://<YOUR_IP>:${port}`);
// });