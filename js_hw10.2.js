const text = "Wonderful Happiness, Time, Task, Apple Joyful titles toy";
//const text = prompt("Введіть рядок:");
const pattern =/\b[^Aa\s]{6,}\b/g;

const result = text.match(pattern);
console.log(result);