const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../db');
const SECRET_KEY = 'my-secret-key'; // 加密用的密钥

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

router.post('/users/login', (req, res1) => {
const inputPassword = req.body.password;
  connection.query(
    'SELECT * FROM users WHERE username = ?',
    [req.body.username],
    async(error, res) => {
      if (error) {
        res1.status(500).send(error);
        return;
      }
      if (!res.length) {
        return res1.status(200).send({ code: 1, data: null, message: '用户不存在' });
      } else {
        let user = res[0]
        const match = await bcrypt.compare(inputPassword, user.password);
        if (match) {
          // 登录成功，生成 token
          const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
            expiresIn: '2h'
          });
          res1.send({ code: 0, data: { token }, message: '登录成功' });
        } else res1.status(200).send({code: 1});
      }
      
    }
  );
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