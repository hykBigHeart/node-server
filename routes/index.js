const express = require("express");
const router = express.Router();
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