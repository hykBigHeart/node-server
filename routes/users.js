const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// 创建 MySQL 连接
const connection = mysql.createConnection({
  // 为什么昨天用的3306还可以，今天用3306一直报错
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true  // 启用多语句查询
});
// 连接到数据库
connection.connect(error => {
  if (error) {
    console.error('Error connecting to the database:', error);
    return;
  }
  console.log('Connected to the MySQL database.');
});

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
  const { username, password } = req.body

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
    INSERT INTO users (id, username, email, age) VALUES (@next_id, ?, ?, ?);
  `;

  let addSqlParams = [username, password, 18];
  connection.query(addSql, addSqlParams, (error, results) => {
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