const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS module
//const { networkAddress } = require('./networkAddress'); // นำเข้า localAddress และ networkAddress จากไฟล์ networkAddress.js
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const http = require('http'); // ✅ เพิ่มบรรทัดนี้
const WebSocket = require('ws');
const QRCode = require('qrcode');
const PORT = 5000;//3002 process.env.PORT || process.env.PORT || 5000
//const BASE_URL = process.env.REACT_APP_BASE_URL;
const TOKEN_PROCESS = process.env.JWT_SECRET;
console.log("Show Token: ",TOKEN_PROCESS);
//const HOST = "https://5991-49-49-230-168.ngrok-free.app";

// สร้าง HTTP Server จาก Express
const server = http.createServer(app);

// สร้าง WebSocket Server ที่ใช้ HTTP Server เดียวกัน
const wss = new WebSocket.Server({ port: 5001 });
console.log('wss: ',wss);

const multer = require('multer');
const fs = require('fs');

//import test from "../frontend/public/images/userprofile";


app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all origins

// const http = require('http');
// const server = http.createServer(app);
// การตั้งค่า CORS
// app.use(cors({
//   origin: 'http://localhost:3002', // เปลี่ยน URL ให้ตรงกับ Frontend ของคุณ
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true
// }));


// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ images
const path = require('path');

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
  port: process.env.DB_PORT || 3310,
  connectionLimit: 30, // เพิ่มขีดจำกัดการเชื่อมต่อ
  acquireTimeout: 15000, // เพิ่มเวลาที่รอการเชื่อมต่อ
});
// สร้างพูลการเชื่อมต่อสำหรับฐานข้อมูล flutter_login
const poolLogin = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'flutter_login',//flutter_login
  port: process.env.DB_PORT || 3310
});

// สร้างพูลการเชื่อมต่อสำหรับฐานข้อมูล flutter_login
const poolLoginlaravel = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'laravel',//flutter_login
  port: process.env.DB_PORT || 3310,
  connectionLimit: 30, // เพิ่มจำนวนการเชื่อมต่อสูงสุด
  acquireTimeout: 15000, // เพิ่มเวลาที่รอการเชื่อมต่อ
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
  port: process.env.DB_PORT || 3310,
  connectionLimit: 10,
  connectTimeout: 20000  // เพิ่มค่า timeout (หน่วยเป็นมิลลิวินาที)
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


