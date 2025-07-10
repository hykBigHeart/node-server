const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../db');

// 注册
router.post('/user/register', async (req, res) => {
  const rawPassword = req.body.password;
  // 加密：hash(原始密码, 盐的轮数)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

  // 存到数据库
  connection.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [req.body.username, hashedPassword],
    (error, results) => {
      if (error) {
        res.status(500).send(error);
        return;
      }

      const obj = {
        code: 0,
        data: null,
        message: '注册成功'
      }
      res.send(obj);
    }
  )
});

// 登录初始化接口
router.get('/login/code', (req, res) => {
  const arr = {
    code: 0,
    data: 'http://dummyimage.com/100x40/dcdfe6/000000.png&text=V3Admin',
    message: '获取验证码成功'
  }
  res.send(arr);
});

router.post('/users/login', (req, res) => {
  const obj = {
    code: 0,
    data: {token: "token-admin"},
    message: '登录成功'
  }
  res.send(obj);
});

router.get('/users/info', (req, res) => {
  const obj = {
    code: 0,
    data: { username: "admin", roles: ["admin"] },
    message: '获取用户详情成功'
  }
  res.send(obj);
});

module.exports = router