let number = +prompt("Введіть тризначне число:");

let units = number % 10;
let tens = ((number % 100) - units) / 10;
let hundreds = (number - (number % 100)) / 100;

alert("Число-перевертень: " + units + tens + hundreds);