"use strict";

function checkProbabilityTheory(count) {
    let evenNumbers = 0;
    let oddNumbers = 0;

    for (let i = 0; i < count; i++) {
       
        let num = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;  // Генеруємо випадкові числа від 100 до 1000 включно

        if (num % 2 === 0) {            //рахуємо парні/непарні числа
            evenNumbers++;
        } else {
            oddNumbers++;
        }
    }

    
    let evenPercent = (evenNumbers / count * 100).toFixed(2);   // Обчислення відсотків з округленням 
    let oddPercent = (oddNumbers / count * 100).toFixed(2);

    console.log("Кількість згенерованих чисел: " + count);
    console.log("Парних чисел: " + evenNumbers);
    console.log("Непарних чисел: " + oddNumbers);
    console.log("Відсоток парних: " + evenPercent + "%");
    console.log("Відсоток непарних: " + oddPercent + "%");
}


let userCount = Number(prompt("Введіть кількість рандом чисел для генерації:")); // використовуємо промпт для вводу кількості випадкових чисел

checkProbabilityTheory(userCount);