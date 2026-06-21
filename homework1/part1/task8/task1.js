let money = +prompt("Сума грошей у гаманці:");
let price = +prompt("Вартість однієї шоколадки:");
let count = Math.floor(money / price);

alert("Ви можете купити шоколадок: " + count + ", ваша здача: " + (money - count * price) + " грн.");