let years = Array.from({ length: 22 }, (_, i) => (2000 + i).toString());
let populationData = [];
let birthData = [];
let deathData = [];

// Function to fetch population data for the whole country
async function fetchPopulationData() {
    const response = await fetch('https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "query": [
                {
                    "code": "Vuosi",
                    "selection": {
                        "filter": "item",
                        "values": years
                    }
                },
                {
                    "code": "Alue",
                    "selection": {
                        "filter": "item",
                        "values": ["SSS"]  // Whole country code
                    }
                },
                {
                    "code": "Tiedot",
                    "selection": {
                        "filter": "item",
                        "values": ["vaesto"]  // Population data code
                    }
                }
            ],
            "response": {
                "format": "json-stat2"
            }
        })
    });

    const data = await response.json();
    populationData = data.value; // Array of population data
    drawPopulationChart(); // Call function to draw the chart
}

// Function to draw the population chart
function drawPopulationChart() {
    new Chart("#chart-population", {
        title: "Population Data (2000-2021)",
        data: {
            labels: years,
            datasets: [
                {
                    name: "Population",
                    values: populationData,
                    color: '#eb5146'
                }
            ]
        },
        type: 'line',
        height: 450,
        lineOptions: {
            hideDots: 0
        }
    });
}

// Fetch population data on page load
fetchPopulationData();

// Event handler for fetching municipality data
document.getElementById('submit-data').onclick = async function () {
    const areaCode = document.getElementById('input-area').value.trim().toUpperCase();
    await fetchMunicipalityData(areaCode);
};

// Function to fetch municipality data
async function fetchMunicipalityData(areaCode) {
    const response = await fetch('https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "query": [
                {
                    "code": "Vuosi",
                    "selection": {
                        "filter": "item",
                        "values": years
                    }
                },
                {
                    "code": "Alue",
                    "selection": {
                        "filter": "item",
                        "values": [areaCode]  // User input area code
                    }
                },
                {
                    "code": "Tiedot",
                    "selection": {
                        "filter": "item",
                        "values": ["vaesto"]
                    }
                }
            ],
            "response": {
                "format": "json-stat2"
            }
        })
    });

    const data = await response.json();
    populationData = data.value; // Update population data
    drawPopulationChart(); // Redraw chart with new data
}

// Event handler for adding data point
document.getElementById('add-data').onclick = function () {
    const meanDelta = calculateMeanDelta(populationData);
    const newPoint = populationData[populationData.length - 1] + meanDelta;
    populationData.push(newPoint);
    years.push((parseInt(years[years.length - 1]) + 1).toString()); // Add next year
    drawPopulationChart(); // Redraw chart with updated data
};

// Function to calculate mean delta
function calculateMeanDelta(data) {
    if (data.length < 2) return 0; // No delta to calculate
    const deltas = [];
    for (let i = 1; i < data.length; i++) {
        deltas.push(data[i] - data[i - 1]);
    }
    const meanDelta = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
    return meanDelta;
}

// Event handler for navigating to birth and death chart
document.getElementById('to-birth-death-chart').onclick = function () {
    document.getElementById('chart-population').classList.remove('active');
    document.getElementById('chart-birth-death').classList.add('active');
    fetchBirthDeathData(); // Fetch data for the birth and death chart
};

// Event handler for navigating back to population chart
document.getElementById('to-population-chart').onclick = function () {
    document.getElementById('chart-birth-death').classList.remove('active');
    document.getElementById('chart-population').classList.add('active');
};

// Function to fetch birth and death data for a municipality
async function fetchBirthDeathData() {
    const areaCode = document.getElementById('input-area').value.trim().toUpperCase();

    const responseBirth = await fetch('https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "query": [
                {
                    "code": "Vuosi",
                    "selection": {
                        "filter": "item",
                        "values": years
                    }
                },
                {
                    "code": "Alue",
                    "selection": {
                        "filter": "item",
                        "values": [areaCode]
                    }
                },
                {
                    "code": "Tiedot",
                    "selection": {
                        "filter": "item",
                        "values": ["vm01"] // Birth data code
                    }
                }
            ],
            "response": {
                "format": "json-stat2"
            }
        })
    });

    const dataBirth = await responseBirth.json();
    birthData = dataBirth.value; // Array of birth data

    const responseDeath = await fetch('https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "query": [
                {
                    "code": "Vuosi",
                    "selection": {
                        "filter": "item",
                        "values": years
                    }
                },
                {
                    "code": "Alue",
                    "selection": {
                        "filter": "item",
                        "values": [areaCode]
                    }
                },
                {
                    "code": "Tiedot",
                    "selection": {
                        "filter": "item",
                        "values": ["vm11"] // Death data code
                    }
                }
            ],
            "response": {
                "format": "json-stat2"
            }
        })
    });

    const dataDeath = await responseDeath.json();
    deathData = dataDeath.value; // Array of death data
    drawBirthDeathChart(); // Draw the birth and death chart
}

// Function to draw the birth and death chart
function drawBirthDeathChart() {
    new Chart("#chart-birth-death", {
        title: "Births and Deaths Data (2000-2021)",
        data: {
            labels: years,
            datasets: [
                {
                    name: "Births",
                    values: birthData,
                    color: '#63d0ff'
                },
                {
                    name: "Deaths",
                    values: deathData,
                    color: '#363636'
                }
            ]
        },
        type: 'bar',
        height: 450,
    });
}