// SignUp database laravel
// API Endpoint to handle signup
app.post('/api/signup/laravel', (req, res) => {
  const { clientName, username, email, password } = req.body;
  const hashedPassword = hashPassword(password);

  const INSERT_USER_QUERY = `INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)`;

  poolLoginlaravel.getConnection()
    .then(conn => {
      return conn.query(INSERT_USER_QUERY, [clientName, username, email, hashedPassword])
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


app.post('/api/login/laravel', (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = hashPassword(password);
//SELECT id, username, image_profile FROM users WHERE (email = ? OR username = ?) AND password = ?
  const SELECT_USER_QUERY = `SELECT 
      u.id, 
      u.username, 
      u.image_profile, 
      ci.product_id 
    FROM 
      users u
    LEFT JOIN 
      cart_items ci
    ON 
      u.id = ci.product_id 
    WHERE 
      (u.email = ? OR u.username = ?) 
      AND u.password = ?`;

  poolLoginlaravel.getConnection()
    .then(conn => {
      return conn.query(SELECT_USER_QUERY, [email, email, hashedPassword])
        .then(results => {
          if (results.length > 0) {
            
            const user = results[0];
            console.log('Query results:', results); // Log query results to check if product_id is coming as null
            console.log('Query user:', user); // Log query results to check if product_id is coming as null

            // แปลง id ที่เป็น BigInt เป็น Number
            const userId = Number(user.id);
            //const product_id = Number(product_id);
            // ตรวจสอบว่า product_id มีค่าไหม ก่อนแปลง
            const product_id = user.product_id ? Number(user.product_id) : null; // กำหนดเป็น null ถ้าไม่มี product_id


            console.log('User from DB:', user);  // ตรวจสอบข้อมูล user จากฐานข้อมูล

            // สร้าง JWT token
            const token = jwt.sign(
              { id: Number(user.id), username: user.username },//id: user.id
              TOKEN_PROCESS,//`${TOKEN_PROCESS}`,
              //{ expiresIn: '1h' }
            );

            console.log("Show Token is :",token);

            //const expiresAt = Date.now() + 3600 * 1000; // หมดอายุใน 1 ชั่วโมง

            console.log('Sending user data:', {
              username: user.username,
              id: userId,//user.id
              image_profile: `/images/userprofile/${user.image_profile}`,
              product_id: product_id,
            });

            // ส่ง token, username และ image_profile กลับไป
            res.status(200).json({
              token, //token, // คุณสามารถสร้าง JWT token ที่นี่ได้
              user: {
                username: user.username,
                id: userId,//user.id
                image_profile: `/images/userprofile/${user.image_profile}`,  // เพิ่ม /images/userprofile/ เพื่อให้เป็น URL ที่ถูกต้อง//user.image_profile
                product_id: product_id,
              },
              expiresAt: Date.now() + 3600 * 1000, // เวลาหมดอายุในรูป timestamp
              //expiresAt: Date.now() + 3600 * 1000, // เวลาหมดอายุในรูป timestamp
            });
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

// ตรวจสอบเส้นทาง
console.log(path.join(__dirname, '../frontend/public/images/userprofile'));
// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ best sellers images
app.use('/images/userprofile', express.static(path.join(__dirname, '../frontend/public/images/userprofile')));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});


// Middleware สำหรับตรวจสอบ Token และ Expiry
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // เอาค่า token จาก Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, process.env.TOKEN_PROCESS, (err, user) => {
    if (err || Date.now() > user.exp * 1000) {  // ตรวจสอบว่า token หมดอายุหรือยัง
      return res.status(401).json({ message: 'Token expired' });  // ถ้าหมดอายุ ให้ตอบว่า expired
    }

    req.user = user;  // เก็บข้อมูลผู้ใช้จาก token ไปใน request object
    next();  // ดำเนินการต่อ
  });
};

module.exports = authenticateToken;


// jwt.verify(token, process.env.TOKEN_PROCESS, (err, user) => {
//   if (err || Date.now() > user.exp * 1000) { // user.exp มาจาก JWT Payload
//     return res.status(401).json({ message: 'Token expired' });
//   }
// });


// app.post('/api/sellers-add-product', upload.single('image'), (req, res) => {
//   res.set('Cache-Control', 'no-store'); // ห้ามแคช

//   // ดึงข้อมูลจาก req.body
//   const { barcode, name, price, qty, description, category, brand } = req.body;
//   const image = req.file ? req.file.filename : null; // ใช้ชื่อไฟล์ที่อัปโหลด

//   console.log("Product data:", req.body);

//   // ตรวจสอบค่าที่จำเป็น
//   if (!barcode || !name || !price || !qty || !description || !category || !brand) {
//     console.error("Some fields are missing.");
//     return res.status(400).json({ message: "Some fields are missing." });
//   }

//   // คำสั่ง SQL สำหรับการเพิ่มสินค้า
//   const ADD_PRODUCT_QUERY = `
//     INSERT INTO products (barcode, name, price, qty, description, category, brand, image)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   poolLoginlaravel
//     .getConnection()
//     .then(conn => {
//       conn.query(ADD_PRODUCT_QUERY, [
//         barcode,
//         name,
//         price,
//         qty,
//         description,
//         category,
//         brand,
//         image
//       ])
//       .then(() => {
//         // ดึงข้อมูลสินค้าที่เพิ่มสำเร็จ
//         conn.query('SELECT * FROM products WHERE barcode = ?', [barcode])
//           .then(([product]) => {
//             const formattedProduct = {
//               ...product,
//               barcode: product.barcode.toString(), // แปลง barcode เป็น String ถ้ามันเป็น BigInt
//             };
//             res.json({
//               message: "Product added successfully",
//               product: formattedProduct
//             });
//             conn.release();
//           })
//           .catch(err => {
//             console.error("Error fetching product:", err);
//             res.status(500).json({ message: "Error fetching product" });
//             conn.release();
//           });
//       })
//       .catch(err => {
//         console.error("Error adding product:", err);
//         res.status(500).json({ message: "Error adding product" });
//         conn.release();
//       });
//     })
//     .catch(err => {
//       console.error("Database connection error:", err);
//       res.status(500).json({ message: "Database connection error" });
//     });
// });

// // ตั้งค่าการจัดเก็บไฟล์ด้วย multer
// const storagesellers = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../frontend/public/images/product')); // โฟลเดอร์เก็บไฟล์
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์แบบไม่ซ้ำ
//   },
// });

// const uploadseller = multer({ storage:storagesellers });

// const GET_CATEGORY_QUERY = `SELECT categories_id FROM categories WHERE name = ?`;
// const ADD_CATEGORY_QUERY = `INSERT INTO categories (name, description) VALUES (?, ?)`;
// const ADD_PRODUCT_QUERY = `
//     INSERT INTO products (name, price, qty, description, categories_id, brand, image, seller_id)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
// `;

// app.post('/api/sellers-add-product', uploadseller.single('image'), async (req, res) => {
//     res.set('Cache-Control', 'no-store');
//     console.log("ข้อมูลที่ได้รับจาก body: ", req.body);
//     console.log("ข้อมูลที่ได้รับจากไฟล์: ", req.file);

//     // const sellerId = req.query.sellerId; // ใช้ seller_id ที่ล็อกอิน
//     const { name, price, qty, description, category, brand, sellerId} = req.body;
//     // const image = req.file ? req.file.filename : null;
//     const image = req.file ? `${req.file.filename}` : null;
//     if (!image) {
//       return res.status(400).json({ message: "Image is required." });
//   }

//     console.log("Image filename: ", image);  // Debug the image filename
//     console.log("sellerId: ", sellerId);

//     if (!name || !price || !qty || !description || !category || !brand || !sellerId) {
//         return res.status(400).json({ message: "Some fields are missing." });
//     }

//     try {
//         const conn = await poolLoginlaravel.getConnection();

//         // ตรวจสอบว่า seller_id มีอยู่ในระบบหรือไม่
//         const [sellerExists] = await conn.query(`SELECT seller_id FROM sellers WHERE seller_id = ?`, [sellerId]);
//         if (!sellerExists.length) {
//             return res.status(404).json({ message: "Seller not found." });
//         }

//         // ตรวจสอบ categories_id โดยดูจากชื่อ category
//         let [categoryData] = await conn.query(GET_CATEGORY_QUERY, [category]);
//         console.log("categoryData: ", categoryData);
//         let categoryId;

//         if (categoryData.length) {
//             // หากหมวดหมู่มีอยู่แล้ว
//             categoryId = categoryData[0].categories_id;
//             console.log("categoryId: ", categoryId);
//         } else {
//             // หากไม่มีหมวดหมู่ในระบบ ให้เพิ่มใหม่
//             const [insertCategoryResult] = await conn.query(ADD_CATEGORY_QUERY, [category, "Auto-added category"]);
//             categoryId = insertCategoryResult.insertId;
//         }

//         // เพิ่มข้อมูลสินค้า
//         const [insertProductResult] = await conn.query(ADD_PRODUCT_QUERY, [
//             name,
//             price,
//             qty,
//             description,
//             categoryId,
//             brand,
//             image,
//             sellerId,
//         ]);

//         console.log("insertProductResult: ", insertProductResult);

//         // ดึงข้อมูลสินค้าที่เพิ่มสำเร็จ
//         const [product] = await conn.query(`SELECT * FROM products WHERE id = ?`, [insertProductResult.insertId]);
//         console.log("product: ", product);
//         res.json({
//             message: "Product added successfully",
//             product,
//         });


//         conn.release();
//     } catch (err) {
//         console.error("Error:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });


// const ADD_CATEGORY_QUERY = `INSERT INTO categories (name, description) VALUES (?, ?)`;

// กำหนดเส้นทางการบันทึกภาพ
const firstDestination = path.resolve(__dirname, "../frontend/public/images/product");
const secondDestination = "C:/xampp/htdocs/QBAdminUi-Laravel-Boilerplate-master/public/images/products";

// const storagesellers = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.resolve(__dirname, '../frontend/public/images/product')); // ใช้ path.resolve เพื่อความปลอดภัยและรองรับ OS ต่างๆ
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์แบบไม่ซ้ำ
//   },
// });

// ตั้งค่า multer
const storagesellers = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, firstDestination); // บันทึกที่แรก
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const uploadseller = multer({ storage: storagesellers });

const GET_CATEGORY_QUERY = `SELECT categories_id FROM categories WHERE name = ?`;

const ADD_PRODUCT_QUERY = `
  INSERT INTO products (categories_id, name, price, qty, image, description, brand, seller_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

// app.post('/api/sellers-add-product', uploadseller.single('image'), async (req, res) => {
//   res.set('Cache-Control', 'no-store');
//   console.log("ข้อมูลที่ได้รับจาก body: ", req.body);
//   console.log("ข้อมูลที่ได้รับจากไฟล์: ", req.file);

//   const { name, price, qty, description, category, brand, sellerId } = req.body;

//   // Convert price and qty to numbers
//   // const priceValue = parseFloat(price);
//   // const qtyValue = parseInt(qty, 10);

//   // if (isNaN(priceValue) || isNaN(qtyValue)) {
//   //   return res.status(400).json({ message: "Invalid price or quantity." });
//   // }

//   const image = req.file ? req.file.filename : null;

//   if (!image) {
//     return res.status(400).json({ message: "Image is required." });
//   }

//   console.log("Image filename: ", image);
//   console.log("sellerId: ", sellerId);

//   if (!name || !price || !qty || !description || !category || !brand || !sellerId) {
//     return res.status(400).json({ message: "Some fields are missing or invalid." });
//   }

//   try {
//     const conn = await poolLoginlaravel.getConnection();

//     try {
//       // ตรวจสอบว่า seller_id มีอยู่ในระบบหรือไม่
//       const [sellerExists] = await conn.query(`SELECT seller_id FROM sellers WHERE seller_id = ?`, [sellerId]);
//       console.log("sellerExists: ", sellerExists);

//       // ตรวจสอบ category
//       // const [categoryDataArray] = await conn.query(GET_CATEGORY_QUERY, [category]);
//       // console.log("categoryDataArray: ", categoryDataArray);
//       const categoryDataArray = await conn.query(GET_CATEGORY_QUERY, [category]);
//       console.log("categoryDataArray: ", categoryDataArray);

//       // ตรวจสอบว่าเป็นอาเรย์และมีข้อมูล
//       // if (Array.isArray(categoryDataArray) && categoryDataArray.length > 0) {
//       //   const categoryId = categoryDataArray[0].categories_id;
//       //   const categoriesId = String(categoryId);
//       //   console.log("categoriesId: ", categoriesId);
//       // } else {
//       //   return res.status(400).json({ message: "ไม่พบหมวดหมู่ที่ระบุ." });
//       // }

//       // const categoryId = [categoryDataArray]; // Access the first element
//       const categoryId = categoryDataArray.categories_id; // เข้าถึง categories_id โดยตรง
//       const categoriesId = String(categoryId);
//       console.log("categoriesId: ", categoriesId);

//       // เพิ่มข้อมูลสินค้า
//       const [insertProductResult] = await conn.query(ADD_PRODUCT_QUERY, [
//         categoriesId,
//         // JSON.stringify(categoryId),  // ส่ง categoryId เป็นอ็อบเจ็กต์ที่แปลงเป็น JSON string
//         name,
//         // priceValue,
//         // qtyValue,
//         price,
//         qty,
//         image,
//         description,
//         brand,
//         sellerId,
//       ],
//       console.log("all log:",categoriesId,
//         name,
//         // priceValue,
//         // qtyValue,
//         price,
//         qty,
//         image,
//         description,
//         brand,
//         sellerId,
//         // sellerExistssCons
//       ));

//       console.log("insertProductResult: ", insertProductResult);

//       if (!insertProductResult || !insertProductResult.insertId) {
//         return res.status(500).json({ message: "Failed to insert product." });
//       }

//       // // ดึงข้อมูลสินค้าที่เพิ่มสำเร็จ
//       // const [product] = await conn.query(`SELECT * FROM products WHERE id = ?`, [insertProductResult.insertId]);
//       // console.log("product: ", product);

//       res.json({
//         message: "Product added successfully",
//         // product: product,
//       });
//     } catch (queryErr) {
//       console.error("Database Query Error:", queryErr.message);
//       res.status(500).json({ message: "Failed to add product", error: queryErr.message });
//     } finally {
//       conn.release(); // ปิดการเชื่อมต่อฐานข้อมูล
//     }
//   } catch (connErr) {
//     console.error("Database Connection Error:", connErr.message);
//     res.status(500).json({ message: "Failed to connect to database", error: connErr.message });
//   }
// });


app.post('/api/sellers-add-product', uploadseller.single('image'), async (req, res) => {
  res.set('Cache-Control', 'no-store');
  console.log("ข้อมูลที่ได้รับจาก body: ", req.body);
  console.log("ข้อมูลที่ได้รับจากไฟล์: ", req.file);

  const { name, price, qty, description, category, brand, sellerId } = req.body;

  const image = req.file ? req.file.filename : null;

  if (!image) {
    return res.status(400).json({ message: "Image is required." });
  }

  // คัดลอกไฟล์ไปยังปลายทางที่สอง
  const sourcePath = path.join(firstDestination, image);
  const targetPath = path.join(secondDestination, image);

  console.log("Image filename: ", image);
  console.log("sellerId: ", sellerId);

  if (!name || !price || !qty || !description || !category || !brand || !sellerId) {
    return res.status(400).json({ message: "Some fields are missing or invalid." });
  }

  fs.copyFile(sourcePath, targetPath, (err) => {
    if (err) {
      console.error("Error copying file:", err);
    } else {
      console.log("File copied to second destination:", targetPath);
    }
  });

  try {

    const conn = await poolLoginlaravel.getConnection();

    try {
      // ตรวจสอบว่า seller_id มีอยู่ในระบบหรือไม่
      const [sellerExists] = await conn.query(`SELECT seller_id FROM sellers WHERE seller_id = ?`, [sellerId]);
      console.log("sellerExists: ", sellerExists);

            // ตรวจสอบผลลัพธ์จากการ query ของ category
      const [categoryDataArray] = await conn.query(GET_CATEGORY_QUERY, [category]);
      console.log("categoryDataArray: ", categoryDataArray);

      // หากเป็นอ็อบเจ็กต์ ให้เข้าถึงข้อมูล categories_id
      let categoriesId = null;
      if (categoryDataArray && categoryDataArray.categories_id) {
        categoriesId = String(categoryDataArray.categories_id);
        console.log("categoriesId: ", categoriesId);
      } else {
        return res.status(400).json({ message: "ไม่พบหมวดหมู่ที่ระบุ." });
      }


      // เพิ่มข้อมูลสินค้า
      const insertProductResult = await conn.query(ADD_PRODUCT_QUERY, [
        categoriesId,
        name,
        price,
        qty,
        image,
        description,
        brand,
        sellerId,
      ],
      console.log("All Log:",categoriesId,
        name,
        price,
        qty,
        image,
        description,
        brand,
        sellerId,)
    );

      console.log("insertProductResult: ", insertProductResult);

      if (!insertProductResult || !insertProductResult.insertId) {
        return res.status(500).json({ message: "Failed to insert product." });
      }

      res.json({
        message: "Product added successfully",
      });
    } catch (queryErr) {
      console.error("Database Query Error:", queryErr.message);
      res.status(500).json({ message: "Failed to add product", error: queryErr.message });
    } finally {
      conn.release(); // ปิดการเชื่อมต่อฐานข้อมูล
    }
  } catch (connErr) {
    console.error("Database Connection Error:", connErr.message);
    res.status(500).json({ message: "Failed to connect to database", error: connErr.message });
  }
});



app.get('/api/seller-showMyproduct', (req, res) => {
  const userId = req.query.userId;
  console.log("api user ID: ", userId);

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const Seller_products = `
    SELECT DISTINCT
        u.id AS user_id, 
        p.id AS product_id,
        p.name, 
        p.image, 
        p.qty, 
        p.price,
        p.description 
    FROM users u
    JOIN products p ON p.seller_id = u.id 
    WHERE u.id = ?
    GROUP BY p.id, p.name, p.image, p.qty, u.id;
  `;

  poolLoginlaravel.getConnection()
    .then(conn => {
      conn.query(Seller_products, [userId])
        // .then(rows => {
        .then(results => {
          console.log("results: ", results);

          if (results.length > 0) {
            // แปลง BigInt เป็น String
            const formattedResults = results.map(result => ({
              ...result,
              // id: result.id.toString(),  // แปลง id ให้เป็น String
              user_id: result.user_id.toString(),  // แปลง user_id ให้เป็น String
              product_id: result.product_id.toString(),  // แปลง user_id ให้เป็น String
              qty: result.qty.toString(),  // แปลง user_id ให้เป็น String
              price: result.price.toString(),  // แปลง user_id ให้เป็น String
            }));
            res.json(formattedResults); // ส่งข้อมูลทั้งหมดในรูปแบบ array
            console.log("formattedResults: ",formattedResults);
            console.log("results: ",results);
          } else {
            res.status(404).json({ message: "User not found" });
          }
          conn.release();

        })
        .catch(err => {
          console.error("Error fetching orders:", err);
          res.status(500).json({ error: "Failed to fetch orders." });
        })
        .finally(() => conn.release());
    })
    .catch(err => {
      console.error("Connection error:", err);
      res.status(500).json({ error: "Database connection failed." });
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




app.get('/api/seller-purchase-order', (req, res) => {
  const userId = req.query.userId;
  console.log("api user ID: ", userId);

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const Seller_purchase = `
      SELECT COUNT(*) AS orderCount FROM ordersexample 
      WHERE user_id = ?;
  `;

  poolLoginlaravel.getConnection()
    .then(conn => {
      conn.query(Seller_purchase, [userId])
        // .then(rows => {
        .then(results => {
          console.log("results: ", results);

          if (results.length > 0) {
            // ส่งจำนวนคำสั่งซื้อแบบตรงๆ
            const orderCount = results[0].orderCount.toString(); // แปลงเป็น string หากเป็น BigInt
            res.json({ orderCount });  // ส่งจำนวนคำสั่งซื้อในรูปแบบ JSON
          } else {
            res.status(404).json({ message: "User not found" });
          }
          conn.release();

        })
        .catch(err => {
          console.error("Error fetching orders:", err);
          res.status(500).json({ error: "Failed to fetch orders." });
        })
        .finally(() => conn.release());
    })
    .catch(err => {
      console.error("Connection error:", err);
      res.status(500).json({ error: "Database connection failed." });
    });
});




 // console.log("Query result rows:", [rows]);

          //  // บังคับให้ rows เป็น array เสมอ
          //  const resultArray = Array.isArray(rows) ? rows : [rows];

          // // ตรวจสอบว่ามีข้อมูล
          // if (!resultArray || resultArray.length === 0) {
          //   console.error("No data found for the given userId");
          //   return res.status(404).json({ error: "No data found." });
          // }

          // // จัดกลุ่มข้อมูลโดยใช้ Map ตาม orderId
          // const ordersMap = new Map();

          // resultArray.forEach(row => {
          //   if (!ordersMap.has(row.orderId)) {
          //     ordersMap.set(row.orderId, {
          //       orderId: row.orderId,
          //       status: row.status,
          //       finalAmount: row.finalAmount,
          //       items: [],
          //     });
          //   }

          //   const currentOrder = ordersMap.get(row.orderId);
          //   currentOrder.items.push({
          //     productId: row.productId,
          //     name: row.name,
          //     image: row.image,
          //     quantity: row.quantity,
          //     unitPrice: row.unitPrice,
          //     totalPrice: row.totalPrice,
          //   });
          // });

          // // แปลง Map เป็น Array ก่อนส่งกลับ
          // const orders = Array.from(ordersMap.values());
          // console.log("Processed Orders: ", orders);
          // // แสดงข้อมูลในแต่ละ order
          // orders.forEach(order => {
          //   console.log(`Order ID: ${order.orderId}`);
          //   console.log(`Status: ${order.status}`);
          //   console.log(`Final Amount: ${order.finalAmount}`);
            
          //   // ลูปผ่าน items ใน order
          //   order.items.forEach(item => {
          //     console.log("Product ID: ", item.productId);
          //     console.log("Product Name: ", item.name);
          //     console.log("Product Image: ", item.image);
          //     console.log("Quantity: ", item.quantity);
          //     console.log("Unit Price: ", item.unitPrice);
          //     console.log("Total Price: ", item.totalPrice);
          //   });
          // });
          // res.status(200).json(orders);




//query profile
app.get('/api/addresses', (req, res) => {
  res.set('Cache-Control', 'no-store');  // ห้ามแคช
  //const { userId } = req.body; // Assume user ID is decoded from JWT
  // const userId = req.user.id; // Assuming JWT Middleware adds this

  const userId = req.query.userId; // ดึง userId จาก query parameters
  
  console.log("api address user_Id: ", userId);
  //console.log("user_Id: ", req.user.id);

  const QUERY = `SELECT * FROM addresses WHERE user_id = ?`;

  poolLoginlaravel.getConnection()
  .then(conn =>
    conn.query(QUERY, [userId])
      .then(results => {
        if (results.length > 0) {
          // แปลง BigInt เป็น String
          const formattedResults = results.map(result => ({
            ...result,
            id: result.id.toString(),  // แปลง id ให้เป็น String
            user_id: result.user_id.toString(),  // แปลง user_id ให้เป็น String
          }));
          res.json(formattedResults); // ส่งข้อมูลทั้งหมดในรูปแบบ array
        } else {
          res.status(404).json({ message: "User not found" });
        }
        conn.release();
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Error fetching address" });
        conn.release();
      })
  )
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: "Database connection error" });
  });

});


// Update Profile Endpoint
app.post('/api/addressesInto', (req, res) => {
  res.set('Cache-Control', 'no-store'); // ห้ามแคช

  // const userId = req.query.userId; // ดึง userId จาก query parameters
  // console.log("addressline userId: ",userId);
  // // const userId = req.user.id; // Assuming JWT Middleware adds this

  const {userId, name_las, phone, addressline, city, province, postalCode, country } = req.body;
  
  console.log("addressline req.body: ",req.body);
  console.log("addressline userId: ",userId);

  if (!name_las || !phone || !addressline || !userId) {
    console.error("Some fields are missing.");
    return;
  }

  // Path ของรูปภาพที่อัปโหลด
  //const imagePath = req.file ? `${req.file.filename}` : null;
   const UPDATE_QUERY = `INSERT INTO addresses (user_id, name_lasname, phone, address_line, city, province, postal_code, country) VALUES (?, ?, ?, ?,?, ?, ?, ?)`;

  // const UPDATE_QUERY = `
  //   INSERT INTO addresses
  //   SET 
  //     name_lasname = ?, 
  //     phone = ?, 
  //     address_line = ?, 
  //     city = ?, 
  //     province = ?, 
  //     postal_code = ?, 
  //     country = ? 
  //   WHERE user_id = ?
  // `;

  poolLoginlaravel
    .getConnection()
    .then(conn => {
    // ตรวจสอบว่า userId เป็นค่าที่สามารถแปลงเป็น BigInt ได้
    let userIdBigInt;
    try {
      userIdBigInt = BigInt(userId); // แปลง userId ให้เป็น BigInt
    } catch (error) {
      console.error("Invalid userId Line455:", userId);
      return res.status(400).json({ message: "Invalid userId" });
    }
      conn.query(UPDATE_QUERY, [
        userIdBigInt, //userId
        name_las,
        phone,
        addressline,
        city,
        province,
        postalCode,
        country,
      ])
        .then(() => {
          // ดึงข้อมูลที่อัปเดตสำเร็จเพื่อแสดงผลทันที
          conn.query('SELECT * FROM addresses WHERE user_id = ?', [userIdBigInt]) //userId
          .then(([user]) => {
            // แปลง BigInt เป็น String สำหรับทุก field ที่เป็น BigInt
            // const formattedUser = {
            //   ...user,
            //   id: user.id.toString(), // แปลง id ที่อาจเป็น BigInt เป็น String
            //   user_id: user.user_id.toString(), // กรณี user_id เป็น BigInt
            // };
            
              const formattedUser = {
                ...user,
                user_id: user.user_id.toString(), // แปลง BigInt เป็น String
              };
              res.json({ 
                // message: "Address added successfully", 
                user: formattedUser 
              });
              conn.release();
            
            // res.json = function (data) {
            //   const formattedData = JSON.parse(JSON.stringify(data, (key, value) =>
            //     typeof value === 'bigint' ? value.toString() : value
            //   ));
            //   this.send(formattedData, {message: "Address added successfully"});
            // };
            // res.json({ message: "Address added successfully", user: formattedUser });
            conn.release();
          })
            .catch(err => {
              console.error(err);
              res.status(500).json({ message: "Error fetching updated profile" });
              conn.release();
            });
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: "Error updating profile" });
          conn.release();
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Database connection error" });
    });
});



app.delete('/api/addresses/delete', (req, res) => {
  const { userId, id } = req.body; // รับ userId และ productId จาก body
  console.log("Request Body:", req.body);

  if (!userId || !id) {
    return res.status(400).json({ error: "Missing userId or productId" });
  }
//product_id
  const DELETE_QUERY = `
    DELETE FROM addresses 
    WHERE user_id = ? AND id = ?
  `;

  poolLoginlaravel.getConnection()
    .then(conn => {
      return conn.query(DELETE_QUERY, [userId, id])
        .then(result => {
          if (result.affectedRows > 0) {
            res.status(200).json({ id, message: "Item removed from addresses" });
            console.log("result succes: ",id);
          } else {
            res.status(404).json({ error: "Item not found in addresses" });
            console.log("result error: ",result);
          }
        })
        .catch(err => {
          console.error('Error deleting item from addresses:', err);
          res.status(500).json({ error: 'Failed to delete item from addresses' });
        })
        .finally(() => {
          conn.release(); // Always release connection
        });
    })
    .catch(err => {
      console.error('Connection error:', err);
      res.status(500).json({ error: 'Database connection failed' });
    });
});



//query profile
app.get('/api/profile', (req, res) => {
  res.set('Cache-Control', 'no-store');  // ห้ามแคช
  //const { userId } = req.body; // Assume user ID is decoded from JWT
  const userId = req.query.userId; // ดึง userId จาก query parameters
  
  console.log("api user_Id: ", userId);
  //console.log("user_Id: ", req.user.id);

  const QUERY = `SELECT username, name, email, phoneNumber, Gender, DATE_FORMAT(CONVERT_TZ(date_of_birth, '+00:00', '+07:00'), '%Y-%m-%d') AS date_of_birth, image_profile AS imageProfile FROM users WHERE id = ?`;

  poolLoginlaravel.getConnection()
    .then(conn =>
      conn.query(QUERY, [userId])
        .then(results => {
          if (results.length > 0) {
            res.json(results[0]);
          } else {
            res.status(404).json({ message: "User not found" });
          }
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: "Error fetching profile" });
          conn.release();
        })
    )
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Database connection error" });
    });
});


