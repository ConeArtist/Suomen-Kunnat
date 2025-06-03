let map;
let geojsonLayer;
let allFeatures = [];
let currentFeature;
let selectedProvinces = [];
let attemptCount = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-game').addEventListener('click', startGame);
    updateScoreDisplay();
});

function startGame() {
    selectedProvinces = Array.from(document.querySelectorAll('#province-selection input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    document.getElementById('province-selection').style.display = 'none';

    map = L.map('map').setView([64.5, 26], 6);

    L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

    fetch('kunta1000k_2025_with_neighbors_and_province.geojson')
        .then(res => res.json())
        .then(data => {
            allFeatures = data.features.filter(feature =>
                selectedProvinces.includes(feature.properties.province)
            );

            geojsonLayer = L.geoJSON(allFeatures, {
                style: {
                    color: "#fff",
                    weight: 1,
                    fillOpacity: 1,
                    fillColor: "#002c5f"
                },
                onEachFeature: (feature, layer) => {
                    layer.on('click', () => checkAnswer(feature, layer));
                }
            }).addTo(map);

            nextQuestion();
        });
}

function nextQuestion() {
    if (allFeatures.length === 0) {
        document.getElementById('question').textContent = 'Peli päättyi! Kaikki kunnat pelattu.';
        document.getElementById('result').textContent = `Lopullinen pistemäärä: ${score}`;
        return;
    }

    currentFeature = allFeatures[Math.floor(Math.random() * allFeatures.length)];
    attemptCount = 1;

    const coatOfArmsImage = document.getElementById('vaakuna');
    const coatOfArmsName = currentFeature.properties.nimi.toLowerCase().replace(/ /g, '-').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/å/g, 'a');
    coatOfArmsImage.src = `/vaakunat/${coatOfArmsName}.gif`;

    document.getElementById('question').textContent = `Missä on kunta: ${currentFeature.properties.nimi}?`;
    document.getElementById('result').textContent = '';
}

function checkAnswer(feature, layer) {
    if (!currentFeature) return;

    const correct = feature.properties.nimi === currentFeature.properties.nimi;

    if (correct) {
        let points = 0;
        if (attemptCount === 1) {
            points = 5;
        }
        else if (attemptCount === 2) {
            points = 3;
        }

        score += points;
        updateScoreDisplay();

        layer.setStyle({ fillColor: 'green', fillOpacity: 0 });
        document.getElementById('result').textContent = `Oikein ${attemptCount}. yrityksellä! Kunta oli ${feature.properties.nimi}. +${points} pistettä`;
        removeCurrentFeature();
        setTimeout(nextQuestion, 2000);
    } else {
        const originalStyle = {
            color: "#333",
            weight: 1,
            fillOpacity: 0.2
        };

        layer.setStyle({ fillColor: 'red', fillOpacity: 1 });

        setTimeout(() => {
            geojsonLayer.resetStyle(layer); // Palauttaa alkuperäisen tyylin
        }, 1000);

        if (attemptCount === 1) {
            const neighbors = currentFeature.properties.neighbors?.join(', ') || 'ei tietoa';
            document.getElementById('hint').textContent = `Naapurikunnat: ${neighbors}`;
            document.getElementById('result').textContent = 'Yritä uudelleen.';
            attemptCount++;
        } else if (attemptCount === 2) {
            document.getElementById('result').textContent = `Väärin taas! Tämä oli ${feature.properties.nimi}. +0 pistettä`;
            layer.setStyle({ fillColor: 'blue', fillOpacity: 0.5 }); // Näytä oikea sijainti
            removeCurrentFeature();
            setTimeout(nextQuestion, 2500);
        }
    }
}


function removeCurrentFeature() {
    allFeatures = allFeatures.filter(f => f.properties.nimi !== currentFeature.properties.nimi);
    currentFeature = null;
}

function updateScoreDisplay() {
    let scoreDisplay = document.getElementById('score-display');
    if (!scoreDisplay) {
        scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score-display';
        scoreDisplay.style.fontWeight = 'bold';
        scoreDisplay.style.marginTop = '10px';
        document.querySelector('.sidebar').appendChild(scoreDisplay);
    }
    scoreDisplay.textContent = `Pisteet: ${score}`;
}
