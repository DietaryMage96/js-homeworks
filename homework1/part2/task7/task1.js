let amount = +prompt("Введіть суму покупки:");

if (amount >= 500) {
    alert("До сплати зі знижкою 7%: " + amount * 0.93);
} else if (amount >= 300) {
    alert("До сплати зі знижкою 5%: " + amount * 0.95);
} else if (amount >= 200) {
    alert("До сплати зі знижкою 3%: " + amount * 0.97);
} else {
    alert("До сплати без знижки: " + amount);
}