///////    ตัวทกลองที่ 3 ล่าสุด     ///////

// ตั้งค่าการจัดเก็บไฟล์ด้วย multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../frontend/public/images/userprofile')); // โฟลเดอร์เก็บไฟล์
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์แบบไม่ซ้ำ
  },
});

const upload = multer({ storage });

// Update Profile Endpoint
app.put('/api/profile', upload.single('image_profile'), (req, res) => {
  res.set('Cache-Control', 'no-store'); // ห้ามแคช

  const userId = req.query.userId; // ดึง userId จาก query parameters

  const { username, name, email, phoneNumber, Gender, date_of_birth } = req.body;

  // Path ของรูปภาพที่อัปโหลด
  const imagePath = req.file ? `${req.file.filename}` : null;

  const UPDATE_QUERY = `
    UPDATE users
    SET 
      username = ?, 
      name = ?, 
      email = ?, 
      phoneNumber = ?, 
      Gender = ?, 
      date_of_birth = ?, 
      image_profile = COALESCE(?, image_profile) -- ถ้ามี image_profile ให้บันทึก, ถ้าไม่มีให้คงค่าเดิม
    WHERE id = ?
  `;

  poolLoginlaravel
    .getConnection()
    .then(conn => {
      conn.query(UPDATE_QUERY, [
        username,
        name,
        email,
        phoneNumber,
        Gender,
        date_of_birth,
        imagePath,
        userId,
      ])
        .then(() => {
          // ดึงข้อมูลที่อัปเดตสำเร็จเพื่อแสดงผลทันที
          conn.query('SELECT * FROM users WHERE id = ?', [userId])
            .then(([user]) => {
              // แปลง BigInt เป็น String
              const formattedUser = {
                ...user,
                id: user.id.toString(), // แปลง id ที่อาจเป็น BigInt เป็น String
              };
              res.json({ user: formattedUser });//message: "Profile updated successfully",
              //res.json({ message: "Profile updated successfully", user });
              conn.release();
            })
            .catch(err => {
              console.error(err);
              res.status(500).json({ message: "Error fetching updated profile" });
              conn.release();
            });
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: "Error updating profile" });
          conn.release();
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Database connection error" });
    });
});



//////////////     ตัวทกลองที่2 ค่อนข้างสมบูรณ์ขาดแสดงและบันทึกลง Database     ///////////////
// // ตั้งค่าการจัดเก็บไฟล์ด้วย multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../frontend/public/images/userprofile')); // โฟลเดอร์เก็บไฟล์
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์แบบไม่ซ้ำ
//   },
// });

// const upload = multer({ storage });

// // Update Profile Endpoint
// app.put('/api/profile', upload.single('image_profile'), (req, res) => {
//   res.set('Cache-Control', 'no-store'); // ห้ามแคช

//   const userId = req.query.userId; // ดึง userId จาก query parameters

//   // ข้อมูลที่ส่งมาจาก body
//   const { username, name, email, phoneNumber, Gender, date_of_birth } = req.body;

//   // Path ของรูปภาพที่อัปโหลด
//   let imagePath = req.file ? `images/userprofile/${req.file.filename}` : null;

//   const UPDATE_QUERY = `
//     UPDATE users
//     SET username = ?, name = ?, email = ?, phoneNumber = ?, Gender = ?, date_of_birth = ?, image_profile = ?
//     WHERE id = ?
//   `;

//   poolLoginlaravel
//     .getConnection()
//     .then(conn => {
//       conn.query(UPDATE_QUERY, [
//         username,
//         name,
//         email,
//         phoneNumber,
//         Gender,
//         date_of_birth,
//         imagePath,
//         userId,
//       ])
//         .then(() => {
//           res.json({ message: "Profile updated successfully" });
//           conn.release();
//         })
//         .catch(err => {
//           console.error(err);
//           res.status(500).json({ message: "Error updating profile" });
//           conn.release();
//         });
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({ message: "Database connection error" });
//     });
// });


