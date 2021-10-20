// these are the variables you can use as inputs to your algorithms
console.log(fxhash)
console.log(fxhashValues)
console.log(fxhashValues2)

// this code writes the values to the DOM as an example
const container = document.createElement("div")
container.innerText = `
  random hash: ${fxhash}\n
  random values: [ ${fxhashValues.join(', ')} ]\n
  random values 2: [ ${fxhashValues2.join(', ')} ]
`
document.body.prepend(container)