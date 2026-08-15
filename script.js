// Estado de la aplicación
let players = [];
let currentPlayerId = null;

// Referencias DOM - Inicio
const btnAddPlayer = document.getElementById('btn-add-player');
const playersList = document.getElementById('players-list');
const btnStart = document.getElementById('btn-start');

// --- LÓGICA DE INICIO ---

btnAddPlayer.addEventListener('click', () => {
    const currentInputs = document.querySelectorAll('.player-input').length;
    if (currentInputs < 8) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-input';
        input.placeholder = `Nombre del Jugador ${currentInputs + 1}`;
        input.required = true;
        playersList.appendChild(input);
    } else {
        alert("El máximo es de 8 jugadores.");
    }
});

btnStart.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.player-input');
    const startingMoney = parseInt(document.getElementById('starting-money').value) || 1500;
    
    players = [];
    inputs.forEach((input, index) => {
        if (input.value.trim() !== '') {
            players.push({
                id: index,
                name: input.value.trim(),
                money: startingMoney,
                // Usamos la API de Dicebear para generar avatares únicos basados en el nombre
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${input.value.trim()}`,
                properties: []
            });
        }
    });

    if (players.length === 0) {
        alert("Debes ingresar al menos un jugador.");
        return;
    }

    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    renderPlayers();
});

// --- LÓGICA DEL JUEGO ---

function renderPlayers() {
    const grid = document.getElementById('players-grid');
    grid.innerHTML = '';

    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.onclick = () => openActionModal(player.id);
        
        card.innerHTML = `
            <img src="${player.avatar}" alt="${player.name}" class="player-avatar">
            <h3>${player.name}</h3>
            <div class="player-money">$${player.money}</div>
        `;
        grid.appendChild(card);
    });
}

// --- MODALES Y ACCIONES ---

function openActionModal(id) {
    currentPlayerId = id;
    const player = players.find(p => p.id === id);
    document.getElementById('modal-player-name').innerText = player.name;
    
    // Limpiar inputs
    document.getElementById('remove-amount').value = '';
    document.getElementById('add-amount').value = '';
    document.getElementById('property-name').value = '';

    document.getElementById('action-modal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function updatePlayerAndUI() {
    renderPlayers();
    // Si el modal de propiedades está abierto, actualizarlo también
    if (document.getElementById('properties-modal').classList.contains('active')) {
        renderProperties();
    }
}

// Acciones Financieras
function passGo() {
    const player = players.find(p => p.id === currentPlayerId);
    player.money += 200;
    updatePlayerAndUI();
    closeModal('action-modal');
}

function addMoney() {
    const amount = parseInt(document.getElementById('add-amount').value);
    if (!amount || amount <= 0) return;
    
    const player = players.find(p => p.id === currentPlayerId);
    player.money += amount;
    updatePlayerAndUI();
    closeModal('action-modal');
}

function removeMoney() {
    const amount = parseInt(document.getElementById('remove-amount').value);
    if (!amount || amount <= 0) return;
    
    const player = players.find(p => p.id === currentPlayerId);
    player.money -= amount;
    updatePlayerAndUI();
    closeModal('action-modal');
}

// --- PROPIEDADES ---

function addProperty() {
    const propNameInput = document.getElementById('property-name');
    const propName = propNameInput.value.trim();
    
    if (!propName) return;

    const player = players.find(p => p.id === currentPlayerId);
    player.properties.push({
        id: Date.now(),
        name: propName,
        houses: 0,
        hotels: 0
    });
    
    propNameInput.value = '';
    alert(`Propiedad "${propName}" agregada.`);
}

function openPropertiesModal() {
    closeModal('action-modal');
    const player = players.find(p => p.id === currentPlayerId);
    document.getElementById('prop-player-name').innerText = player.name;
    renderProperties();
    document.getElementById('properties-modal').classList.add('active');
}

function renderProperties() {
    const list = document.getElementById('properties-list');
    const player = players.find(p => p.id === currentPlayerId);
    
    list.innerHTML = '';
    
    if (player.properties.length === 0) {
        list.innerHTML = '<p>No tiene propiedades aún.</p>';
        return;
    }

    player.properties.forEach(prop => {
        const item = document.createElement('div');
        item.className = 'property-item';
        item.innerHTML = `
            <strong>${prop.name}</strong>
            <div class="property-controls">
                <div>
                    Casas: ${prop.houses} 
                    <button class="control-btn" onclick="updateBuilding(${prop.id}, 'houses', 1)">+</button>
                    <button class="control-btn" onclick="updateBuilding(${prop.id}, 'houses', -1)">-</button>
                </div>
                <div>
                    Hoteles: ${prop.hotels} 
                    <button class="control-btn" onclick="updateBuilding(${prop.id}, 'hotels', 1)">+</button>
                    <button class="control-btn" onclick="updateBuilding(${prop.id}, 'hotels', -1)">-</button>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

function updateBuilding(propId, type, change) {
    const player = players.find(p => p.id === currentPlayerId);
    const prop = player.properties.find(p => p.id === propId);
    
    if (type === 'houses') {
        prop.houses += change;
        if (prop.houses < 0) prop.houses = 0;
        if (prop.houses > 4) prop.houses = 4; // Límite típico de Monopoly
    } else {
        prop.hotels += change;
        if (prop.hotels < 0) prop.hotels = 0;
    }
    
    renderProperties();
}