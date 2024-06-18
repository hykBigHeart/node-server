const express = require('express');
const helmet = require('helmet');
const app = express();
const port = 5000;

const path = require('path');

// 解析请求体中的 JSON 数据
app.use(express.json());

// 使用 Helmet 设置 CSP
app.use(helmet.contentSecurityPolicy({
  directives: {
    // defaultSrc: ["'self'"],
    // scriptSrc: ["'self'", "'unsafe-inline'"], // 允许内联脚本（不推荐，实际使用中应尽量避免）
    // frameSrc: ["'self'", "http://192.168.1.109:5000"], // 允许嵌入特定的来源
  },
}));

// 专门处理 favicon.ico 请求
// app.get('/favicon.ico', (req, res) => res.status(204));

app.use((request, response, next)=> {
  clearConsole()
  console.log(request.url);
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