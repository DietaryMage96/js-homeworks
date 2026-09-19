let spysokFilmiv = [];
let daniZApi = [];
let notificationTimer = null;

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showNotification(type, message) {
    const banner = document.getElementById("notificationBanner");
    if (!banner) return;

    if (notificationTimer) {
        clearTimeout(notificationTimer);
    }

    banner.className = `ios-notification ${type}`;
    const icon = type === "success" ? "✓" : "⚠️";
    banner.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    banner.style.display = "flex";

    notificationTimer = setTimeout(() => {
        banner.style.display = "none";
    }, 4500);
}

function setLoading(isLoading, message = "Завантаження...") {
    const loader = document.getElementById("loadingIndicator");
    if (!loader) return;
    if (isLoading) {
        loader.textContent = `⏳ ${message}`;
        loader.style.display = "inline-block";
    } else {
        loader.style.display = "none";
    }
}

function pokazatyPovidomlennia(id, text) {
    let element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

async function fetchJSON(url, options) {
    let response = await fetch(url, options);

    if (response.status === 204) {
        return null;
    }

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error("Некоректна відповідь сервера (не JSON)");
    }

    if (!response.ok) {
        throw new Error(data.error || "Помилка при зверненні до сервера");
    }

    return data;
}

function pobuduvatyQuery() {
    let params = new URLSearchParams();
    let pooshuk = document.getElementById("searchInput").value.trim();
    let vybranyyZhanr = document.getElementById("genreFilter").value;
    let vybranyyStatus = document.getElementById("statusFilter").value;

    if (pooshuk) params.set("search", pooshuk);
    if (vybranyyZhanr) params.set("genre", vybranyyZhanr);
    if (vybranyyStatus) params.set("status", vybranyyStatus);

    let query = params.toString();
    return query ? "?" + query : "";
}

async function zavantazhytyFilmy() {
    setLoading(true, "Отримання списку фільмів...");
    try {
        let res = await fetchJSON("/api/movies" + pobuduvatyQuery());
        spysokFilmiv = Array.isArray(res) ? res : (res && res.data ? res.data : []);

        let sortuvannya = document.getElementById("sortSelect").value;
        if (sortuvannya == "desc") {
            spysokFilmiv.sort(function(a, b) { return b.rating - a.rating; });
        }
        if (sortuvannya == "asc") {
            spysokFilmiv.sort(function(a, b) { return a.rating - b.rating; });
        }
    } finally {
        setLoading(false);
    }
}

async function onovytyStatystyku() {
    try {
        let res = await fetchJSON("/api/movies/stats");
        let stats = res && res.data ? res.data : res;
        document.getElementById("avgRating").textContent = stats.averageRating;
        document.getElementById("watchedCount").textContent = stats.watchedCount;
    } catch (e) {
        console.error("Не вдалося завантажити статистику:", e);
    }
}

async function onovytyZhanry() {
    try {
        let select = document.getElementById("genreFilter");
        let staryyZhanr = select.value;
        let res = await fetchJSON("/api/movies");
        let filmy = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        let vsiZhanry = [];

        for (let i = 0; i < filmy.length; i++) {
            let film = filmy[i];
            if (Array.isArray(film.genres)) {
                for (let j = 0; j < film.genres.length; j++) {
                    let zhanr = film.genres[j];
                    if (vsiZhanry.indexOf(zhanr) == -1) {
                        vsiZhanry.push(zhanr);
                    }
                }
            }
        }

        select.innerHTML = "<option value=''>Усі жанри</option>";
        for (let i = 0; i < vsiZhanry.length; i++) {
            let opt = document.createElement("option");
            opt.value = vsiZhanry[i];
            opt.textContent = vsiZhanry[i];
            if (vsiZhanry[i] == staryyZhanr) {
                opt.selected = true;
            }
            select.appendChild(opt);
        }
    } catch (e) {
        console.error("Не вдалося оновити жанри:", e);
    }
}

