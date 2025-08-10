"use strict";

var avtoServices = {
    "Антигравійна плівка": "400$",
    "Захист нового авто": "400$",
    "Нанокераміка": "500$",
    "Полірування": "400$",
    "Хімчистка салону": "200$",
    "Реставрація шкіри": "150$",
    "Реставрація сколів/подряпин": "80$"
};

avtoServices["Хімчистка 1 сидіння"] = "20$"; // Додаємо нові послуги «по ходу»
avtoServices["Хімчистка стелі"] = "40$";


avtoServices.price = function () {              // Метод для підрахунку загальної вартості
    let total = 0;
    for (let value of Object.values(this)) {
        if (typeof value === "string" && value.includes("$")) {
            total += parseInt(value);
        }
    }
    return total + "$";
};


avtoServices.minPrice = function () {           // Метод для пошуку мінімальної ціни
    let prices = [];
    for (let value of Object.values(this)) {
        if (typeof value === "string" && value.includes("$")) {
            prices.push(parseInt(value));
        }
    }
    return Math.min(...prices) + "$";
};


avtoServices.maxPrice = function () {              // Метод для пошуку максимальної ціни
    let prices = [];
    for (let value of Object.values(this)) {
        if (typeof value === "string" && value.includes("$")) {
            prices.push(parseInt(value));
        }
    }
    return Math.max(...prices) + "$";
};


console.log("Загальна вартість:", avtoServices.price());
console.log("Мінімальна ціна:", avtoServices.minPrice());
console.log("Максимальна ціна:", avtoServices.maxPrice());