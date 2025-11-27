// ----------------------------------------------------
// Load external JSON, then initialize the map + UI
// ----------------------------------------------------

function toggleTheme() {
    let currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'light') {
        document.getElementById('globalThemeStylesheet').disabled = true;
        document.getElementById('layoutThemeStylesheet').disabled = true;
        document.getElementById('uiThemeStylesheet').disabled = true;

        document.getElementById('globalThemeStylesheetDark').disabled = false;
        document.getElementById('layoutThemeStylesheetDark').disabled = false;
        document.getElementById('uiThemeStylesheetDark').disabled = false;

        localStorage.setItem('theme', 'dark');
    } else {
        document.getElementById('globalThemeStylesheet').disabled = false;
        document.getElementById('layoutThemeStylesheet').disabled = false;
        document.getElementById('uiThemeStylesheet').disabled = false;

        document.getElementById('globalThemeStylesheetDark').disabled = true;
        document.getElementById('layoutThemeStylesheetDark').disabled = true;
        document.getElementById('uiThemeStylesheetDark').disabled = true;

        localStorage.setItem('theme', 'light');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (!savedTheme) localStorage.setItem('theme', userPrefersDark ? 'dark' : 'light');

    const themeToApply = savedTheme || (userPrefersDark ? 'dark' : 'light');
    if (themeToApply === 'dark') {
        document.getElementById('globalThemeStylesheet').disabled = true;
        document.getElementById('layoutThemeStylesheet').disabled = true;
        document.getElementById('uiThemeStylesheet').disabled = true;

        document.getElementById('globalThemeStylesheetDark').disabled = false;
        document.getElementById('layoutThemeStylesheetDark').disabled = false;
        document.getElementById('uiThemeStylesheetDark').disabled = false;
    }
});

async function init() {
    // ----------------------------------------------------
    // Load data
    // ----------------------------------------------------
    // ---- Load layers ----
    let layers = [];
    try {
        const response = await fetch('./data/layers.json');
        layers = await response.json();
    } catch (err){
        console.error("Failed to load presets:", err);
    }

    // ---- Load search index ----
    let searchIndex = [];
    try {
        const response = await fetch('./data/index.json');
        searchIndex = await response.json();
    } catch (err){
        console.error("Failed to load presets:", err);
    }

    // ---- Load presets ----
    let presets = [];
    try {
        const response = await fetch("./data/presets.json");
        presets = await response.json();
    } catch (err) {
        console.error("Failed to load presets:", err);
    }

    layers.forEach((l, i) => {
        l.leafletLayer = null;
        l.domContent = {
            index: i,
            box: null,
            activateBtn: null,
            actualColor: null,
            colorPicker: null
        };
    });

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
    // Helper functions
    // ----------------------------------------------------
    const layerContainerBase = "rgba(255, 255, 255, 0.35)";
    const layerContainerDark = "rgba(211, 210, 210, 0.35)";
    function setLayerActive(id, active){
        let layer;
        layers.forEach(l => {
            if (l.id == id) layer = l;
        });
        if (active){
            layer.domContent.activateBtn.innerText = "Turn Layer Off";
            settings[layer.domContent.index].active = true;
            layer.domContent.box.style.backgroundColor = layerContainerBase;
        } else{
            layer.domContent.activateBtn.innerText = "Turn Layer On";
            settings[layer.domContent.index].active = false;
            layer.domContent.box.style.backgroundColor = layerContainerDark;
        }
        localStorage.setItem("settings", JSON.stringify(settings));
    }
    function setLayerOpacity(id, opacity){
        let layer;
        layers.forEach(l => {
            if (l.id == id) layer = l;
        });
        layer.opacity = opacity;
        settings[layer.domContent.index].opacity = opacity;
        layer.leafletLayer.setStyle({ fillOpacity: opacity });
        localStorage.setItem("settings", JSON.stringify(settings));
    }
    function setLayerColor(id, color){
        let layer;
        layers.forEach(l => {
            if (l.id == id) layer = l;
        });
        layer.domContent.actualColor.style.backgroundColor = color;
        layer.domContent.colorPicker.value = color;
        layer.color = color;
        settings[layer.domContent.index].color = color;
        layer.leafletLayer.setStyle({ color: color });
        localStorage.setItem("settings", JSON.stringify(settings));
    }

    // ----------------------------------------------------
    // Generate UI for each layer
    // ----------------------------------------------------
    const layersContainer = document.getElementById("layersSection");
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
        l.domContent.box = box;

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

        slider.addEventListener("input", () => setLayerOpacity(l.id, parseFloat(slider.value)));

        box.appendChild(slider);

        // ---- Color picker ----
        const colorWrapper = document.createElement("div");
        colorWrapper.className = "colorPickerWrapper";

        const actualColor = document.createElement("div");
        actualColor.className = "colorDisplay";
        actualColor.style.backgroundColor = l.color;
        l.domContent.actualColor = actualColor;

        const colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.className = "colorPicker";
        colorPicker.value = l.color;

        colorPicker.addEventListener("input", () => setLayerColor(l.id, colorPicker.value));

        colorWrapper.appendChild(actualColor);
        colorWrapper.appendChild(colorPicker);
        
        box.appendChild(colorWrapper);
        
        // ---- On/Off button ----
        const activateBtn = document.createElement("button");
        l.domContent.activateBtn = activateBtn;
        if (l.active != null && l.active === false) setLayerActive(l.id, false);
        else setLayerActive(l.id, true);
        activateBtn.classList.add("activateBtn");

        activateBtn.addEventListener("click", () =>{
            if (map.hasLayer(l.leafletLayer)) setLayerActive(l.id, false);
            else setLayerActive(l.id, true);
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

        layersContainer.appendChild(box);
    });

    // ----------------------------------------------------
    // Generate UI for each preset
    // ----------------------------------------------------
    // Please make me

    // ----------------------------------------------------
    // Generate external UI
    // ----------------------------------------------------
    // ---- Search Panel ----
    const searchPanel = document.getElementById("layerSearchPanel");
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

    // ----------------------------------------------------
    // Hook Event Listeners
    // ----------------------------------------------------

    // ---- Settings Popup ----
    const settingsModal = document.getElementById("settingsModal");
    const settingsOpenBtn = document.getElementById("openSettings");
    const settingsCloseBtn = document.getElementById("closeSettings");

    settingsOpenBtn.onclick = () => { settingsModal.style.display = "flex"; };
    settingsCloseBtn.onclick = () => { settingsModal.style.display = "none"; };

    // ---- Theme Change ----
    const themeChangeBtn = document.getElementById("themeChangeBtn");
    themeChangeBtn.onclick = () => { toggleTheme() }

    // ---- Save settings ----
    localStorage.setItem("settings", JSON.stringify(settings));
}

// Start everything
init();