function pokazatySpysok() {
    let tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (spysokFilmiv.length == 0) {
        tbody.innerHTML = "<tr><td colspan='6' class='ios-empty-text'>Ваш список фільмів порожній</td></tr>";
        return;
    }

    for (let i = 0; i < spysokFilmiv.length; i++) {
        let f = spysokFilmiv[i];
        let isWatched = f.status == "watched";
        let statusPill = isWatched
            ? "<span class='ios-pill-status ios-pill-watched'>✓ Переглянуто</span>"
            : "<span class='ios-pill-status ios-pill-plan'>⏱ У планах</span>";

        let genresBadges = Array.isArray(f.genres)
            ? f.genres.map(g => "<span class='ios-badge'>" + escapeHtml(g) + "</span>").join("")
            : "";

        let ryadok = document.createElement("tr");
        ryadok.innerHTML = "<td><strong>" + escapeHtml(f.name) + "</strong></td>" +
            "<td>" + genresBadges + "</td>" +
            "<td><span class='ios-rating-tag'>★ " + escapeHtml(f.rating) + "</span></td>" +
            "<td>" + escapeHtml(f.year) + "</td>" +
            "<td>" + statusPill + "</td>" +
            "<td>" +
            "<button type='button' class='ios-btn ios-btn-action ios-btn-edit' onclick='redaguvaty(\"" + escapeHtml(f.id) + "\")'>Редагувати</button> " +
            "<button type='button' class='ios-btn ios-btn-action ios-btn-delete' onclick='vydalyty(\"" + escapeHtml(f.id) + "\")'>Видалити</button>" +
            "</td>";
        tbody.appendChild(ryadok);
    }
}

async function render() {
    try {
        await zavantazhytyFilmy();
        pokazatySpysok();
        await onovytyStatystyku();
        await onovytyZhanry();
    } catch (error) {
        showNotification("error", error.message);
    }
}

async function zavantazhytyApi() {
    try {
        pokazatyPovidomlennia("apiStatus", "Завантажуємо популярне...");
        let res = await fetchJSON("/api/movies/external");
        daniZApi = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        pokazatyApiTablytsu();
        pokazatyPovidomlennia("apiStatus", "Готово!");
    } catch (error) {
        pokazatyPovidomlennia("apiStatus", error.message);
    }
}

async function zavantazhytyRekomendatsii() {
    try {
        pokazatyPovidomlennia("apiStatus", "Генеруємо рекомендації...");
        let res = await fetchJSON("/api/movies/recommendations");
        daniZApi = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        pokazatyApiTablytsu();
        pokazatyPovidomlennia("apiStatus", "Знайдено рекомендацій: " + daniZApi.length);
        showNotification("success", `Знайдено ${daniZApi.length} персоналізованих рекомендацій!`);
    } catch (error) {
        pokazatyPovidomlennia("apiStatus", error.message);
        showNotification("error", `Помилка завантаження рекомендацій: ${error.message}`);
    }
}

async function searchApi() {
    let zapyt = document.getElementById("apiSearchInput").value.trim();
    let url = "/api/movies/external";
    if (zapyt) {
        url += "?search=" + encodeURIComponent(zapyt);
    }

    try {
        pokazatyPovidomlennia("apiStatus", "Шукаємо...");
        let res = await fetchJSON(url);
        daniZApi = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        pokazatyApiTablytsu();
        pokazatyPovidomlennia("apiStatus", "Знайдено: " + daniZApi.length);
    } catch (error) {
        pokazatyPovidomlennia("apiStatus", error.message);
        showNotification("error", `Помилка пошуку в API: ${error.message}`);
    }
}

function shukatyVApi() {
    searchApi();
}

function pokazatyApiTablytsu() {
    let body = document.getElementById("apiTableBody");
    body.innerHTML = "";

    if (daniZApi.length == 0) {
        body.innerHTML = "<tr><td colspan='3' class='ios-empty-text'>Нічого не знайдено</td></tr>";
        return;
    }

    for (let i = 0; i < daniZApi.length; i++) {
        let film = daniZApi[i];
        let ryadok = document.createElement("tr");
        ryadok.innerHTML = "<td><strong>" + escapeHtml(film.name) + "</strong></td>" +
            "<td><span class='ios-rating-tag'>★ " + escapeHtml(film.rating) + "</span></td>" +
            "<td><button type='button' class='ios-btn ios-btn-action ios-btn-add' onclick='dodatyZApi(" + i + ")'>+ Додати</button></td>";
        body.appendChild(ryadok);
    }
}