////////        ตัวทดลองแรก Prototype ค่อนข้างดี           ////////
// // ตั้งค่าการจัดเก็บไฟล์ด้วย multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../frontend/public/images/userprofile')); // ใช้ path.absolute // เก็บไฟล์ในโฟลเดอร์ 'public/images' , '../frontend/public/images/userprofile');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์แบบไม่ซ้ำกัน
//   },
// });

// const upload = multer({ storage });


// //update 
// app.put('/api/profile',upload.single('image_profile'), (req, res) => {
//   res.set('Cache-Control', 'no-store');  // ห้ามแคช
//   //const userId = req.user.id; // Assume user ID is decoded from JWT
//   const userId = req.query.userId; // ดึง userId จาก query parameters

//   console.log("user_Id put: ", userId);

//   const { username, name, email, phoneNumber, Gender, date_of_birth , profileImage } = req.body;

//   console.log("req.body put: ", req.body);

//   let imagePath = profileImage;
//   if (req.file) {
//     imagePath = req.file.path;  // เก็บ path ของไฟล์ภาพที่อัปโหลด
//   }

//   const UPDATE_QUERY = `
//     UPDATE users
//     SET username = ?, name = ?, email = ?, phoneNumber = ?, Gender = ?, date_of_birth = ?, image_profile = ?
//     WHERE id = ?`;

//   poolLoginlaravel.getConnection()
//     .then(conn =>
//       conn.query(UPDATE_QUERY, [username, name, email, phoneNumber, Gender, date_of_birth, profileImage,  userId])
//         .then(() => {
//           res.json({ message: "Profile updated successfully" });
//           conn.release();
//         })
//         .catch(err => {
//           console.error(err);
//           res.status(500).json({ message: "Error updating profile" });
//           conn.release();
//         })
//     )
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({ message: "Database connection error" });
//     });
// });



// const authenticateToken = (req, res, next) => {
//   const token = req.header('Authorization')?.split(' ')[1]; // รับ token จาก header
//   console.log(token);  // เช็คว่า token ที่ได้จาก header ถูกต้องหรือไม่

//   if (!token) {
//       return res.status(401).json({ message: 'Access denied. No token provided.' });
//   }

//   try {
//       const decoded = jwt.verify(token, `${TOKEN_PROCESS}`); // ใช้ secret key ของคุณ
//       req.user = decoded; // เก็บข้อมูล user จาก token
//       next(); // ไปยัง next middleware หรือ route handler
//   } catch (err) {
//       res.status(400).json({ message: 'Invalid token.' });
//   }
// };

// app.post('/api/cart/add', (req, res) => {
//   const { userId, productId, quantity } = req.body; 

//   console.log('Api user data:', {
//         userId,
//         productId,
//         // _id_newArrival,
//         quantity,
//         // _idassets
//       });

//   if (!userId || !productId || !quantity) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const INSERT_QUERY = `INSERT INTO cart_items (user_id, product_id, quantity_id) 
//                         VALUES (?, ?, ?) 
//                         ON DUPLICATE KEY UPDATE quantity_id = quantity_id + ?`;

//   poolLoginlaravel.getConnection()
//     .then(conn => {
//       return conn.query(INSERT_QUERY, [userId, productId, quantity, quantity])
//         .then(() => {
//           // ดึงข้อมูลจาก `cart_items` และ `products`
//           return conn.query(`
//             SELECT 
//               ci.id, 
//               ci.quantity_id AS quantity, 
//               ci.added_at, 
//               p.name AS productName, 
//               p.price, 
//               p.image
//             FROM cart_items ci
//             INNER JOIN products p ON ci.product_id = p._id
//             WHERE ci.user_id = ?`, [userId]);
//         })
//         .then(productsResults => {
//           conn.release();

//           // ดึงข้อมูลจาก `new_arrivals` โดยใช้ poolBestSaller
//           return poolBestSaller.getConnection()
//             .then(conn2 => {
//               return conn2.query(`
//                 SELECT _id, image2, productName, price, color, badge, des 
//                 FROM new_arrivals 
//                 WHERE _id = ?`, [productId])
//                 .then(newArrivalResults => {
//                   conn2.release();

//                   // รวมข้อมูล products + new_arrivals
//                   const combinedResults = [...productsResults, ...newArrivalResults];

//                   console.log('Item added to cart successfully', combinedResults);
//                   res.status(200).json(combinedResults);
//                 });
//             });
//         })
//         .catch(err => {
//           console.error('Error inserting item:', err);
//           res.status(500).json({ error: 'Failed to add item to cart' });
//         });
//     })
//     .catch(err => {
//       console.error('Connection error:', err);
//       res.status(500).json({ error: 'Database connection failed' });
//     });
// });


app.post('/api/cart/add', (req, res) => {
  const { userId, productId, quantity } = req.body; // แก้ไขให้ตรงกับที่ส่งจาก client ,_idassets, _id_newArrival

  console.log('Api user data:', {
    userId,
    productId,
    // _id_newArrival,
    quantity,
    // _idassets
  });

  // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบหรือไม่
  if (!userId || !productId || !quantity) { //!_idassets ,_id_newArrival
    return res.status(400).json({ error: "Missing required fields" });
  }

// _id_newArrival
  const INSERT_QUERY = `INSERT INTO cart_items (user_id, product_id, quantity_id) 
                        VALUES (?, ?, ?) 
                        ON DUPLICATE KEY UPDATE quantity_id = quantity_id + ?`;  // ใช้ ON DUPLICATE KEY UPDATE เพื่ออัปเดตจำนวนสินค้า _idassets

  console.log("query into: ", INSERT_QUERY);

  poolLoginlaravel.getConnection()
    .then(conn => {
      return conn.query(INSERT_QUERY, [userId, productId, quantity, quantity])//_idassets ,_id_newArrival
        .then(() => {
         return conn.query(`SELECT 
                              ci.id, 
                              ci.quantity_id AS quantity, 
                              ci.added_at, 
                              p.name AS productName, 
                              p.price, 
                              p.image  
                            FROM 
                              cart_items ci
                            INNER JOIN 
                              products p 
                            ON 
                              ci.product_id = p.id
                            WHERE 
                              ci.user_id = ?`, [userId]);
        })
        .then(results => {
          console.log('Item added to cart successfully', results);
          res.status(200).json(results); 
        })
        .catch(err => {
          console.error('Error inserting item:', err);
          res.status(500).json({ error: 'Failed to add item to cart' });
        })
        .finally(() => {
          conn.release(); // Always release connection
        });
    })
    .catch(err => {
      console.error('Connection error:', err);
      res.status(500).json({ error: 'Database connection failed' });
    });
});



app.delete('/api/cart/delete', (req, res) => {
  const { userId, productId } = req.body; // รับ userId และ productId จาก body
  console.log("Request Body:", req.body);


  if (!userId || !productId) {
    return res.status(400).json({ error: "Missing userId or productId" });
  }
//product_id
  const DELETE_QUERY = `
    DELETE FROM cart_items 
    WHERE user_id = ? AND product_id = ?
  `;

  poolLoginlaravel.getConnection()
    .then(conn => {
      return conn.query(DELETE_QUERY, [userId, productId])
        .then(result => {
          if (result.affectedRows > 0) {
            res.status(200).json({ message: "Item removed from cart" });
          } else {
            res.status(404).json({ error: "Item not found in cart" });
          }
        })
        .catch(err => {
          console.error('Error deleting item from cart:', err);
          res.status(500).json({ error: 'Failed to delete item from cart' });
        })
        .finally(() => {
          conn.release(); // Always release connection
        });
    })
    .catch(err => {
      console.error('Connection error:', err);
      res.status(500).json({ error: 'Database connection failed' });
    });
});


app.delete('/api/cart/deleteall', (req, res) => {
  const { userId } = req.body; // รับ userId และ productId จาก body , productId
  console.log("Request Body:", req.body);


  if (!userId) { // || !productId
    return res.status(400).json({ error: "Missing userId or productId" });
  }
//product_id , AND id = ?
  const DELETE_QUERY = `
    DELETE FROM cart_items 
    WHERE user_id = ? 
  `;

  poolLoginlaravel.getConnection()
    .then(conn => {
      return conn.query(DELETE_QUERY, [userId]) //productId
        .then(result => {
          if (result.affectedRows > 0) {
            res.status(200).json({ message: "Item removed from cart" });
          } else {
            res.status(404).json({ error: "Item not found in cart" });
          }
        })
        .catch(err => {
          console.error('Error deleting item from cart:', err);
          res.status(500).json({ error: 'Failed to delete item from cart' });
        })
        .finally(() => {
          conn.release(); // Always release connection
        });
    })
    .catch(err => {
      console.error('Connection error:', err);
      res.status(500).json({ error: 'Database connection failed' });
    });
});




  // if (!userId) {
  //   return res.status(400).json({ error: "Missing userId" });
  // 

  // SELECT 
  //   ci.product_id AS id,
  //   SUM(ci.quantity_id) AS quantity, 
  //   MAX(ci.added_at) AS addedAt, 
  //   p.name AS productName, 
  //   p.price, 
  //   p.image  
  // FROM 
  //   cart_items ci
  // INNER JOIN 
  //   products p 
  // ON 
  //   ci.product_id = p.id
  // WHERE 
  //   ci.user_id = ?
  // GROUP BY 
  //   ci.product_id, p.name, p.price, p.image;

  ///////////////////
  // SELECT 
  //     ci.id, 
  //     ci.quantity_id AS quantity, 
  //     ci.added_at, 
  //     p.name AS productName, 
  //     p.price, 
  //     p.image  
  //   FROM 
  //     cart_items ci
  //   INNER JOIN 
  //     products p 
  //   ON 
  //     ci.product_id = p.id
  //   WHERE 
  //     ci.user_id = ?


 app.get('/api/cart', (req, res) => {
  res.set('Cache-Control', 'no-store');  // ห้ามแคช
  // ดึงข้อมูลจากฐานข้อมูลและส่งกลับ
  const { userId } = req.query; // รับ userId จาก query params

  //const SELECT_QUERY = `SELECT * FROM cart_items WHERE user_id = ?`;
  const SELECT_QUERY = `
  SELECT
    ci.product_id AS id,
    ci.quantity_id AS quantity, 
    MAX(ci.added_at) AS addedAt, 
    p.name AS productName, 
    p.price, 
    p.image  
  FROM 
    cart_items ci
  INNER JOIN 
    products p 
  ON 
    ci.product_id = p.id
  WHERE 
    ci.user_id = ?
  GROUP BY 
    ci.product_id, p.name, p.price, p.image;
  `;

  poolLoginlaravel.getConnection()
    .then(conn => {
      
      return conn.query(SELECT_QUERY, [userId])
        .then(results => {
           // แปลง BigInt เป็น string ก่อนส่งข้อมูล
          // const cartItems = results.map(item => {
          //   return {
          //     ...item,
          //     id: item.id.toString(),
          //     user_id: item.user_id.toString(),  // แปลง BigInt เป็น string
          //     product_id: item.product_id.toString(),  // แปลง BigInt เป็น string
          //     quantity_id: item.quantity_id.toString(),
          //   };
          // });
          // console.log('Item added to cart successfully', cartItems);
          // res.status(200).json(cartItems); // ส่งข้อมูลตะกร้ากลับไป
          console.log('Fetched cart items:', results);//results
          res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
          
        })
        .catch(err => {
          console.error('Error fetching cart items:', err);
          res.status(500).json({ error: 'Failed to fetch cart items' });
        })
        .finally(() => {
          conn.release(); // Always release connection
        });
    })
    .catch(err => {
      console.error('Connection error:', err);
      res.status(500).json({ error: 'Database connection failed' });
    });
});

