const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, phone, name, role = 'student' } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const existingUser = await query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (username, password, phone, name, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, phone, name, role]
    );

    const user = {
      id: result.insertId,
      username,
      phone,
      name,
      role
    };

    const token = generateToken(user);
    res.json({ token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const users = await query('SELECT * FROM users WHERE username = ? AND status = "active"', [username]);
    if (users.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: '手机号不能为空' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`Verification code for ${phone}: ${code}`);
    
    res.json({ 
      success: true, 
      message: '验证码已发送',
      code: process.env.NODE_ENV === 'development' ? code : undefined
    });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ error: '发送验证码失败' });
  }
});

router.post('/login-by-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: '手机号和验证码不能为空' });
    }

    if (process.env.NODE_ENV !== 'development' && code !== '123456') {
      return res.status(401).json({ error: '验证码错误' });
    }

    let users = await query('SELECT * FROM users WHERE phone = ? AND status = "active"', [phone]);
    
    if (users.length === 0) {
      const username = `user_${phone.slice(-8)}`;
      const result = await query(
        'INSERT INTO users (username, phone, name, role) VALUES (?, ?, ?, ?)',
        [username, phone, `用户${phone.slice(-4)}`, 'student']
      );
      users = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    }

    const user = users[0];
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      },
      isNewUser: users.length === 0
    });
  } catch (error) {
    console.error('Login by code error:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

module.exports = router;
