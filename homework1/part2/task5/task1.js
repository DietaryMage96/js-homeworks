let str = prompt("Введіть п'ятирозрядне число:");

if (str && str.length === 5) {
    let palilinepal = (str[0] === str[4] && str[1] === str[3])
        ? "Число є паліндромом"
        : "Число не є паліндромом";
    alert(palilinepal);
} else {
    alert("Помилка: число не п'ятирозрядне");
}