"use strict"


function getNumberDegree (a, b) {
        let interval = 1;   //  початкове значення, бо будь-яке число в 0 степені буде 1;
for (let i = 1; i <= b; i++) {
            interval *= a;    
}
return interval;
}

let currentNumber = prompt ("введіть число");
let numberDegree = prompt ("введіть степінь");
let result = getNumberDegree (Number(currentNumber),Number(numberDegree));
console.log ("Result:", result);
