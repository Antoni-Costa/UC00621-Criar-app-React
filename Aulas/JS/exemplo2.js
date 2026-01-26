// Global Scope
var globalVar = "I'm a global variable"; // var is globally scoped or function scoped
let globalLet = "I'm also in global scope"; // let is block scoped
const globalConst = "I remain constant in the global scope"; // const is block scoped
 
function scopeExample() {
  // Function Scope
  var functionVar = "I'm a function-scoped variable";
  let functionLet = "I'm block-scoped within the function";
  const functionConst = "I remain constant within the function";
 
  if (true) {
    // Block Scope within the function
    var blockVar = "I'm function-scoped because of var";
    let blockLet = "I'm block-scoped within this block";
    const blockConst = "I remain constant within this block";
 
    console.log(blockVar); // "I'm function-scoped because of var"
    console.log(blockLet); // "I'm block-scoped within this block"
    console.log(blockConst); // "I remain constant within this block"
  }
 
  console.log(blockVar); // "I'm function-scoped because of var"
  console.log(blockLet); // ReferenceError: blockLet is not defined
  console.log(blockConst); // ReferenceError: blockConst is not defined
 
  console.log(functionVar); // "I'm a function-scoped variable"
  console.log(functionLet); // "I'm block-scoped within the function"
  console.log(functionConst); // "I remain constant within the function"
}
 
scopeExample();
 
console.log(globalVar); // "I'm a global variable"
console.log(globalLet); // "I'm also in global scope"
console.log(globalConst); // "I remain constant in the global scope"
console.log(functionVar); // ReferenceError: functionVar is not defined