const babel = require('babel-core')
// const code = require('./src/index.js')
// console.log('code: ', code);
// const consolePlugin = require('./remove-console.js')
const code = `
function code(x) {
  console.log(x) 
  if (true) {
    // 其他注释
    // no remove
    console.log(x)
    // hhhhhhh
    console.log(y) // reserve
    console.log(z)
  }
  return x * x
};
`

const result = babel.transform(code, {
  plugins: [
    ({types, template}) =>{
      // console.log('types: ', types);
      return {
        visitor: {
          CallExpression(path, state, scope) {
            // console.log('path, state, scope: ', state);
            // 进入是console的语句
            if(path.node.callee && types.isIdentifier(path.node.callee.object, {name: 'console'})) {
              console.log('state: ', state);
              //1. path.remove() // 直接删除该节点
              // const parentPath = path.parentPath
              // const parentNode = parentPath.node
              const { leadingComments, trailingComments } = path.parentPath.node
              // if(!leadingComments) path.remove() // 2. 删除 前面没有注释 console
              // if(!trailingComments) path.remove() // 3. 删除 后面没有注释 console
              
              // 4. 找到标记是当前行, 或上一行
              const { loc: {start: {line: nodeLine}} } = path.node
              let isKeepLeadingCommentFlag = false;
              let isKeepTrailFlagCommentFlag = false;

              // 对代码前面的注释判断
              if(leadingComments) {
                leadingComments.forEach(comment => {
                  const isRemove = /(no[t]? remove\b)|(reserve\b)/.test(comment.value)
                  if(!isRemove) {
                    isKeepLeadingCommentFlag = true
                  }
                })
              }

              // 对代码后面的注释判断
              if(trailingComments) {
                trailingComments.forEach(comment => {
                  const { loc: {start: {line: commentLine}}} = comment
                  if(commentLine === nodeLine) {
                    isKeepTrailFlagCommentFlag = true
                  }
                })
              }

              if(!isKeepLeadingCommentFlag && !isKeepTrailFlagCommentFlag) {
                path.remove()
              }
            }
          }
        }
      }
    }
  ]
})


console.log('result: ', result.code);