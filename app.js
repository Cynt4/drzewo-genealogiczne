let klan = [];
let family = null;

// --- DEFINICJA WŁASNYCH RAMEK ---
FamilyTree.templates.ramka = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.ramka.size = [260, 115]; 

FamilyTree.templates.ramka.field_0 = '<text data-text-overflow="ellipsis" width="240" style="font-size: 14px; font-weight: bold;" fill="#1e293b" x="130" y="25" text-anchor="middle">{val}</text>'; 
FamilyTree.templates.ramka.field_4 = '<text data-text-overflow="ellipsis" width="240" style="font-size: 11px; font-style: italic;" fill="#64748b" x="130" y="45" text-anchor="middle">{val}</text>'; 
FamilyTree.templates.ramka.field_1 = '<text data-text-overflow="ellipsis" width="240" style="font-size: 12px;" fill="#475569" x="130" y="70" text-anchor="middle">{val}</text>'; 
FamilyTree.templates.ramka.field_2 = '<text data-text-overflow="ellipsis" width="240" style="font-size: 11px;" fill="#64748b" x="130" y="90" text-anchor="middle">{val}</text>'; 
FamilyTree.templates.ramka.field_3 = '<text style="font-size: 11px; font-weight: bold;" fill="#94a3b8" x="250" y="20" text-anchor="end">{val}</text>'; 

FamilyTree.templates.ramka_male = Object.assign({}, FamilyTree.templates.ramka);
FamilyTree.templates.ramka_male.node = '<rect x="0" y="0" height="115" width="260" stroke-width="2" rx="8" stroke="#3b82f6" fill="#f8fafc"></rect>';

FamilyTree.templates.ramka_female = Object.assign({}, FamilyTree.templates.ramka);
FamilyTree.templates.ramka_female.node = '<rect x="0" y="0" height="115" width="260" stroke-width="2" rx="8" stroke="#ec4899" fill="#fdf2f8"></rect>';

async function init() {
    family = new FamilyTree(document.getElementById("tree"), {
        mode: "light",
        template: "ramka",
        enableSearch: false,
        
        // Zmiana sterowania: Kółko przesuwa (pan), Ctrl+Kółko przybliża (zoom).
        // Rozwiązuje problem uciekającego i skaczącego ekranu.
        mouseScrool: FamilyTree.action.ctrlZoom, 
        
        editForm: { readOnly: true },
        siblingSeparation: 60,
        subtreeSeparation: 80,
        levelSeparation: 90, 
        
        // Wymuszenie sortowania dzieci (od lewej do prawej) wg naszej zmiennej
        orderBy: "birthValue", 

        nodeBinding: {
            field_0: "name",
            field_1: "dates",
            field_2: "places",
            field_3: "idLabel",
            field_4: "maidenName" 
        }
    });

    family.on('click', function (sender, args) {
        editPerson(args.node.id);
        return false;
    });

    document.getElementById('plec').addEventListener('change', togglePanienskie);
    document.getElementById('nieZyje').addEventListener('change', toggleZgon);

    document.getElementById('personForm').addEventListener('submit', function(e) {
        e.preventDefault();
        savePerson();
    });

    try {
        const response = await fetch('/api/data', { cache: 'no-store' });
        if (response.ok) {
            klan = await response.json();
        }
    } catch (error) {
        console.error("Brak połączenia z serwerem:", error);
    }
    
    renderTree();
}

function togglePanienskie() {
    const plec = document.getElementById('plec').value;
    const polePanienskie = document.getElementById('nazwiskoPanienskie');
    if (plec === 'female') {
        polePanienskie.classList.remove('hidden');
    } else {
        polePanienskie.classList.add('hidden');
        polePanienskie.value = '';
    }
}

function toggleZgon() {
    const isDead = document.getElementById('nieZyje').checked;
    const sekcjaZgonu = document.getElementById('sekcjaZgonu');
    if (isDead) {
        sekcjaZgonu.classList.remove('hidden');
    } else {
        sekcjaZgonu.classList.add('hidden');
        document.getElementById('dataZgonu').value = '';
        document.getElementById('miejsceZgonu').value = '';
    }
}

