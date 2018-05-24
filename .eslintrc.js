module.exports = {
  "extends": ["airbnb-base"],
  "env": {
    "es6": true,
    "node": true
  },
  "rules": {
    "comma-dangle": ["error", "never"], // 要求或禁止末尾逗号：不允许逗号
    "indent": ["error", 2], // JavaScript代码强制使用一致的缩进：2格缩进
    "semi": ["error", "never"], // 不使用分号
    "arrow-parens": ["error", "as-needed"], // 箭头函数的参数可以不使用圆括号
    "linebreak-style": "off", // 取消换行符\n或\r\n的验证
    "object-curly-newline": ["error", { "consistent": true }], // 花括号内的换行符不一定要格式一致
    "function-paren-newline": "off", // 不验证函数括号内的换行
    "import/extensions": "off", // 取消对文件扩展名的验证
    "no-param-reassign": "off", // 允许对函数参数进行再赋值
    "no-underscore-dangle": "off", // 允许在标识符中使用下划线
    "no-use-before-define": "off", // 允许变量和函数在定义前使用
    "no-unused-expressions": "off", // 允许使用未使用过的表达式，以此来支持a && a()的代码形式
    "no-console": "off", // 启用console控制台
    "consistent-return": "off", // 关闭函数中return的检测
    "no-shadow": "off", // 可以使用同名变量,
    "newline-per-chained-call": "off", //取消方法链调用中的换行符的检测
    "import/newline-after-import": "off"
  }
}