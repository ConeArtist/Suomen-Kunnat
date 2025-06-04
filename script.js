let map;
let geojsonLayer;
let allFeatures = [];
let currentFeature;
let selectedProvinces = [];
let attemptCount = 0;
let score = 0;
let maxScore = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-game').addEventListener('click', startGame);
    updateScoreDisplay();
});

function startGame() {
    selectedProvinces = Array.from(document.querySelectorAll('#province-selection input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    document.getElementById('start-modal').style.display = 'none';

    map = L.map('map').setView([64.5, 26], 6);

    L.tileLayer('https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 18
    }).addTo(map);

    fetch('kunta1000k_2025_with_neighbors_and_province.geojson')
        .then(res => res.json())
        .then(data => {
            allFeatures = data.features.filter(feature =>
                selectedProvinces.includes(feature.properties.province)
            );
            maxScore = allFeatures.length * 5;
            updateScoreDisplay();

            geojsonLayer = L.geoJSON(allFeatures, {
                style: {
                    color: "#0b3a61",
                    weight: 1
                },
                onEachFeature: (feature, layer) => {
                    layer.on('click', () => checkAnswer(feature, layer));
                }
            }).addTo(map);

            map.fitBounds(geojsonLayer.getBounds());
            nextQuestion();
        });
}

function nextQuestion() {
    if (allFeatures.length === 0) {
        document.getElementById('question').textContent = 'Peli päättyi! Kaikki kunnat pelattu.';
        document.getElementById('result').textContent = `Lopullinen pistemäärä: ${score} / ${maxScore}`;
        return;
    }

    // piilotetaan aiemmat vihjeet
    document.getElementById('hint1').textContent = '';
    document.getElementById('result').textContent = '';

    currentFeature = allFeatures[Math.floor(Math.random() * allFeatures.length)];
    attemptCount = 1;

    const coatOfArmsImage = document.getElementById('vaakuna');
    const coatOfArmsName = currentFeature.properties.nimi.toLowerCase().replace(/ /g, '-').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/å/g, 'a');
    coatOfArmsImage.src = `vaakunat-svg/${coatOfArmsName}.svg`;

    document.getElementById('question').textContent = `${currentFeature.properties.nimi}`;
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
            document.getElementById('hint1').textContent = `Naapurikunnat: ${neighbors}`;
            //document.getElementById('result').textContent = 'Yritä uudelleen.';
            attemptCount++;
        } else if (attemptCount === 2) {
            document.getElementById('result').textContent = `Väärin taas! Tämä oli ${currentFeature.properties.nimi}. +0 pistettä`;

            geojsonLayer.eachLayer(l => {
                if (l.feature.properties.nimi === currentFeature.properties.nimi) {
                    // Zoomaa oikeaan kohtaan
                    map.fitBounds(l.getBounds(), {
                        maxZoom: 9, // voit säätää tätä
                        animate: true,
                        duration: 1
                    });

                    // Lisää siirtymä
                    l.getElement().style.transition = 'fill 0.3s ease, fill-opacity 0.3s ease';

                    // Sulava välkkyminen
                    let i = 0;
                    const blink = () => {
                        if (i >= 6) {
                            l.setStyle({ fillOpacity: 0 }); // piilota lopuksi
                            return;
                        }
                        l.setStyle({ fillColor: i % 2 === 0 ? 'green' : '#0b3a61', fillOpacity: 1 });
                        i++;
                        setTimeout(blink, 250);
                    };
                    blink();
                }
            });

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
    scoreDisplay.textContent = `Pisteet: ${score} / ${maxScore}`;
}

function selectAllProvinces() {
    document.querySelectorAll('#province-selection input[type="checkbox"]').forEach(cb => cb.checked = true);
}

function deselectAllProvinces() {
    document.querySelectorAll('#province-selection input[type="checkbox"]').forEach(cb => cb.checked = false);
}

function generateShareLink(score) {
    const url = encodeURIComponent("https://sinunpelisivu.fi");
    const title = encodeURIComponent(`Sain monta pistettä Suomen Kunnat -pelissä! Pystytkö parempaan?`);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`;
    document.getElementById("linkedin-share").href = linkedinUrl;
}

// Esimerkiksi pelin päätyttyä:
generateShareLink(score);