// Funkcja przerabiająca datę "DD-MM-YYYY" na liczbę do sortowania (np. 19921129)
function parseDateToNumber(dateStr) {
    if (!dateStr) return 99999999; // Brak daty zrzuca na prawy koniec rodzeństwa
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return parseInt(parts[2] + parts[1] + parts[0], 10);
    }
    return 99999999;
}

function renderTree() {
    if (klan.length === 0) {
        family.load([]);
        return;
    }

    const wszystkieIds = klan.map(o => String(o.id));
    let nodes = [];

    klan.forEach(osoba => {
        const isDead = osoba.nieZyje || !!osoba.dataZgonu || !!osoba.miejsceZgonu;
        
        const dUr = osoba.dataUrodzenia ? `ur. ${osoba.dataUrodzenia}` : '';
        const dZg = (isDead && osoba.dataZgonu) ? `zg. ${osoba.dataZgonu}` : '';
        const displayDates = [dUr, dZg].filter(Boolean).join(' - ');

        const mUr = osoba.miejsceUrodzenia || '';
        const mZg = (isDead && osoba.miejsceZgonu) ? `-> ${osoba.miejsceZgonu}` : '';
        const displayPlaces = [mUr, mZg].filter(Boolean).join(' ');

        let glowneNazwisko = `${osoba.imie} ${osoba.nazwisko}`;
        let panieńskieText = osoba.nazwiskoPanienskie ? `(z d. ${osoba.nazwiskoPanienskie})` : '';

        let node = {
            id: String(osoba.id),
            idLabel: `ID: ${osoba.id}`,
            name: glowneNazwisko,
            maidenName: panieńskieText, 
            gender: osoba.plec,
            dates: displayDates,
            places: displayPlaces,
            birthValue: parseDateToNumber(osoba.dataUrodzenia), // Silnik użyje tego do ułożenia dzieci od lewej do prawej
            pids: [] 
        };

        if (osoba.ojciecId && wszystkieIds.includes(String(osoba.ojciecId))) node.fid = String(osoba.ojciecId);
        if (osoba.matkaId && wszystkieIds.includes(String(osoba.matkaId))) node.mid = String(osoba.matkaId);
        
        if (osoba.wspolmalzonekId && wszystkieIds.includes(String(osoba.wspolmalzonekId))) {
            node.pids.push(String(osoba.wspolmalzonekId));
        }

        nodes.push(node);
    });

    // Uzupełnienie więzi partnerskich w obie strony
    nodes.forEach(node => {
        if (node.pids.length > 0) {
            node.pids.forEach(partnerId => {
                let partnerNode = nodes.find(n => n.id === partnerId);
                if (partnerNode && !partnerNode.pids.includes(node.id)) {
                    partnerNode.pids.push(node.id);
                }
            });
        }

        if (node.fid && node.mid) {
            let ojciec = nodes.find(n => n.id === node.fid);
            let matka = nodes.find(n => n.id === node.mid);
            
            if (ojciec && matka) {
                if (!ojciec.pids.includes(matka.id)) ojciec.pids.push(matka.id);
                if (!matka.pids.includes(ojciec.id)) matka.pids.push(ojciec.id);
            }
        }
    });

    nodes.forEach(node => {
        node.pids = [...new Set(node.pids)];
    });

    // OSTATECZNE SORTOWANIE (LEWO = MĄŻ, PRAWO = ŻONA)
    // Silnik układa graf w pamięci przed rysowaniem. Facet jako pierwszy gwarantuje, że to on jest główną lewą kotwicą.
    nodes.sort((a, b) => {
        if (a.gender === 'male' && b.gender === 'female') return -1;
        if (a.gender === 'female' && b.gender === 'male') return 1;
        return parseInt(a.id) - parseInt(b.id);
    });

    family.load(nodes);
}

