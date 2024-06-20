const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 5000;

// 创建 MySQL 连接
const connection = mysql.createConnection({
  // 为什么昨天用的3306还可以，今天用3306一直报错
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'my_database',
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


// 解析请求体中的 JSON 数据
app.use(express.json());

// 专门处理 favicon.ico 请求
// app.get('/favicon.ico', (req, res) => res.status(204));

app.use((request, response, next)=> {
  // clearConsole()
  console.log(request.url);
  console.log('request.query', request.query, 'request.params', request.params, 'request.body', request.body);
  console.log('有人请求了服务器！！！');
  next()
})

// 设置静态资源路径，将 public 文件夹作为静态资源提供给客户端
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  // res.send('Hello, World!');

  // 如果当作打包后的页面访问默认路径居然打印不出来日志
  console.log(__dirname);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/** 对应着的第一种 */ 
app.get('/api/v1/persons', (req, res) => {
  const arr = {
    code: 0,
    arr: [
      {id: 0, name: '张三'},
    {id: 1, name: '李四'},
    {id: 2, name: '王五'},
    ]
  }
  res.send(arr);
});

/** 对应着的第二种 */ 
app.get('/persons', (req, res) => {
  const arr = {
    code: 0,
    arr: [
      {id: 0, name: '张三'},
    {id: 1, name: '李四'},
    {id: 2, name: '王五'},
    ]
  }
  res.send(arr);
});


app.get('/login/code', (req, res) => {
  const arr = {
    code: 0,
    data: 'http://dummyimage.com/100x40/dcdfe6/000000.png&text=V3Admin',
    message: '获取验证码成功'
  }
  res.send(arr);
});

app.post('/users/login', (req, res) => {
  const obj = {
    code: 0,
    data: {token: "token-admin"},
    message: '登录成功'
  }
  res.send(obj);
});

app.get('/users/info', (req, res) => {
    const obj = {
      code: 0,
      data: { username: "admin", roles: ["admin"] },
      message: '获取用户详情成功'
    }
    res.send(obj);
  });


// 查询
app.get('/users', (req, res) => {
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
app.post('/user', (req, res) => {
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
app.delete('/user/:id', (req, res) => {
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
app.delete('/users', (req, res) => {
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
app.put('/user', (req, res) => {
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


// 处理 POST 请求
app.post('/post', (req, res) => {
  console.log('req',req.body);
  const data = req.body; // 获取请求体数据
  let returnData = []
  if (data.id == 1) {
    returnData = [{id: 1, name: '习近平'}]
  } else {
    returnData = [{id: 2, name: '毛泽东'}]
  }
  // 在这里进行处理和逻辑操作
  // ...

  res.json({ message: 'POST request received', returnData });
});

app.listen(port, (err) => {
  if (!err) console.log(`Server is running on port ${port}`); //  http://localhost:5000
  if (err) console.log(err);
});

// 清屏函数
function clearConsole() {
  process.stdout.write('\x1Bc'); // 使用控制字符清除终端
  // 或者可以使用 console.clear()，具体取决于你的终端环境支持哪种方式
  // console.clear();
}

// 开启服务
// node server.js