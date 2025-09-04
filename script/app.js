const vocab = vocabulary.map((word, index) => {
    return {de: word, en: vocabulary[index + 1]};
}).filter((_, index) => index % 2 === 0);

let deck = [...vocab];
let currentCards = [];
let startX = 0;
let currentX = 0;
let isDragging = false;

const app = document.getElementById('app');
const deckCount = document.getElementById('deck-count');

function updateDeckCount() {
    deckCount.textContent = `${deck.length}`;
}

function createCard(item, stackIndex = 0) {
    const card = document.createElement('div');
    card.classList.add('card');
    if (stackIndex > 0) {
        card.classList.add(`stack-${stackIndex}`);
    }
    card.innerHTML = `
                <div class="front">${item.en}</div>
                <div class="back">${item.de}</div>
            `;

    if (stackIndex === 0) {
        card.addEventListener('click', () => {
            card.classList.add('revealed');
        });

        card.addEventListener('touchstart', dragStart, {passive: false});
        card.addEventListener('touchmove', dragMove, {passive: false});
        card.addEventListener('touchend', dragEnd);

        card.addEventListener('mousedown', dragStart);
        card.addEventListener('mousemove', dragMove);
        card.addEventListener('mouseup', dragEnd);
        card.addEventListener('mouseleave', dragEnd);
    }

    return card;
}

function loadCards() {
    currentCards.forEach(card => card.remove());
    currentCards = [];

    const cardsToShow = Math.min(deck.length, 4);
    for (let i = 0; i < cardsToShow; i++) {
        const item = deck[i];
        const card = createCard(item, i);
        app.appendChild(card);
        currentCards.push(card);
    }

    updateDeckCount();
}

function loadNextCard() {
    if (deck.length === 0) {
        alert('Alle Vokabeln gemeistert!');
        currentCards.forEach(card => card.remove());
        currentCards = [];
        updateDeckCount();
        return;
    }

    currentCards[0].remove();
    currentCards.shift();
    deck.shift();

    currentCards.forEach((card, index) => {
        card.classList.remove(`stack-${index + 1}`);
        card.classList.add(`stack-${index}`);
        if (index === 0) {
            card.classList.add('zoom');
            setTimeout(() => card.classList.remove('zoom'), 500);
            card.addEventListener('click', () => card.classList.toggle('revealed'));
            card.addEventListener('touchstart', dragStart, {passive: false});
            card.addEventListener('touchmove', dragMove, {passive: false});
            card.addEventListener('touchend', dragEnd);
            card.addEventListener('mousedown', dragStart);
            card.addEventListener('mousemove', dragMove);
            card.addEventListener('mouseup', dragEnd);
            card.addEventListener('mouseleave', dragEnd);
        }
    });

    if (deck.length > currentCards.length) {
        const newItem = deck[currentCards.length];
        const newCard = createCard(newItem, currentCards.length);
        newCard.classList.add('new-card');
        app.appendChild(newCard);
        currentCards.push(newCard);
        setTimeout(() => newCard.classList.remove('new-card'), 400);
    }

    updateDeckCount();
}

function dragStart(e) {
    if (e.type === 'touchstart') {
        startX = e.touches[0].clientX;
    } else {
        startX = e.clientX;
    }
    isDragging = true;
    currentCards[0].classList.add('swiping');
}

function dragMove(e) {
    if (!isDragging) return;

    if (e.type === 'touchmove') {
        e.preventDefault();
        currentX = e.touches[0].clientX - startX;
    } else {
        currentX = e.clientX - startX;
    }

    currentCards[0].style.transform = `translateX(${currentX}px) rotate(${currentX / 10}deg)`;

    const opacity = 1 //Math.min(Math.abs(currentX) / 10, 0.9);
    if (currentX > 0) {
        currentCards[0].style.backgroundColor = `rgba(255, 99, 71, ${opacity})`;
    } else {
        currentCards[0].style.backgroundColor = `rgba(144, 238, 144, ${opacity})`;
    }
}

function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    currentCards[0].classList.remove('swiping');

    const threshold = 100;

    if (Math.abs(currentX) > threshold) {
        if (currentX > 0) {
            currentCards[0].classList.add('swipe-right');
            const item = getCurrentItem();
            deck.push(item);
            setTimeout(loadNextCard, 500);
        } else {
            currentCards[0].classList.add('swipe-left');
            setTimeout(loadNextCard, 500);
        }
    } else {
        currentCards[0].style.transform = '';
        currentCards[0].style.backgroundColor = 'white';
    }

    currentX = 0;
}

function getCurrentItem() {
    const de = currentCards[0].querySelector('.back').textContent;
    return vocab.find(v => v.de === de);
}

loadCards()
