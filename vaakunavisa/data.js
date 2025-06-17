let municipalities = [];

// Load municipalities from GeoJSON
fetch('../kunta1000k_2025_with_neighbors_and_province.geojson')
    .then(response => response.json())
    .then(data => {
        // Extract municipalities from GeoJSON features
        municipalities = data.features.map(feature => ({
            name: feature.properties.nimi,
            province: feature.properties.maakunta,
            neighbors: feature.properties.neighbours,
            coatOfArms: `../vaakunat-svg/${feature.properties.nimi}.svg`
        }));
        
        // Initialize the game once data is loaded
        if (typeof initGame === 'function') {
            initGame();
        }
    })
    .catch(error => console.error('Error loading GeoJSON:', error));
