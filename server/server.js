const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Koneksi ke database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) throw err;
    console.log('Database connected!');
});

// Middleware untuk autentikasi
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
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

// Rute untuk mengunggah foto
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

app.post('/upload', authenticateJWT, upload.single('photo'), (req, res) => {
    const userId = req.user.id;
    const photoUrl = req.file.path;
    const timestamp = new Date();
    db.query('INSERT INTO photos (user_id, url, timestamp) VALUES (?, ?, ?)', [userId, photoUrl, timestamp], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).send('Photo uploaded successfully!');
    });
});

// Rute untuk mendapatkan foto berdasarkan user_id
app.get('/photos/:userId', (req, res) => {
    const userId = req.params.userId;
    db.query('SELECT * FROM photos WHERE user_id = ?', [userId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Rute untuk mendapatkan semua pengguna
app.get('/users', (req, res) => {
    db.query('SELECT id, username, role FROM users', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Rute untuk mengubah informasi pengguna
app.put('/users/:id', authenticateJWT, (req, res) => {
    const userId = req.params.id;
    const { username, password } = req.body;
    const updates = [];
    if (username) updates.push(`username = '${username}'`);
    if (password) updates.push(`password = '${bcrypt.hashSync(password, 10)}'`);

    db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, [userId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('User  updated successfully!');
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

// Menjalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});