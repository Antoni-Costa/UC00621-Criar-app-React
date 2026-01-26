function example() {
  var x = 1;
  let y = 2;
  const z = 3;
 
  if (true) {
    var x = 10; // This reassigns the outer 'x'
    let y = 20; // This creates a new 'y' with block scope
    const z = 30; // This creates a new 'z' with block scope
    let a = 100;
    console.log(x, y, z, a); // Output: 10 20 30
  }
 
  console.log(x, y, z); // Output: 10 2 3 (var 'x' changed, 'y' and 'z' remain unchanged)
}
 
example();