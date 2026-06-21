let day = +prompt("Введіть день:");
let month = +prompt("Введіть місяць:");
let year = +prompt("Введіть рік:");
let maxDays;

switch (month) {
    case 2:
        let vus = (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0));
        maxDays = vus ? 29 : 28;
        break;
    case 4: case 6: case 9: case 11:
        maxDays = 30;
        break;
    default:
        maxDays = 31;
}

day++;
if (day > maxDays) {
    day = 1;
    month++;
}
if (month > 12) {
    month = 1;
    year++;
}

alert(`Наступна дата: ${day}.${month}.${year}`);