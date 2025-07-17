const express = require('express');
const path = require('path');
const cors = require('cors');
const { authMiddleware } = require('./utils')
const app = express();
const port = 5000;

// 解析请求体中的 JSON 数据
// 解析body里的数据
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

// 居然还必须在引入注册才能生效呢
app.use(cors()); // 允许跨域
// 静态访问上传目录
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  // res.send('Hello, World!');

  // 如果当作打包后的页面访问默认路径居然打印不出来日志
  console.log(__dirname);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 引入路由模块
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// 使用路由模块 这里定义的路径前端也需要拼接上
app.use('/', indexRouter);
app.use('/secure', authMiddleware, usersRouter);

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