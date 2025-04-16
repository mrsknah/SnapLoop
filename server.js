const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Untuk menyajikan foto yang diunggah

// Koneksi ke database RDS
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database!');
});

// Middleware untuk autentikasi
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Ambil token dari header
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Rute untuk pendaftaran pengguna
app.post('/register', async (req, res) => {
    const { username, password, role = 'user' } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).send('User  registered successfully!');
    });
});

// Rute untuk login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
                res.json({ token });
            } else {
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(404).send('User  not found');
        }
    });
});

// Konfigurasi multer untuk upload foto
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Rute untuk mengunggah foto
app.post('/upload', authenticateJWT, upload.single('photo'), (req, res) => {
    const userId = req.user.id;
    const photoUrl = req.file.path;
    const timestamp = new Date();
    db.query('INSERT INTO photos (user_id, url, timestamp) VALUES (?, ?, ?)', [userId, photoUrl, timestamp], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).send('Photo uploaded successfully!');
    });
});

// Rute untuk mendapatkan foto berdasarkan user ID
app.get('/photos/:userId', (req, res) => {
    const userId = req.params.userId;
    db.query('SELECT * FROM photos WHERE user_id = ?', [userId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Rute untuk mendapatkan semua foto
app.get('/photos', (req, res) => {
    db.query('SELECT * FROM photos', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Rute untuk mengubah informasi pengguna
app.put('/users/:id', authenticateJWT, (req, res) => {
    const userId = req.params.id;
    const { username, password } = req.body;
    const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;

    const query = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
    db.query(query, [username, hashedPassword, userId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('User  information updated successfully!');
    });
});

// Rute untuk menghapus pengguna (hanya untuk admin)
app.delete('/users/:id', authenticateJWT, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    
    const userId = req.params.id;
    db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('User  deleted successfully!');
    });
});

// Rute untuk mendapatkan informasi pengguna (hanya untuk pengguna yang terautentikasi)
app.get('/users/me', authenticateJWT, (req, res) => {
    const userId = req.user.id;
    db.query('SELECT id, username, role FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results[0]);
    });
});

// Rute untuk mendapatkan semua pengguna (hanya untuk admin)
app.get('/users', authenticateJWT, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    
    db.query('SELECT id, username, role FROM users', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Mulai server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});