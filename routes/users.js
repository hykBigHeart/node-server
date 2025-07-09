const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const connection = require('../db');

// 设置上传路径和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // 上传目录（确保存在）
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// 查询
router.get('/users', (req, res) => {
  // const querySql = `
  //   SELECT * FROM users;
  //   SELECT COUNT(*) as total FROM users;
  // `;

  const page = parseInt(req.query.currentPage) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const username = req.query.username || '';
  const offset = (page - 1) * pageSize;

  let querySql = `
    SELECT * FROM users WHERE username LIKE ? LIMIT ? OFFSET ?;
    SELECT COUNT(*) as total FROM users WHERE username LIKE ?;
  `;

  const searchValue = `%${username}%`;

  connection.query(querySql, [searchValue, pageSize, offset, searchValue], (error, results) => {
    if (error) {
      res.status(500).send('Error querying the database');
      return;
    }
    const obj = {
      code: 0,
      data: {
        list: results[0],
        total: results[1][0].total
      },
      message: '获取用户列表成功'
    }
    res.json(obj);
  });
});

// 增
router.post('/user', (req, res) => {
  const { username, password, imageUrl } = req.body

  // let addSql = `INSERT INTO users(id, username, email, age) VALUES(0, ?, ?, ?)`

  // 新增的id为当前顺延当前id值最大的 + 1
  const addSql = `
    SET @next_id := (
      SELECT MIN(t1.id + 1)
      FROM users t1
      LEFT JOIN users t2 ON t1.id + 1 = t2.id
      WHERE t2.id IS NULL
    );
    SET @next_id := IFNULL(@next_id, 1);
    INSERT INTO users (id, username, password, email, age, imageUrl) VALUES (@next_id, ?, ?, ?, ?, ?);
  `;

  let addSqlParams = [username, password, 'email@email.com', 18, imageUrl];
  connection.query(addSql, addSqlParams, (error, results) => {
    if (error) {
      res.status(500).send(error);
      return;
    }
    const obj = {
      code: 0,
      data: {},
      message: '新增成功'
    }
    res.json(obj);
  });
});

// 上传接口
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 1, message: '没有文件上传' });
  }
  res.json({
    code: 0,
    message: '上传成功',
    url: `http://localhost:5000/uploads/${req.file.filename}`
  });
});

// 单删
router.delete('/user/:id', (req, res) => {
  console.log('res.query', req.query, 'req.params', req.params, 'req.body', req.body);
  let delSql = `DELETE FROM users WHERE id=${req.params.id}`
  connection.query(delSql, (error, results) => {
    if (error) {
      res.status(500).send('Error querying the database');
      return;
    }
    const obj = {
      code: 0,
      data: {},
      message: '删除成功'
    }
    res.json(obj);
  });
});

//  批量删
router.delete('/users', (req, res) => {
  // console.log('res.query', req.query, 'req.params', req.params, 'req.body', req.body);
  let delSql = `DELETE FROM users WHERE id IN (${req.body.ids.join()})`
  connection.query(delSql, (error, results) => {
    if (error) {
      res.status(500).send('Error querying the database');
      return;
    }
    const obj = {
      code: 0,
      data: {},
      message: '删除成功'
    }
    res.json(obj);
  });
});

// 改
router.put('/user', (req, res) => {
  const { username, password, id } = req.body
  let editSql = `UPDATE users SET username = ? WHERE id = ?`
  let editSqlParams = [username, id];
  connection.query(editSql, editSqlParams, (error, results) => {
    if (error) {
      res.status(500).send('Error querying the database');
      return;
    }
    const obj = {
      code: 0,
      data: {},
      message: '新增成功'
    }
    res.json(obj);
  });
});

module.exports = router