app.delete('/api/order', (req, res) => {
  const { userId, allIds, orderId, referenceNumber } = req.body;

  console.log("Request Body:", req.body);

  if (!userId || !Array.isArray(allIds) || allIds.length === 0) {
    return res.status(400).json({ error: "Missing userId or invalid allIds" });
  }

  const productIds = allIds.map(item => item.id); // สร้าง array ของ product_id
  console.log("userId And productIds: ", userId, productIds);

  // คำสั่ง SQL สำหรับการอัปเดต status ใน orderexample เป็น 'Cancelled'
  const UPDATE_ORDER_STATUS_QUERY = `UPDATE ordersexample SET status = 'Cancelled' WHERE order_id = ? AND referenceNumber IN (?)`;

  const DELETE_CART_QUERY = `DELETE FROM cart_items WHERE user_id = ? AND product_id IN (?)`;

  poolLoginlaravel.getConnection()
    .then(conn => {
      return conn.beginTransaction()
      .then(() => {
        // อัปเดต status ใน orderexample
        return conn.query(UPDATE_ORDER_STATUS_QUERY, [orderId, referenceNumber]);
      })
        .then(() => {
          return conn.query(DELETE_CART_QUERY, [userId, productIds]);
        })
        .then(() => {
          conn.commit(); // ยืนยัน transaction
          res.status(200).json({ message: "Cart items deleted successfully." });
        })
        .catch(err => {
          conn.rollback(); // ย้อนกลับ transaction
          console.error("Error deleting cart:", err);
          res.status(500).json({ error: "Failed to delete cart items." });
        })
        .finally(() => {
          conn.release(); // ปล่อย connection
        });
    })
    .catch(err => {
      console.error("Connection error:", err);
      res.status(500).json({ error: "Database connection failed." });
    });
});