async function savePerson() {
    const idInput = document.getElementById('personId').value;
    const isDead = document.getElementById('nieZyje').checked;

    const osoba = {
        imie: document.getElementById('imie').value.trim(),
        nazwisko: document.getElementById('nazwisko').value.trim(),
        plec: document.getElementById('plec').value,
        nazwiskoPanienskie: document.getElementById('nazwiskoPanienskie').value.trim(),
        dataUrodzenia: document.getElementById('dataUrodzenia').value.trim(),
        miejsceUrodzenia: document.getElementById('miejsceUrodzenia').value.trim(),
        nieZyje: isDead,
        dataZgonu: isDead ? document.getElementById('dataZgonu').value.trim() : '',
        miejsceZgonu: isDead ? document.getElementById('miejsceZgonu').value.trim() : '',
        ojciecId: document.getElementById('ojciecId').value.trim(),
        matkaId: document.getElementById('matkaId').value.trim(),
        wspolmalzonekId: document.getElementById('wspolmalzonekId').value.trim()
    };

    if (idInput) {
        const index = klan.findIndex(o => String(o.id) === String(idInput));
        if (index > -1) klan[index] = { ...klan[index], ...osoba };
    } else {
        const highestId = klan.reduce((max, o) => Math.max(max, parseInt(o.id) || 0), 0);
        const noweId = String(highestId + 1);
        klan.push({ id: noweId, ...osoba });
    }

    try {
        const response = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(klan)
        });

        if (response.ok) {
            renderTree();
            resetForm();
        } else {
            alert("Błąd: Serwer nie przyjął danych.");
        }
    } catch (error) {
        alert("Błąd połączenia z serwerem. Zapis się nie powiódł.");
        console.error(error);
    }
}

function editPerson(id) {
    const osoba = klan.find(o => String(o.id) === String(id));
    if (!osoba) return;
    
    document.getElementById('formTitle').innerText = "Tryb: Edycja osoby";
    document.getElementById('formTitle').classList.replace('text-gray-800', 'text-red-600');
    document.getElementById('visibleId').value = osoba.id;
    document.getElementById('submitBtn').innerText = "Zapisz zmiany w osobie";
    document.getElementById('submitBtn').classList.replace('bg-blue-600', 'bg-red-600');
    document.getElementById('submitBtn').classList.replace('hover:bg-blue-700', 'hover:bg-red-700');

    document.getElementById('personId').value = osoba.id;
    document.getElementById('imie').value = osoba.imie;
    document.getElementById('nazwisko').value = osoba.nazwisko;
    document.getElementById('plec').value = osoba.plec || 'male';
    document.getElementById('nazwiskoPanienskie').value = osoba.nazwiskoPanienskie || '';
    document.getElementById('dataUrodzenia').value = osoba.dataUrodzenia || '';
    document.getElementById('miejsceUrodzenia').value = osoba.miejsceUrodzenia || '';
    
    const hasDeathRecords = !!osoba.dataZgonu || !!osoba.miejsceZgonu;
    document.getElementById('nieZyje').checked = osoba.nieZyje || hasDeathRecords;
    toggleZgon();
    document.getElementById('dataZgonu').value = osoba.dataZgonu || '';
    document.getElementById('miejsceZgonu').value = osoba.miejsceZgonu || '';

    document.getElementById('ojciecId').value = osoba.ojciecId || '';
    document.getElementById('matkaId').value = osoba.matkaId || '';
    document.getElementById('wspolmalzonekId').value = osoba.wspolmalzonekId || '';
    
    togglePanienskie();
}

function resetForm() {
    document.getElementById('personForm').reset();
    
    document.getElementById('formTitle').innerText = "Tryb: Tworzenie nowej osoby";
    document.getElementById('formTitle').classList.replace('text-red-600', 'text-gray-800');
    document.getElementById('visibleId').value = "Zostanie nadane po zapisie";
    document.getElementById('submitBtn').innerText = "Zapisz do drzewa";
    document.getElementById('submitBtn').classList.replace('bg-red-600', 'bg-blue-600');
    document.getElementById('submitBtn').classList.replace('hover:bg-red-700', 'hover:bg-blue-700');

    document.getElementById('personId').value = '';
    document.getElementById('plec').value = 'male';
    
    togglePanienskie();
    document.getElementById('nieZyje').checked = false;
    toggleZgon();
}

function exportData() {
    window.open('/api/data', '_blank');
}

window.onload = init;