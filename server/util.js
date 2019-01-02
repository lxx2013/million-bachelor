/**
 * 替换字符串中的$e^x$为<img src="" alt="">标签
 */
export function latexToDOM(str){
  var reg = /\$(.*)\$/g
  return str.replace(reg, `<img src=https://math.jianshu.com/math?formula=$1 alt="$1"></img>`)
}