/////////   status   ///////////
app.get('/api/order/status/:referenceNumber', (req, res) => {
  let { referenceNumber } = req.params;
  console.log("req.params: ",req.params);

  // Trim ค่า referenceNumber เพื่อลบ newline หรือช่องว่างที่ไม่จำเป็น
  referenceNumber = referenceNumber.trim(); 
  console.log("referenceNumber: ",referenceNumber);

  const CHECK_STATUS_QUERY = `SELECT status FROM ordersexample WHERE referenceNumber = ?`;
  console.log("CHECK_STATUS_QUERY :", CHECK_STATUS_QUERY, "With Reference Number:", referenceNumber);

  poolLoginlaravel.getConnection()
    .then(conn => {
      return conn.query(CHECK_STATUS_QUERY, [referenceNumber]);
    })
    .then(result => {
      if (result.length > 0) {
        res.status(200).json({ status: result[0].status });
        console.log("result 1767:", result);
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
      console.log("result 1771:", result);
    })
    .catch(err => {
      console.error('Error fetching order status:', err);
      res.status(500).json({ error: 'Failed to fetch order status' });
    });
});


// SELECT 
// o.order_id AS orderId, 
// o.status, 
// o.FinalAmount AS finalAmount,
// od.product_id AS productId, 
// p.name, 
// p.image, 
// od.quantity, 
// od.UnitPrice AS unitPrice, 
// od.TotalPrice AS totalPrice
// FROM ordersexample o
// JOIN orderdetailexample od ON o.order_id = od.order_id
// JOIN products p ON od.product_id = p.id
// WHERE o.user_id = ?;

app.get('/api/history-orders', (req, res) => {
  const userId = req.query.userId;
  console.log("api user ID: ", userId);

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const ORDERS_QUERY = `
    SELECT 
      od.order_id AS orderId, 
      o.status, 
      o.FinalAmount AS finalAmount,
      od.product_id AS productId, 
      p.name, 
      p.image, 
      od.quantity, 
      od.UnitPrice AS unitPrice, 
      od.TotalPrice AS totalPrice
    FROM orderdetailexample od
    JOIN ordersexample o ON od.order_id = o.order_id
    JOIN products p ON od.product_id = p.id
    WHERE o.user_id = ?;
  `;

  poolLoginlaravel.getConnection()
    .then(conn => {
      conn.query(ORDERS_QUERY, [userId])
        .then(rows => {
          console.log("Query result rows:", [rows]);

           // บังคับให้ rows เป็น array เสมอ
           const resultArray = Array.isArray(rows) ? rows : [rows];

          // ตรวจสอบว่ามีข้อมูล
          if (!resultArray || resultArray.length === 0) {
            console.error("No data found for the given userId");
            return res.status(404).json({ error: "No data found." });
          }

          // จัดกลุ่มข้อมูลโดยใช้ Map ตาม orderId
          const ordersMap = new Map();

          resultArray.forEach(row => {
            if (!ordersMap.has(row.orderId)) {
              ordersMap.set(row.orderId, {
                orderId: row.orderId,
                status: row.status,
                finalAmount: row.finalAmount,
                items: [],
              });
            }

            const currentOrder = ordersMap.get(row.orderId);
            currentOrder.items.push({
              productId: row.productId,
              name: row.name,
              image: row.image,
              quantity: row.quantity,
              unitPrice: row.unitPrice,
              totalPrice: row.totalPrice,
            });
          });

          // แปลง Map เป็น Array ก่อนส่งกลับ
          const orders = Array.from(ordersMap.values());
          console.log("Processed Orders: ", orders);
          // แสดงข้อมูลในแต่ละ order
          orders.forEach(order => {
            console.log(`Order ID: ${order.orderId}`);
            console.log(`Status: ${order.status}`);
            console.log(`Final Amount: ${order.finalAmount}`);
            
            // ลูปผ่าน items ใน order
            order.items.forEach(item => {
              console.log("Product ID: ", item.productId);
              console.log("Product Name: ", item.name);
              console.log("Product Image: ", item.image);
              console.log("Quantity: ", item.quantity);
              console.log("Unit Price: ", item.unitPrice);
              console.log("Total Price: ", item.totalPrice);
            });
          });
          res.status(200).json(orders);
        })
        .catch(err => {
          console.error("Error fetching orders:", err);
          res.status(500).json({ error: "Failed to fetch orders." });
        })
        .finally(() => conn.release());
    })
    .catch(err => {
      console.error("Connection error:", err);
      res.status(500).json({ error: "Database connection failed." });
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



// ใช้อยู่ 21/01/2568
// app.delete('/api/order', (req, res) => {
//   //const { userId } = req.body; // รับ userId จากคำขอ
//   const { userId, allIds } = req.body; // รับ userId และ productId จาก body
//   console.log("Request Body:", req.body);


//   if (!userId || !allIds || allIds.length === 0) {
//     return res.status(400).json({ error: "Missing userId or allIds" });
//   }

//     // แปลง allIds เป็น array ของ product_id
//     const productIds = allIds.map(item => item.id);

//     const DELETE_CART_QUERY = `DELETE FROM cart_items WHERE user_id = ? AND product_id IN (?)`;

//   //const DELETE_ORDER_QUERY = `DELETE FROM orders WHERE user_id = ?`;
//   // const DELETE_CART_QUERY = `DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`;

//   poolLoginlaravel.getConnection()
//     .then(conn => {
//       return conn.beginTransaction() // เริ่ม transaction
//         // .then(() => {
//         //   // ลบคำสั่งซื้อ
//         //   return conn.query(DELETE_ORDER_QUERY, [userId, productId]);
//         // })
//         .then(() => {
//           // ลบสินค้าที่เกี่ยวข้องใน cart
//           console.log("userId And productIds: ", userId, productIds);
//           return conn.query(DELETE_CART_QUERY, [userId, productIds]);
//           // console.log("", userId, cart_id);
//         })
//         .then(() => {
//           conn.commit(); // ยืนยัน transaction
//           res.status(200).json({ message: "Order and cart items deleted successfully." });
//         })
//         .catch(err => {
//           conn.rollback(); // ย้อนกลับ transaction หากเกิดข้อผิดพลาด
//           console.error("Error deleting order or cart:", err);
//           res.status(500).json({ error: "Failed to cancel the order." });
//         })
//         .finally(() => {
//           conn.release(); // ปล่อย connection
//         });
//     })
//     .catch(err => {
//       console.error("Connection error:", err);
//       res.status(500).json({ error: "Database connection failed." });
//     });
// });


app.put('/api/cart/update-selection', (req, res) => {
  const { userId, product_id, is_selected } = req.body;
  console.log("req.body: ", req.body);

  const UPDATE_SELECTION_QUERY = `
    UPDATE cart_items
    SET is_selected = ?
    WHERE user_id = ? AND product_id = ?;
  `;

  poolLaravel.getConnection()
    .then((conn) => {
      return conn
        .query(UPDATE_SELECTION_QUERY, [is_selected, userId, product_id])
        .then(() => {
          res.status(200).json({ message: 'Selection updated successfully' });
        })
        .catch((err) => {
          console.error('Error updating selection:', err);
          res.status(500).json({ error: 'Failed to update selection' });
        })
        .finally(() => {
          conn.release();
        });
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
      res.status(500).json({ error: 'Database connection failed' });
    });
});


// อัปเดตจำนวนสินค้าในตะกร้า
app.put('/api/cart/update', (req, res) => {
  const { userId, quantity, product_id } = req.body; // รับค่า cartId และ quantity จาก request body
  console.log("update Cart Request Body:", req.body);

  if (!userId ||!product_id || quantity < 1) {
    return res.status(400).json({ error: 'Invalid cartId or quantity' });
  }

  const UPDATE_QUERY = `
    UPDATE cart_items
      SET quantity_id = ?
      WHERE product_id = ? AND user_id = ?;
  `;
  // UPDATE cart_items
  //   SET quantity_id = ?
  //   WHERE id = ?;

  // UPDATE cart_items
  //     SET quantity_id = ?
  //     WHERE cart_items.user_id = ? and cart_items.product_id = ? ;

  poolLoginlaravel.getConnection()
    .then(conn => {
      return conn.query(UPDATE_QUERY, [quantity, product_id, userId])
        .then(() => {
          // console.log(`Cart item with ID ${userId} updated to quantity ${quantity}`); //and productID: ${product_Id}
          console.log(`updated: userId ${userId}, productId ${product_id}, quantity ${quantity}`);
          res.status(200).json({ quantity, userId });
          // res.status(200).json({ message: 'Cart updated successfully' });
        })
        .catch(err => {
          console.error('Error updating cart item:', err);
          res.status(500).json({ error: 'Failed to update cart item' });
        })
        .finally(() => conn.release());
    })
    .catch(err => {
      console.error('Connection error:', err);
      res.status(500).json({ error: 'Database connection failed' });
    });
});


// อัปเดตจำนวนสินค้าในตะกร้า


// ใช้ได้
// UPDATE cart_items
//       SET quantity_id = ?
//       WHERE product_id = ? AND user_id = ?;

  // UPDATE cart_items
  //   SET quantity_id = ?
  //   WHERE id = ?;

  // UPDATE cart_items
  //     SET quantity_id = ?
  //     WHERE cart_items.user_id = ? and cart_items.product_id = ? ;

// app.post('/api/neworder', (req, res) => {
//   const { userId, quantity, product_id } = req.body; // รับค่า cartId และ quantity จาก request body
//   console.log("update Cart Request Body:", req.body);

//   if (!userId ||!product_id || quantity < 1) {
//     return res.status(400).json({ error: 'Invalid cartId or quantity' });
//   }

//   const UPDATE_QUERY = `
//     INSERT INTO orders (username, email, password) VALUES (?, ?, ?);
//   `;

//   poolLoginlaravel.getConnection()
//     .then(conn => {
//       return conn.query(UPDATE_QUERY, [quantity, product_id, userId])
//         .then(() => {
//           // console.log(`Cart item with ID ${userId} updated to quantity ${quantity}`); //and productID: ${product_Id}
//           console.log(`updated: userId ${userId}, productId ${product_id}, quantity ${quantity}`);
//           res.status(200).json({ quantity, userId });
//           // res.status(200).json({ message: 'Cart updated successfully' });
//         })
//         .catch(err => {
//           console.error('Error updating cart item:', err);
//           res.status(500).json({ error: 'Failed to update cart item' });
//         })
//         .finally(() => conn.release());
//     })
//     .catch(err => {
//       console.error('Connection error:', err);
//       res.status(500).json({ error: 'Database connection failed' });
//     });
// });
app.post('/api/neworder', async (req, res) => {
  const { userId,referenceNumber, items } = req.body;

  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid data received." });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = totalAmount * 0.07;
  const finalAmount = totalAmount + tax;

  const orderQuery = `
    INSERT INTO ordersExample (user_id, referenceNumber, TotalAmount, Discount, Tax, FinalAmount)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  const orderDetailQuery = `
    INSERT INTO orderdetailExample (order_id, user_id, product_id, quantity, UnitPrice, TotalPrice)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  let conn;

  try {
    conn = await poolLoginlaravel.getConnection();

    console.log("Executing Order Query...");
    const result = await conn.query(orderQuery, [
      userId,
      referenceNumber,
      totalAmount,
      0,
      tax,
      finalAmount,
    ]);

    console.log("Raw query result:", result);

    const orderResult = Array.isArray(result) ? result[0] : result;

    // const orderId = orderResult.insertId;
    // console.log("Order created successfully with ID:", orderId);

    const orderId = orderResult.insertId.toString(); // แปลงเป็น string
    console.log("Order created successfully with ID:", orderId);
    // const userId = orderResult.insertId.toString(); // แปลงเป็น string
    // console.log("Order created successfully with ID:", userId);

    for (const item of items) {
      console.log("Executing OrderDetail Query for Item:", item);
      await conn.query(orderDetailQuery, [
        orderId,
        userId,
        item.id,
        item.quantity,
        item.price,
        item.price * item.quantity,
      ]);
    }

    res.status(200).json({
      message: "Order placed successfully.",
      orderId,
      referenceNumber,
      // userId,
      totalAmount,
      tax,
      finalAmount,
    });
  } catch (error) {
    console.error("Error processing order:", error.message);
    res.status(500).json({ message: "Error processing order.", error: error.message });
  } finally {
    if (conn) conn.release();
  }
});


// Endpoint สำหรับรับข้อมูลการชำระเงินจาก Webhook
// app.post('/api/webhook', (req, res) => {
//   const paymentData = req.body; // ข้อมูลการชำระเงินที่ส่งมาจากธนาคารหรือผู้ให้บริการ
//   console.log('Payment Received:', paymentData);

//   // ตรวจสอบข้อมูลการชำระเงิน เช่น promptPayID, amount, หรือ status
//   if (paymentData && paymentData.status === 'PAID') {
//     console.log(`Payment confirmed for amount: ${paymentData.amount}`);
//   }

//   res.sendStatus(200); // ตอบกลับว่า Webhook รับข้อมูลสำเร็จ
// });


// WebSocket Connection
wss.on('connection', ws => {
  console.log('WebSocket connection established');
  ws.on('message', message => {
    console.log('received: %s', message);
  });
});

// Endpoint รับ Webhook
// app.post('/api/webhook', (req, res) => {
//   const paymentData = req.body;
//   console.log('Payment Received:', paymentData);

//   if (paymentData && paymentData.status === 'PAID') {
//     console.log(`Payment confirmed for amount: ${paymentData.amount}`);

//     // ส่งข้อมูลไปยัง WebSocket ทุก client ที่เชื่อมต่ออยู่
//     wss.clients.forEach(client => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(JSON.stringify({ status: 'paid', referenceNumber: paymentData.referenceNumber }));
//       }
//     });
//   }

//   res.sendStatus(200);
// });




// app.post('/api/webhook', async (req, res) => {
//   const {promptPayID, amount, orderId } = req.body; //promptPayID, amount,
//   console.log("result: ",req.body);  

//   const qrData = generatePayload(promptPayID, { amount: amount });

//   QRCode.toDataURL(qrData, (err, url) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to generate QR code' });
//     }

//     const transactionID = `TX-${Date.now()}`;

//     const updateOrderQRCode = `
//       UPDATE ordersexample
//       SET Transaction_id = ?, QRCodeUrl = ?
//       WHERE order_id = ?
//     `;

//     poolLoginlaravel.getConnection()
//       .then(conn => conn.query(updateOrderQRCode, [transactionID, url, orderId]))
//       .then(result => {
//         res.status(200).json({ orderId, transactionID, qrCodeUrl: url });
//         console.log("result: ",result); 
//       })
      
//       .catch(err => {
//         console.error('Error updating order QR code:', err);
//         res.status(500).json({ error: 'Failed to update order with QR code' });
//       });
//   });
// });

// // ฟังก์ชันที่ใช้สร้างข้อมูล QR Code
// function generatePayload(promptPayID, { amount }) {
//   // สร้างข้อมูลสำหรับการสร้าง QR Code (ตามโครงสร้างของ PromptPay)
//   return `https://promptpay.io/${promptPayID}?amount=${amount}`;
// }

/////////// ใช้ได้
// Endpoint สำหรับการรับข้อมูลและสร้าง QR Code
app.post('/api/insert-qrCodeUrl', (req, res) => {
  const { referenceNumber, qrCodeUrl} = req.body;//promptPayID, amount, 

  console.log("req.body: ",req.body);

    // สร้าง transaction ID
    const transactionID = `TX-${Date.now()}`;

    // คำสั่ง SQL ในการบันทึกข้อมูล QR Code ลงในฐานข้อมูล
    const updateOrderQRCode = `
      UPDATE ordersexample
      SET referenceNumber = ?, Transaction_id = ?, QRCodeUrl = ?
      WHERE referenceNumber = ?
    `;
    
    poolLoginlaravel.getConnection()
      .then(conn => {
        return conn.query(updateOrderQRCode, [referenceNumber, transactionID, qrCodeUrl, referenceNumber ]);
      })
      .then(result => {
        res.status(200).json({referenceNumber, transactionID, qrCodeUrl });
        console.log("result updateOrderQRCode: ",{referenceNumber, transactionID, qrCodeUrl });
      })
      .catch(err => {
        console.error('Error updating order QR code:', err);
        res.status(500).json({ error: 'Failed to update order with QR code' });
      });
  // });
});

// ฟังก์ชันที่ใช้สร้างข้อมูล QR Code
// function generatePayload(promptPayID, { amount }) {
//   // สร้างข้อมูลสำหรับการสร้าง QR Code (ตามโครงสร้างของ PromptPay)
//   return `https://promptpay.io/${promptPayID}?amount=${amount}`;
// }



//////////////////////////////////////////////////////////////
// app.post('/api/webhook', (req, res) => {
//   const { promptPayID, amount, referenceNumber, qrCodeUrl} = req.body;

//   console.log("req.body: ",req.body);

//   // สร้างข้อมูลที่ต้องการใส่ใน QR Code
//   const qrData = generatePayload(promptPayID, { amount: amount });

//   // สร้าง QR Code URL
//   QRCode.toDataURL(qrData, (err, url) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to generate QR code' });
//     }

//     // สร้าง transaction ID
//     const transactionID = `TX-${Date.now()}`;

//     // คำสั่ง SQL ในการบันทึกข้อมูล QR Code ลงในฐานข้อมูล
//     const updateOrderQRCode = `
//       UPDATE ordersexample
//       SET referenceNumber = ?, Transaction_id = ?, QRCodeUrl = ?
//       WHERE referenceNumber = ?
//     `;
    
//     poolLoginlaravel.getConnection()
//       .then(conn => {
//         return conn.query(updateOrderQRCode, [referenceNumber, transactionID, qrCodeUrl, referenceNumber ]);
//       })
//       .then(result => {
//         res.status(200).json({referenceNumber, transactionID, qrCodeUrl: url });
//         console.log("result updateOrderQRCode: ",{referenceNumber, transactionID, qrCodeUrl: url });
//       })
//       .catch(err => {
//         console.error('Error updating order QR code:', err);
//         res.status(500).json({ error: 'Failed to update order with QR code' });
//       });
//   });
// });

// // ฟังก์ชันที่ใช้สร้างข้อมูล QR Code
// function generatePayload(promptPayID, { amount }) {
//   // สร้างข้อมูลสำหรับการสร้าง QR Code (ตามโครงสร้างของ PromptPay)
//   return `https://promptpay.io/${promptPayID}?amount=${amount}`;
// }

// app.get('/api/transaction/:referenceNumber', async (req, res) => {
//   const { referenceNumber } = req.params;

//   try {
//     const query = `SELECT Transaction_id, QRCodeUrl FROM ordersexample WHERE referenceNumber = ?`;
//     const [rows] = await poolLoginlaravel.query(query, [referenceNumber]);

//     if (rows.length > 0) {
//       res.json({ transactionID: rows[0].Transaction_id, qrCodeUrl: rows[0].QRCodeUrl });
//     } else {
//       res.json({ transactionID: null, qrCodeUrl: null });
//     }
//   } catch (error) {
//     console.error('Error fetching transaction data:', error);
//     res.status(500).json({ error: 'Failed to retrieve transaction data' });
//   }
// });

    // .then(conn => {
    //   return conn.query(SELECT_transaction_idQUERY,[orderId, referenceNumber])
    //     .then(results => {
    //       res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
    //       console.log("results SELECT_transaction_idQUERY:",results);
    //       conn.release();
    //     })
    //     .catch(err => {
    //       console.error(err);
    //       res.status(500).json({ message: 'Failed to fetch best sellers.' });
    //       conn.release();
    //     });
    // })

              // แปลง BigInt เป็น String
          // const resultWithStrings = results.map(item => {
          //   return {
          //     ...item,
          //     Transaction_id: item.Transaction_id.toString()  // แปลง BigInt เป็น String
          //   };
          // });

// app.get('/api/transaction_id', (req, res) => {
//   const { orderId, referenceNumber } = req.query;
//   console.log("orderId, referenceNumber: ",req.query);

//   const SELECT_transaction_idQUERY = `
//         SELECT 
//               o.order_id,
//               o.referenceNumber, 
//               o.Transaction_id
//             FROM 
//               ordersexample o
//             WHERE 
//               o.order_id = ? AND o.referenceNumber = ?
//           `; // เปลี่ยน id เป็น _id แก้ไขตามชื่อตารางและคอลัมน์ของคุณ
  
//   poolLoginlaravel.getConnection()
//   .then(conn => {
//     return conn.query(SELECT_transaction_idQUERY, [orderId, referenceNumber])
//         .then(results => {
//           console.log("results:", results);  // ตรวจสอบประเภทของ results
//           res.status(200).json(results); // ส่งข้อมูลที่แปลงแล้วกลับเป็น JSON
//           console.log("results SELECT_transaction_idQUERY:", results);
//           conn.release();
//         })

//           .catch(err => {
//             console.error(err);
//             res.status(500).json({ message: 'Failed to fetch transaction ID.' });
//             conn.release();
//           });
//       })
//     .catch(err => {
//       console.error('Error connecting to MariaDB:', err);
//       res.status(500).json({ message: 'Failed to fetch best sellers.' });
//     });
// });

/////////////////////////////////////////////////////////
// app.get('/api/transaction/:transactionID', async (req, res) => {
//   const { referenceNumber } = req.params;
//   console.log("referenceNumber: ", referenceNumber);

//   const getTransactionQuery = `
//     SELECT referenceNumber, QRCodeUrl FROM ordersexample
//     WHERE referenceNumber = ?
//   `;

//   try {
//     const rows = await poolLoginlaravel.query(getTransactionQuery, [referenceNumber]);

//     console.log("rows:", rows);

//     if (rows.length > 0) {
//       res.status(200).json({
//         referenceNumber: rows[0].referenceNumber,
//         qrCodeUrl: rows[0].QRCodeUrl,
//       });
//     } else {
//       res.status(404).json({ message: "Transaction not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching transaction:", error);
//     res.status(500).json({ error: "Failed to fetch transaction" });
//   }
// });

// app.get('/api/transaction/:transactionID', async (req, res) => {
//   const { transactionID } = req.params;
//   console.log("transactionID: ", transactionID);

//   const getTransactionQuery = `
//     SELECT Transaction_id, QRCodeUrl FROM ordersexample
//     WHERE Transaction_id = ?
//   `;

//   try {
//     const rows = await poolLoginlaravel.query(getTransactionQuery, [transactionID]);

//     console.log("rows:", rows);

//     if (rows.length > 0) {
//       res.status(200).json({
//         transactionID: rows[0].Transaction_id,
//         qrCodeUrl: rows[0].QRCodeUrl,
//       });
//     } else {
//       res.status(404).json({ message: "Transaction not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching transaction:", error);
//     res.status(500).json({ error: "Failed to fetch transaction" });
//   }
// });


/////// ใช้ได้ 

app.get('/api/transaction/:referenceNumber', async (req, res) => {///:transactionID /:referenceNumber
  const { referenceNumber } = req.params;
  console.log("referenceNumber: ",referenceNumber);
  console.log("referenceNumber req.params: ",req.params);

  const getTransactionQuery = `
    SELECT referenceNumber, Transaction_id, QRCodeUrl FROM ordersexample
    WHERE referenceNumber = ?
  `;
  // const getTransactionQuery = `
  //   SELECT Transaction_id, QRCodeUrl FROM ordersexample
  //   WHERE Transaction_id = ?
  // `;

  try {
    const rows = await poolLoginlaravel.query(getTransactionQuery, [referenceNumber]);

    console.log("rows:", rows);
    
    if (rows.length > 0) {
      console.log("Transaction found:", rows[0]); // Log ค่าของแถวแรก
      res.status(200).json({
        referenceNumber: rows[0].referenceNumber,
        transactionID: rows[0].Transaction_id,
        qrCodeUrl: rows[0].QRCodeUrl,
      });
    } else {
      console.log("Transaction not found"); // Log กรณีไม่พบข้อมูล
      res.status(404).json({ message: "Transaction not found" });
    }
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

// app.get('/api/transaction/:referenceNumber', async (req, res) => {
//   const { referenceNumber } = req.params;
//   console.log("referenceNumber: ",referenceNumber);

//   const getTransactionQuery = `
//     SELECT referenceNumber, QRCodeUrl FROM ordersexample
//     WHERE referenceNumber = ?
//   `;
//   // const getTransactionQuery = `
//   //   SELECT Transaction_id, QRCodeUrl FROM ordersexample
//   //   WHERE Transaction_id = ?
//   // `;

//   try {
//     const rows = await poolLoginlaravel.query(getTransactionQuery, [referenceNumber]);

//     console.log("rows:", rows);
    
//     if (rows.length > 0) {
//       console.log("Transaction found:", rows[0]); // Log ค่าของแถวแรก
//       res.status(200).json({
//         referenceNumber: rows[0].referenceNumber,
//         // transactionID: rows[0].Transaction_id,
//         qrCodeUrl: rows[0].QRCodeUrl,
//       });
//     } else {
//       console.log("Transaction not found"); // Log กรณีไม่พบข้อมูล
//       res.status(404).json({ message: "Transaction not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching transaction:", error);
//     res.status(500).json({ error: "Failed to fetch transaction" });
//   }
// });


// ฟังก์ชันสำหรับสร้าง QR Code
// const generateQRCode = (referenceNumber, qrData) => {
//   const filePath = path.join(__dirname, 'qrcodes', `${referenceNumber}.png`);

//   QRCode.toFile(filePath, qrData, (err) => {
//     if (err) {
//       console.error('Error generating QR Code:', err);
//       return;
//     }

//     // เชื่อมต่อฐานข้อมูลและอัพเดตพาธไฟล์ QR Code
//     pool.getConnection()
//       .then(conn => {
//         const query = 'UPDATE ordersexample SET QRCodeUrl = ? WHERE referenceNumber = ?';
//         return conn.query(query, [filePath, referenceNumber])
//           .then(() => {
//             console.log('QR Code saved to database');
//             conn.end();
//           })
//           .catch(err => {
//             console.error('Error saving QR code path to database:', err);
//             conn.end();
//           });
//       })
//       .catch(err => {
//         console.error('Error getting connection:', err);
//       });
//   });
// };

// API Endpoint เพื่อดึงรูปภาพและข้อมูลของสินค้าขายดีจากฐานข้อมูล
app.get('/api/cart-product', (req, res) => {
  const SELECT_BEST_SELLERS_QUERY = `
  SELECT 
      p.id, 
      p.barcode, 
      p.name, 
      p.qty, 
      p.price, 
      p.image, 
      p.description, 
      c.is_selected 
  FROM 
      products p
  LEFT JOIN 
      cart_items c 
  ON 
      p.id = c.product_id;
  `; // เปลี่ยน id เป็น _id แก้ไขตามชื่อตารางและคอลัมน์ของคุณ
  
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

//API Endpoint 

// // API: Fetch products from cart
// app.get('/api/cart-product', (req, res) => {
//   const SELECT_CART_PRODUCTS_QUERY = `
//     SELECT id, barcode, name, qty, price, image, description
//     FROM products
//   `;

//   poolLaravel.getConnection()
//     .then((conn) => {
//       return conn
//         .query(SELECT_CART_PRODUCTS_QUERY)
//         .then((results) => {
//           res.status(200).json({ products: results });
//         })
//         .catch((err) => {
//           console.error('Error fetching cart products:', err);
//           res.status(500).json({ error: 'Failed to fetch cart products' });
//         })
//         .finally(() => {
//           conn.release();
//         });
//     })
//     .catch((err) => {
//       console.error('Error connecting to database:', err);
//       res.status(500).json({ error: 'Database connection failed' });
//     });
// });



// API: Fetch products from cart
app.get('/api/selected-productt_quantity_id', (req, res) => {
  const { userId } = req.query; // รับ userId จาก query params

  const SELECT_PRODUCTS_QUERY = `
    SELECT 
      SUM(total_price) AS total_sum_price, -- รวมราคาสินค้าทั้งหมด
      SUM(quantity) AS total_quantity -- รวมจำนวนสินค้าทั้งหมด
    FROM (
        SELECT 
            ci.id,
            ci.product_id,      
            ci.user_id,
            p.name AS product_name,
            SUM(ci.quantity_id) AS quantity,
            p.price,
            p.image,
            (SUM(ci.quantity_id) * p.price) AS total_price
        FROM 
            cart_items ci
        INNER JOIN 
            products p 
        ON 
            ci.product_id = p.id
        WHERE 
            ci.user_id = ?
            AND ci.is_selected = 1
        GROUP BY 
            ci.product_id, p.name, p.price, p.image
    ) AS subquery; -- ห่อคิวรีหลักด้วย subquery
    `;

  poolLaravel.getConnection()
    .then((conn) => {
      return conn
        .query(SELECT_PRODUCTS_QUERY,[userId])
        .then((results) => {
          console.log("orderdetails results: ", results)
          res.status(200).json(results); //{ products: results } 
        })
        .catch((err) => {
          console.error('Error fetching cart products:', err);
          res.status(500).json({ error: 'Failed to fetch cart products' });
        })
        .finally(() => {
          conn.release();
        });
    })
    .catch((err) => {
      console.error('Error connecting to database:', err);
      res.status(500).json({ error: 'Database connection failed' });
    });
});



//////Comment///////
///////////////
// SELECT 
//       ci.id ,
//       ci.product_id,      
//       ci.user_id , -- ID ของสินค้า
//       p.name AS product_name,        -- ชื่อสินค้า
//       SUM(ci.quantity_id) AS quantity, -- รวมจำนวนสินค้าที่มี product_id ซ้ำกัน
//       p.price,                       -- ราคาของสินค้า
//       p.image,                       -- รูปภาพสินค้า
//       (SUM(ci.quantity_id) * p.price) AS total_price -- คำนวณราคารวม
//     FROM 
//       cart_items ci
//     INNER JOIN 
//       products p 
//     ON 
//       ci.product_id = p.id
//     WHERE 
//       ci.user_id = ? -- เงื่อนไขสำหรับ user_id ที่ต้องการ
//       AND ci.is_selected = 1 -- เงื่อนไขสำหรับสินค้าที่เลือก
//     GROUP BY 
//       ci.product_id, p.name, p.price, p.image; -- Group โดย product_id

   //////// 
  //   SELECT 
  //   cart_items.id AS cart_id,
  //   cart_items.quantity_id,

  //   orderdetails.quantity,
  //   orderdetails.price,
  //   orderdetails.total
  // FROM cart_items
  // JOIN orderdetails ON cart_items.product_id = orderdetails.product_id
  // WHERE cart_items.is_selected = 1;

          // แปลง BigInt เป็น String
          // const modifiedResults = results.map((row) => ({
          //   ...row,
          //   user_id: row.user_id.toString(), // แปลง user_id
          // }));

          // console.log("orderdetails modifiedResults: ", modifiedResults)
          // res.status(200).json(modifiedResults); //{ products: results } 

// API: Fetch platforms and related products
app.get('/api/platform', (req, res) => {
  const SELECT_PLATFORMS_QUERY = `
    SELECT 
      p.id AS platformId, 
      p.name AS platformName, 
      p.logo AS platformLogo, 
      p.delivery_name AS deliveryName, 
      p.delivery_phone AS deliveryPhone, 
      p.delivery_address AS deliveryAddress, 
      p.shipping_option AS shippingOption, 
      p.shipping_cost AS shippingCost, 
      p.total_items AS totalItems, 
      p.total_price AS totalPrice,

      pr.id AS productId, 
      pr.name AS productName, 
      pr.price AS productPrice, 
      pr.qty AS productQuantity, 
      pr.image AS productImage
      
    FROM platforms p
    LEFT JOIN products pr ON p.id = pr.id
  `;
  // pr.variation AS productVariation, 

  poolLaravel.getConnection()
    .then((conn) => {
      return conn
        .query(SELECT_PLATFORMS_QUERY)
        .then((results) => {
          // Group data by platform
          const platforms = results.reduce((acc, row) => {
            let platform = acc.find((p) => p.platformId === row.platformId);
            if (!platform) {
              platform = {
                id: row.platformId,
                name: row.platformName,
                logo: row.platformLogo,
                deliveryName: row.deliveryName,
                deliveryPhone: row.deliveryPhone,
                deliveryAddress: row.deliveryAddress,
                shippingOption: row.shippingOption,
                shippingCost: row.shippingCost,
                totalItems: row.totalItems,
                totalPrice: row.totalPrice,
                products: [],
              };
              acc.push(platform);
            }
            if (row.productId) {
              platform.products.push({
                id: row.productId,
                name: row.productName,
                // variation: row.productVariation,
                price: row.productPrice,
                quantity: row.productQuantity,
                image: row.productImage,
              });
            }
            return acc;
          }, []);

          res.status(200).json({ platforms });
        })
        .catch((err) => {
          console.error('Error fetching platform data:', err);
          res.status(500).json({ error: 'Failed to fetch platform data' });
        })
        .finally(() => {
          conn.release();
        });
    })
    .catch((err) => {
      console.error('Error connecting to database:', err);
      res.status(500).json({ error: 'Database connection failed' });
    });
});

// ตรวจสอบเส้นทาง
console.log(path.join(__dirname, '../frontend/public/images/platform'));
// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ best sellers images
app.use('/images/platform', express.static(path.join(__dirname, '../frontend/public/images/platform')));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});



// อัปเดตสถานะ is_selected
app.put('/api/cart-items/:id', async (req, res) => {
  console.log(`Request received for ID: ${req.params.id}`);
  const { id } = req.params;
  const { is_selected } = req.body;

  // if (typeof is_selected !== 'boolean') {
  //   return res.status(400).json({ success: false, message: 'Invalid value for is_selected' });
  // }

  if (![0, 1, true, false].includes(is_selected)) {
    return res.status(400).json({ success: false, message: 'Invalid value for is_selected' });
  }
  

  const UPDATE_QUERY = `UPDATE cart_items SET is_selected = ? WHERE id = ?`;

  try {
    const conn = await poolLoginlaravel.getConnection();
    try {
      await conn.query(UPDATE_QUERY, [is_selected ? 1 : 0, id]);
      res.json({ success: true, message: 'Item updated successfully' });
    } catch (queryError) {
      console.error('Error updating cart item:', queryError);
      res.status(500).json({ success: false, message: 'Failed to update cart item' });
    } finally {
      conn.release();
    }
  } catch (connectionError) {
    console.error('Connection error:', connectionError);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});



// ดึงรายการสินค้าที่เลือก
app.get('/api/selected-cart-items', async (req, res) => {
  const SELECT_QUERY = `SELECT 
      cart_items.id AS cart_id,
      cart_items.quantity_id,
      products.id AS product_id,
      products.name,
      products.price,
      products.image
    FROM cart_items
    JOIN products ON cart_items.product_id = products.id
    WHERE cart_items.is_selected = 1;`;

  try {
    const conn = await poolLoginlaravel.getConnection();
    try {
      const rows = await conn.query(SELECT_QUERY);
      console.log("Show selected rows: ", rows);
      res.json(rows);
    } catch (queryError) {
      console.error('Error fetching selected items:', queryError);
      res.status(500).json({ success: false, message: 'Failed to fetch selected items' });
    } finally {
      conn.release();
    }
  } catch (connectionError) {
    console.error('Connection error:', connectionError);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});



// API Endpoint to fetch sale images from the database
app.get('/api/profile_user', (req, res) => {
  
  //const SELECT_IMAGES_QUERY = `SELECT username, images_profile FROM users`; // Assuming `sale_images` table contains image data SELECT image FROM cetegoriespro
  const SELECT_IMAGES_QUERY = `SELECT username, image_profile FROM users `;//WHERE username = ?

  poolLoginlaravel.getConnection()
   .then(conn => {
      return conn.query(SELECT_IMAGES_QUERY) // แทนที่ username ด้วยค่าจริง , [username]
         .then(results => {
            res.status(200).json(results);
            conn.release();
         })
         .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch profile information.' });
            conn.release();
         });
   })
   .catch(err => {
      console.error('Error connecting to MariaDB:', err);
      res.status(500).json({ message: 'Failed to connect to the database.' });
   });

  
  // poolLaravel.getConnection()
  //   .then(conn => {
  //     return conn.query(SELECT_IMAGES_QUERY)
  //       .then(results => {
  //         res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
  //         conn.release();
  //       })
  //       .catch(err => {
  //         console.error(err);
  //         res.status(500).json({ message: 'Failed to fetch images.' });
  //         conn.release();
  //       });
  //   })
  //   .catch(err => {
  //     console.error('Error connecting to MariaDB:', err);
  //     res.status(500).json({ message: 'Failed to fetch images.' });
  //   });

});


// ตรวจสอบเส้นทาง
console.log(path.join(__dirname, '../frontend/public/images/userprofile'));
// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ best sellers images
app.use('/images/userprofile', express.static(path.join(__dirname, '../frontend/public/images/userprofile')));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
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


// // เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ images
// const path = require('path');
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
  // const SELECT_IMAGES_QUERY = `SELECT image, productName FROM cetegoriespro`; // Assuming `sale_images` table contains image data SELECT image FROM cetegoriespro
  const SELECT_IMAGES_QUERY = `SELECT image, name, categories_id FROM categories`; // Assuming `sale_images` table contains image data SELECT image FROM cetegoriespro
  
  poolLaravel.getConnection()
    .then(conn => {
      return conn.query(SELECT_IMAGES_QUERY)
        .then(results => {
          res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
          console.log("categories-images results: ",results);
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

///////////// SQL /api/products-by-category/:categories_id ////////////
// SELECT id, name, categories_id , image , price , description
// FROM products 
// WHERE categories_id = ?

// API Endpoint to fetch products by category_id
app.get('/api/products-by-category/:categories_id', (req, res) => {
  const { categories_id } = req.params;
  console.log("categories_id: ", categories_id);
  const SELECT_PRODUCTS_QUERY = `
  SELECT 
    products.id, 
    products.name AS product_name, 
    products.categories_id, 
    products.image, 
    products.price, 
    products.description,
    categories.name AS categories_name
  FROM products
  JOIN categories ON products.categories_id = categories.categories_id
  WHERE products.categories_id = ?
    `;

  poolLaravel.getConnection()
    .then(conn => {
      return conn.query(SELECT_PRODUCTS_QUERY, [categories_id])
        .then(results => {
          res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
          console.log("Products by category:", results);
          console.log("Products by categorydata:", results.data);
          conn.release();
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Failed to fetch products.' });
          console.log("Products by category error:", err);
          conn.release();
        });
    })
    .catch(err => {
      console.error('Error connecting to MariaDB:', err);
      res.status(500).json({ message: 'Failed to fetch products.' });
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
  const SELECT_BEST_SELLERS_QUERY = 
      `SELECT id, image, name, price, color, badge, description 
        FROM products 
      WHERE id BETWEEN 106 AND 109
      ORDER BY id ASC;`; // แก้ไขตามชื่อตารางและคอลัมน์ของคุณ
  
  poolLoginlaravel.getConnection()
    .then(conn => {
      return conn.query(SELECT_BEST_SELLERS_QUERY)
        .then(results => {
          res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
          console.log("results: ",results);
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


// `SELECT 
// p.id, 
// p.categories_id, 
// p.name AS product_name, 
// COALESCE(p.cat, 'N/A') AS cat,  -- ถ้า cat เป็น NULL ให้แสดง "N/A"
// c.name AS category_name
// FROM products p
// LEFT JOIN categories c ON p.categories_id = c.categories_id;`

// SELECT 
//         p.id, 
//         p.categories_id,
//         p.barcode, 
//         p.name, 
//         p.qty, 
//         p.price, 
//         p.image, 
//         p.description
//       FROM 
//         products p
//       WHERE
//         p.categories_id = ?`, [categoryId] // คัดกรองสินค้าตาม categories_id

// API สำหรับดึงสินค้าตามหมวดหมู่
app.get("/api/products_by_category", async (req, res) => {
  // const categoryId = req.query.categoryId; // รับ category_id จาก query parameter

  // if (!categoryId) {
  //   return res.status(400).json({ error: "Missing category_id parameter" });
  // }

  try {
    const conn = await poolLoginlaravel.getConnection();
    
    const rows = await conn.query(
    `SELECT 
        c.id,
		    c.categories_id ,
        COALESCE(c.name, '') AS category_name  -- ถ้า category_name เป็น NULL ให้แสดง ""
    FROM categories c`
    );

    conn.release();
    console.log("products_by_category rows: ",rows);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API สำหรับดึงสินค้าตามหมวดหมู่
// API สำหรับดึงสินค้าตามหมวดหมู่
app.get("/api/products_specialOffers", async (req, res) => {
  const categoryId = req.query.categoryId; // รับ category_id จาก query parameter

  if (!categoryId) {
    return res.status(400).json({ error: "Missing category_id parameter" });
  }

  const SELECT_BEST_SELLERS_QUERY = `
    SELECT 
      p.id, 
      p.categories_id,
      p.barcode, 
      p.name, 
      p.qty, 
      p.price, 
      p.image, 
      p.description
    FROM 
      products p
    WHERE
      p.categories_id = ?`; // คัดกรองสินค้าตาม categories_id

  try {
    const conn = await poolLoginlaravel.getConnection(); // เชื่อมต่อกับฐานข้อมูล

    const results = await conn.query(SELECT_BEST_SELLERS_QUERY, [categoryId]); // ค้นหาสินค้าตาม categoryId

    console.log("products_specialOffers results: ", results);
    res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON

    conn.release(); // ปล่อยการเชื่อมต่อหลังจากการใช้งานเสร็จ
  } catch (err) {
    console.error("Error connecting to MariaDB:", err);
    res.status(500).json({ message: "Failed to fetch special offers." });
  }
});

// ตรวจสอบเส้นทาง
console.log(path.join(__dirname, '../frontend/public/images/product'));
// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ best sellers images
app.use('/images/product', express.static(path.join(__dirname, '../frontend/public/images/product')));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});


// SELECT 
//         p.id, 
//         p.categories_id, 
//         p.name AS product_name, 
//         COALESCE(p.cat, '') AS cat,  -- ถ้า cat เป็น NULL ให้แสดง ""
//         COALESCE(c.name, '') AS category_name  -- ถ้า category_name เป็น NULL ให้แสดง ""
//     FROM products p
//     LEFT JOIN categories c ON p.categories_id = c.categories_id;

// API Endpoint เพื่อดึงรูปภาพและข้อมูลของสินค้าขายดีจากฐานข้อมูล
app.get('/api/Pagination_categories', (req, res) => {

  const categoryId = req.query.category_id; // รับ category_id จาก query parameter

    const SELECT_BEST_SELLERS_QUERY = `
        SELECT 
            p.id AS product_id,
            p.name AS product_name,
            p.price,
            p.qty,
            c.name AS category_name
        FROM 
            products p
        LEFT JOIN 
            categories c 
        ON 
            p.category_id = c.id
        ${categoryId ? `WHERE p.category_id = ${categoryId}` : ''}
        ORDER BY 
            p.name;
    `;
  
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
app.get('/api/show-product-images', (req, res) => {
  const SELECT_BEST_SELLERS_QUERY = `SELECT id, barcode, name, qty, price, image, description FROM products`; // เปลี่ยน id เป็น _id แก้ไขตามชื่อตารางและคอลัมน์ของคุณ
  
  poolLaravel.getConnection()
    .then(conn => {
      return conn.query(SELECT_BEST_SELLERS_QUERY)
        .then(results => {
          res.status(200).json(results); // ส่งผลลัพธ์กลับเป็น JSON
          console.log("show-product-images results: ",results);
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
  const SELECT_BEST_SELLERS_QUERY = 
      `SELECT id, image, name, price, color, badge, description 
        FROM products 
      WHERE id BETWEEN 70 AND 75
      ORDER BY id ASC;
        `; // แก้ไขตามชื่อตารางและคอลัมน์ของคุณ
  
  // poolBestSaller.getConnection()
  poolLoginlaravel.getConnection()
    .then(conn => {
      return conn.query(SELECT_BEST_SELLERS_QUERY)
        .then(results => {
          console.log("new-arrivals-images results: ",results);
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
  console.log('Request URL:', req.url);
  next();
});


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
//  console.log(`Server is running host ${BASE_URL} on port ${PORT}`);
// แก้ไขส่วนที่เปิดให้บริการ server
// app.listen(port, '0.0.0.0', () => {
//   console.log(`Server is running on http://0.0.0.0:${port}`);
//   console.log(`Accessible on your network via http://<YOUR_IP>:${port}`);
// });