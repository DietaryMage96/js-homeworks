let allShows = [];
let myShows = getCookie('myShows');

fetch('https://api.tvmaze.com/shows')
    .then(res => res.json())
    .then(data => {
        allShows = data;
        render();
    });

function setCookie(name, value) {
    document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) + '; path=/; max-age=86400';
}

function getCookie(name) {
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            let jsonString = decodeURIComponent(cookie.substring(name.length + 1));
            return JSON.parse(jsonString);
        }
    }
    return [];
}

function addToList(id) {
    let input = document.getElementById('episodes-' + id);
    let episodes = Number(input.value) || 0;
    let show = allShows.find(s => s.id === id);

    let existing = myShows.find(s => s.id === id);
    if (existing) {
        existing.episodes = episodes;
    } else {
        myShows.push({
            id: show.id,
            name: show.name,
            genres: show.genres,
            rating: show.rating?.average || 0,
            status: show.status,
            image: show.image ? show.image.medium : '',
            episodes: episodes
        });
    }

    setCookie('myShows', myShows);
    render();
}

function editEpisodes(id) {
    let show = myShows.find(s => s.id === id);
    let newEpisodes = prompt('Введіть нову кількість переглянутих серій:', show.episodes);

    if (newEpisodes !== null) {
        show.episodes = Number(newEpisodes) || 0;
        setCookie('myShows', myShows);
        render();
    }
}

function deleteFromList(id) {
    myShows = myShows.filter(s => s.id !== id);
    setCookie('myShows', myShows);
    render();
}

function filterAndSort(shows) {
    let search = document.getElementById('searchInput').value.toLowerCase();
    let status = document.getElementById('statusFilter').value;
    let sort = document.getElementById('ratingSort').value;

    let result = shows.filter(show => {
        let matchesName = show.name.toLowerCase().includes(search);
        let matchesStatus = (status === 'all') || (show.status === status);
        return matchesName && matchesStatus;
    });

    if (sort === 'desc') {
        result.sort((a, b) => {
            let rA = a.rating?.average || a.rating || 0;
            let rB = b.rating?.average || b.rating || 0;
            return rB - rA;
        });
    } else if (sort === 'asc') {
        result.sort((a, b) => {
            let rA = a.rating?.average || a.rating || 0;
            let rB = b.rating?.average || b.rating || 0;
            return rA - rB;
        });
    }

    return result;
}

function showAverageRating() {
    let ratedShows = myShows.filter(s => s.rating > 0);

    if (ratedShows.length === 0) {
        document.getElementById('averageRating').textContent = '0';
        return;
    }

    let sum = 0;
    for (let i = 0; i < ratedShows.length; i++) {
        sum += ratedShows[i].rating;
    }

    let avg = (sum / ratedShows.length).toFixed(1);
    document.getElementById('averageRating').textContent = avg;
}

function render() {
    document.getElementById('myListCount').textContent = myShows.length;
    showAverageRating();

    document.getElementById('myShowsList').innerHTML = filterAndSort(myShows).map(show => `
        <div class="card">
            <img src="${show.image}">
            <div class="card-info">
                <h3>${show.name}</h3>
                <p><b>Жанри:</b> ${show.genres.join(', ')}</p>
                <p><b>Статус:</b> ${show.status} |  ${show.rating}</p>
                <p><b>Переглянуто серій:</b> ${show.episodes}</p>
                <button onclick="editEpisodes(${show.id})">Редагувати</button>
                <button onclick="deleteFromList(${show.id})">Видалити</button>
            </div>
        </div>
    `).join('') || '<p>Список порожній</p>';

    document.getElementById('allShowsList').innerHTML = filterAndSort(allShows).map(show => `
        <div class="card">
            <img src="${show.image ? show.image.medium : ''}">
            <div class="card-info">
                <h3>${show.name}</h3>
                <p><b>Жанри:</b> ${show.genres.join(', ')}</p>
                <p><b>Статус:</b> ${show.status} |  ${show.rating?.average || '0'}</p>
                <p>
                    Серій: 
                    <input type="number" id="episodes-${show.id}" value="1" min="0">
                    <button onclick="addToList(${show.id})">Додати</button>
                </p>
            </div>
        </div>
    `).join('') || '<p>Серіалів не знайдено</p>';
}

document.getElementById('searchInput').addEventListener('input', render);
document.getElementById('statusFilter').addEventListener('change', render);
document.getElementById('ratingSort').addEventListener('change', render);