async function dodatyZApi(index) {
    let film = daniZApi[index];
    if (!film) return;

    try {
        setLoading(true, "Додавання фільму...");
        await fetchJSON("/api/movies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(film)
        });
        showNotification("success", `Фільм "${film.name}" успішно додано до вашого списку!`);
        await render();
    } catch (error) {
        showNotification("error", error.message);
    } finally {
        setLoading(false);
    }
}

document.getElementById("movieForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    let saveBtn = document.getElementById("saveBtn");
    let id = document.getElementById("movieId").value.trim();
    let nazva = document.getElementById("name").value.trim();
    let zhanryText = document.getElementById("genres").value.trim();
    let retyng = Number(document.getElementById("rating").value);
    let rik = Number(document.getElementById("year").value);
    let status = document.getElementById("status").value;

    // Frontend validation
    if (!nazva) {
        showNotification("error", "Назва фільму не може бути порожньою");
        return;
    }
    if (!zhanryText) {
        showNotification("error", "Вкажіть хоча б один жанр");
        return;
    }
    if (isNaN(retyng) || retyng < 0 || retyng > 10) {
        showNotification("error", "Рейтинг повинен бути числом від 0 до 10");
        return;
    }
    if (isNaN(rik) || rik < 1888 || rik > 2100) {
        showNotification("error", "Рік випуску повинен бути в межах від 1888 до 2100");
        return;
    }

    let film = {
        name: nazva,
        genres: zhanryText,
        rating: retyng,
        year: rik,
        status: status
    };

    // Prevent duplicate clicks (disable button)
    saveBtn.disabled = true;
    let originalText = saveBtn.textContent;
    saveBtn.textContent = "Збереження...";
    setLoading(true, "Збереження фільму...");

    try {
        if (id !== "") {
            await fetchJSON("/api/movies/" + encodeURIComponent(id), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(film)
            });
            showNotification("success", "Фільм успішно оновлено!");
        } else {
            await fetchJSON("/api/movies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(film)
            });
            showNotification("success", "Новий фільм успішно збережено!");
        }

        resetForm();
        await render();
    } catch (error) {
        showNotification("error", error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
        setLoading(false);
    }
});

function redaguvaty(id) {
    for (let i = 0; i < spysokFilmiv.length; i++) {
        if (spysokFilmiv[i].id == id) {
            let f = spysokFilmiv[i];
            document.getElementById("movieId").value = f.id;
            document.getElementById("name").value = f.name;
            document.getElementById("genres").value = Array.isArray(f.genres) ? f.genres.join(", ") : f.genres;
            document.getElementById("rating").value = f.rating;
            document.getElementById("year").value = f.year;
            document.getElementById("status").value = f.status;

            document.getElementById("formTitle").textContent = "Редагувати фільм";
            document.getElementById("saveBtn").textContent = "Зберегти зміни";
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }
}

async function vydalyty(id) {
    if (!confirm("Ви дійсно бажаєте видалити цей фільм?")) {
        return;
    }

    try {
        setLoading(true, "Видалення фільму...");
        await fetchJSON("/api/movies/" + encodeURIComponent(id), {
            method: "DELETE"
        });
        showNotification("success", "Фільм успішно видалено!");
        await render();
    } catch (error) {
        showNotification("error", error.message);
    } finally {
        setLoading(false);
    }
}

function resetForm() {
    document.getElementById("movieId").value = "";
    document.getElementById("movieForm").reset();
    document.getElementById("formTitle").textContent = "Додати власний фільм";
    document.getElementById("saveBtn").textContent = "Зберегти";
}

function ochystytyFormu() {
    resetForm();
}

async function start() {
    await render();
    await zavantazhytyApi();
}

start();
