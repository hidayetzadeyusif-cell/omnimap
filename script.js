// ----------------------------------------------------
// Load external JSON, then initialize the map + UI
// ----------------------------------------------------
async function init() {
    // ---- Load JSON file ----
    const response = await fetch('./data/layers.json');
    const layers = await response.json();

    // ---- Load search index ----
    const indexResponse = await fetch('./data/index.json');
    const searchIndex = await indexResponse.json();

    layers.forEach(l => l.leafletLayer = null);

    // ----------------------------------------------------
    // Load saved settings from localStorage (if any)
    // ----------------------------------------------------
    let savedSettings = JSON.parse(localStorage.getItem("settings")) || [];

    layers.forEach((l, i) => {
        const saved = savedSettings[i];
        if (!saved) return;

        if (saved.color !== null) l.color = saved.color;
        if (saved.opacity !== null) l.opacity = saved.opacity;
        if (saved.active !== null) l.active = saved.active;
    });

    // ----------------------------------------------------
    // Initialize map
    // ----------------------------------------------------
    var map = L.map('map').setView([39.766, 46.7499], 19);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);


    // ----------------------------------------------------
    // Add each layer to the map
    // ----------------------------------------------------
    layers.forEach((l) => {
        l.leafletLayer = L.geoJSON(l.geojson, {
            style: {
                color: l.color,
                fillOpacity: l.opacity
            }
        }).addTo(map);

        if (l.active === false) {
            map.removeLayer(l.leafletLayer);
        }
    });

    // ----------------------------------------------------
    // Generate UI for each layer
    // ----------------------------------------------------
    const container = document.getElementById("layersSection");
    let settings = [];

    layers.forEach((l, i) => {
        settings.push({
            color: null,
            opacity: null,
            active: null,
        });

        const box = document.createElement("div");
        box.classList.add("layerContainer");
        l.domElement = box;

        const title = document.createElement("label");
        title.textContent = l.name;
        box.appendChild(title);

        // ---- Opacity slider ----
        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = 0;
        slider.max = 1;
        slider.step = 0.1;
        slider.value = l.opacity;
        settings[i].opacity = l.opacity;
        slider.classList.add("slider");

        slider.addEventListener("input", () => {
            l.opacity = parseFloat(slider.value);
            settings[i].opacity = l.opacity;
            l.leafletLayer.setStyle({ fillOpacity: l.opacity });
            localStorage.setItem("settings", JSON.stringify(settings));
        });

        box.appendChild(slider);

        // ---- Color picker ----
        const colorWrapper = document.createElement("div");
        colorWrapper.className = "colorPickerWrapper";

        const actualColor = document.createElement("div");
        actualColor.className = "colorDisplay";
        actualColor.style.backgroundColor = l.color;

        const colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.className = "colorPicker";
        colorPicker.value = l.color;

        colorPicker.addEventListener("input", () => {
            actualColor.style.backgroundColor = colorPicker.value;
            l.color = colorPicker.value;
            settings[i].color = l.color;
            l.leafletLayer.setStyle({ color: l.color });
            localStorage.setItem("settings", JSON.stringify(settings));
        });

        colorWrapper.appendChild(actualColor);
        colorWrapper.appendChild(colorPicker);
        
        box.appendChild(colorWrapper);
        
        // ---- On/Off button ----
        const layerContainerBase = "rgba(255, 255, 255, 0.35)";
        const layerContainerDark = "rgba(211, 210, 210, 0.35)";
        const activateBtn = document.createElement("button");
        if (l.active != null && l.active === false) {
            activateBtn.innerText = "Turn Layer On";
            settings[i].active = false;
            box.style.backgroundColor = layerContainerDark;
        } else {
            activateBtn.innerText = "Turn Layer Off";
            settings[i].active = true;
            box.style.backgroundColor = layerContainerBase;
        }
        activateBtn.classList.add("activateBtn");

        activateBtn.addEventListener("click", () =>{
            if (map.hasLayer(l.leafletLayer)){
                activateBtn.innerText = "Turn Layer On";
                settings[i].active = false;
                map.removeLayer(l.leafletLayer);
                box.style.backgroundColor = layerContainerDark;
            } else{
                activateBtn.innerText = "Turn Layer Off";
                settings[i].active = true;
                map.addLayer(l.leafletLayer);
                box.style.backgroundColor = layerContainerBase;
            }
            localStorage.setItem("settings", JSON.stringify(settings));
        });

        box.appendChild(activateBtn);

        // --- Metadata ----
        const mdContainer = document.createElement("details");
        const mdSummary = document.createElement("summary");
        mdSummary.innerText = "Show Metadata";
        const mdText = document.createElement("p");
        mdText.innerText = `Name: ${l.metadata.realName}
                            Source: ${l.metadata.source}
                            Year Recorded: ${l.metadata.yearRecorded}
                            Categories: ${l.metadata.categories}
                            Notes: ${l.metadata.notes}`
        mdContainer.appendChild(mdSummary);
        mdContainer.appendChild(mdText);

        box.appendChild(mdContainer);

        container.appendChild(box);
    });

    // ----------------------------------------------------
    // Generate external UI
    // ----------------------------------------------------
    const searchPanel = document.getElementById("searchPanel");
    searchPanel.addEventListener("input", () => {
        const query = searchPanel.value.trim().toLowerCase();
        const tokens = query.split(/\s+/).filter(Boolean);

        let results = null;
        for (const token of tokens) {
            if (!searchIndex[token]) {
                results = [];
                break;
            }

            if (results === null) results = new Set(searchIndex[token]);
            else results = new Set(searchIndex[token].filter(i => results.has(i)));
        }

        layers.forEach((l, i) => {
            if (!results || results.size === 0) l.domElement.style.display = "";
            else if (results.has(i)) l.domElement.style.display = "";
            else l.domElement.style.display = "none";
        });
    });

    // ---- Save settings ----
    localStorage.setItem("settings", JSON.stringify(settings));
}

// Start everything
init();
