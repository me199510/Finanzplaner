
const dashboard1 = document.getElementById("dashboard1");
const dashboard2 = document.getElementById("dashboard2");

const btnDashboard1 = document.getElementById("btn-dashboard1");
const btnDashboard2 = document.getElementById("btn-dashboard2");

// Dashboard 1 anzeigen
btnDashboard1.addEventListener("click", function() {
    dashboard1.hidden = false;
    dashboard2.hidden = true;
});

// Dashboard 2 anzeigen
btnDashboard2.addEventListener("click", function() {
    dashboard1.hidden = true;
    dashboard2.hidden = false;
});

// Unsere Einnahmen und Ausgaben
let einnahmen = [];
let ausgaben = [];
let sparen = [];

// Formular auswählen
const formular = document.getElementById("finanz-formular");

// Beim Speichern eines Eintrags

formular.addEventListener("submit", async function(event) {
    event.preventDefault();

    // Eingaben auslesen
    const typ = document.getElementById("typ").value;
    const betrag = Number(document.getElementById("betrag").value);
    const datum = document.getElementById("datum").value;

    let kategorie = document.getElementById("kategorie").value;

    // Eigene Kategorie berücksichtigen
    if (kategorie === "eigene") {
        kategorie = document.getElementById(
            "eigene-kategorie"
        ).value.trim();
    }

    // Eingaben überprüfen
    if (!Number.isFinite(betrag) || betrag <= 0 ||
        kategorie === "" || datum === "") {
        alert("Bitte gültige Daten eingeben!");
        return;
    }

    // Eintrag erstellen
    const eintrag = {
        betrag: betrag,
        kategorie: kategorie,
        datum: datum

    };

    
    // Einnahmen dauerhaft in SQLite speichern
    if (typ === "einnahme") {

        try {
            const antwort = await fetch("/api/einnahmen", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    betrag: Math.round(betrag * 100),
                    kategorie: kategorie,
                    datum: datum
                })
            });

            if (!antwort.ok) {
                throw new Error("Speichern fehlgeschlagen");
            }

        } catch (fehler) {
            alert("Die Einnahme konnte nicht gespeichert werden.");
            console.error(fehler);
            return;
        }
    }

    
    // Ausgaben dauerhaft in SQLite speichern
    if (typ === "ausgabe") {

        try {
            const antwort = await fetch("/api/ausgaben", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    betrag: Math.round(betrag * 100),
                    kategorie: kategorie,
                    datum: datum
                })
            });

            if (!antwort.ok) {
                throw new Error("Speichern fehlgeschlagen");
            }

        } catch (fehler) {
            alert("Die Ausgabe konnte nicht gespeichert werden.");
            console.error(fehler);
            return;
        }
    }

    // Sparbeträge dauerhaft in SQLite speichern
    if (typ === "sparen") {

        try {
            const antwort = await fetch("/api/sparen", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    betrag: Math.round(betrag * 100),
                    kategorie: kategorie,
                    datum: datum
                })
            });

            if (!antwort.ok) {
                throw new Error("Speichern fehlgeschlagen");
            }

        } catch (fehler) {
            alert("Der Sparbetrag konnte nicht gespeichert werden.");
            console.error(fehler);
            return;
        }
    }


    // Eintrag zuordnen
    if (typ === "einnahme") {
        einnahmen.push(eintrag);
    } else if (typ === "ausgabe") {
        ausgaben.push(eintrag);
    } else if (typ === "sparen") {
        sparen.push(eintrag);
    }

    // Übersicht aktualisieren
    aktualisiereUebersicht();
    aktualisiereKategorieDiagramm();
    aktualisiereMonatsDiagramm(3);

    // Formular zurücksetzen
    formular.reset();
    aktualisiereKategorien();

    alert("Eintrag erfolgreich hinzugefügt!");
});


// Einnahmen, Ausgaben und Restbetrag berechnen

function aktualisiereUebersicht() {

    const gesamtEinnahmen = einnahmen.reduce(
        (summe, eintrag) => summe + eintrag.betrag, 0
    );

    const gesamtAusgaben = ausgaben.reduce(
        (summe, eintrag) => summe + eintrag.betrag, 0
    );

    const gesamtSparen = sparen.reduce(
        (summe, eintrag) => summe + eintrag.betrag, 0
    );

    const freiVerfuegbar =
        gesamtEinnahmen - gesamtAusgaben - gesamtSparen;

    document.getElementById("einnahmen").textContent =
        formatiereEuro(gesamtEinnahmen);

    document.getElementById("ausgaben").textContent =
        formatiereEuro(gesamtAusgaben);

    document.getElementById("sparen").textContent =
        formatiereEuro(gesamtSparen);

    document.getElementById("restbetrag").textContent =
        formatiereEuro(freiVerfuegbar);
}


// Euro-Beträge formatieren
function formatiereEuro(betrag) {
    return betrag.toLocaleString("de-AT", {
        style: "currency",
        currency: "EUR"
    });
}

 // Vordefinierte Kategorien
const kategorien = {
    einnahme: [
        "Gehalt",
        "Nebenjob",
        "Geschenke",
        "Sonstige Einnahmen"
    ],

    ausgabe: [
        "Miete & Wohnen",
        "Lebensmittel",
        "Transport",
        "Freizeit",
        "Shopping",
        "Gesundheit",
        "Sonstige Ausgaben"
    ],

    sparen: [
        "Sparkonto",
        "ETF / Aktien",
        "Altersvorsorge",
        "Sonstige Investments"
    ]
};

// HTML-Elemente auswählen
const typAuswahl = document.getElementById("typ");
const kategorieAuswahl = document.getElementById("kategorie");

const eigeneKategorie =
    document.getElementById("eigene-kategorie");

const eigeneKategorieLabel =
    document.getElementById("eigene-kategorie-label");

// Kategorien abhängig von der Art anzeigen
function aktualisiereKategorien() {

    const typ = typAuswahl.value;

    // Bisherige Kategorien entfernen
    kategorieAuswahl.innerHTML = "";

    // Passende Kategorien hinzufügen
    kategorien[typ].forEach(function(kategorie) {

        const option = document.createElement("option");

        option.value = kategorie;
        option.textContent = kategorie;

        kategorieAuswahl.appendChild(option);
    });

    // Option für eigene Kategorien
    const eigeneOption = document.createElement("option");

    eigeneOption.value = "eigene";
    eigeneOption.textContent = "Eigene Kategorie ...";

    kategorieAuswahl.appendChild(eigeneOption);

    zeigeEigeneKategorie();
}

// Eingabefeld für eigene Kategorien anzeigen
function zeigeEigeneKategorie() {

    const istEigene = kategorieAuswahl.value === "eigene";

    eigeneKategorie.hidden = !istEigene;
    eigeneKategorieLabel.hidden = !istEigene;

    eigeneKategorie.required = istEigene;
}

// Wenn die Art geändert wird
typAuswahl.addEventListener(
    "change",
    aktualisiereKategorien
);

// Wenn die Kategorie geändert wird
kategorieAuswahl.addEventListener(
    "change",
    zeigeEigeneKategorie
);

// Kategorien beim Start laden
aktualisiereKategorien();


let kategorieDiagramm = null;

function aktualisiereKategorieDiagramm() {

    // Ausgaben pro Kategorie zusammenrechnen
    const ausgabenNachKategorie = {};

    ausgaben.forEach(function(eintrag) {

        const kategorie = eintrag.kategorie;

        if (!ausgabenNachKategorie[kategorie]) {
            ausgabenNachKategorie[kategorie] = 0;
        }

        ausgabenNachKategorie[kategorie] += eintrag.betrag;
    });

    // Kategorien und Beträge vorbereiten
    const kategorienNamen = Object.keys(ausgabenNachKategorie);
    const betraege = Object.values(ausgabenNachKategorie);

    // Vorheriges Diagramm entfernen
    if (kategorieDiagramm !== null) {
        kategorieDiagramm.destroy();
    }

    // Neues Balkendiagramm erstellen
    const canvas = document.getElementById("kategorie-diagramm");

    kategorieDiagramm = new Chart(canvas, {
        type: "bar",

        data: {
            labels: kategorienNamen,

            datasets: [{
                label: "Ausgaben in €",
                data: betraege,
                backgroundColor: "#80A991",
                borderColor: "#39765A",
                borderWidth: 1
            }]
        },

        options: {
            responsive: true,

            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


let monatsDiagramm = null;

// Monatsdiagramm erstellen
function aktualisiereMonatsDiagramm(anzahlMonate) {

    const heute = new Date();

    const monate = [];
    const monatsAusgaben = [];

    // Die letzten 3 oder 6 Monate vorbereiten
    for (let i = anzahlMonate - 1; i >= 0; i--) {

        const monat = new Date(
            heute.getFullYear(),
            heute.getMonth() - i,
            1
        );

        const jahr = monat.getFullYear();
        const monatsNummer = monat.getMonth();

        // Monatsname für das Diagramm
        const monatsName = monat.toLocaleDateString("de-AT", {
            month: "short",
            year: "numeric"
        });

        monate.push(monatsName);

        // Ausgaben dieses Monats berechnen
        let summe = 0;

        ausgaben.forEach(function(eintrag) {

            const teile = eintrag.datum.split("-");
            const eintragJahr = Number(teile[0]);
            const eintragMonat = Number(teile[1]) - 1;

            if (eintragJahr === jahr &&
                eintragMonat === monatsNummer) {

                summe += eintrag.betrag;
            }
        });

        monatsAusgaben.push(summe);
    }

    // Altes Diagramm entfernen
    if (monatsDiagramm !== null) {
        monatsDiagramm.destroy();
    }

    // Neues Diagramm erstellen
    monatsDiagramm = new Chart(
        document.getElementById("monats-diagramm"),
        {
            type: "bar",

            data: {
                labels: monate,

                datasets: [{
                    label: "Ausgaben in €",
                    data: monatsAusgaben,
                    backgroundColor: "#80A991",
                    borderColor: "#39765A",
                    borderWidth: 1
                }]
            },

            options: {
                responsive: true,

                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
    );
}

// Buttons für 3 und 6 Monate
document.getElementById("btn-3-monate")
    .addEventListener("click", function() {
        aktualisiereMonatsDiagramm(3);
    });

document.getElementById("btn-6-monate")
    .addEventListener("click", function() {
        aktualisiereMonatsDiagramm(6);
    });

// Beim Start 3 Monate anzeigen
aktualisiereMonatsDiagramm(3);



let sparziele = [];
let aktuellesSparziel = null;

const sparzielFormular = document.getElementById("sparziel-formular");

// Sparziel hinzufügen
sparzielFormular.addEventListener("submit", async function(event) {
    event.preventDefault();

    const bezeichnung = document.getElementById("zielname").value.trim();
    const zielbetrag = Number(document.getElementById("zielbetrag").value);
    const startbetrag = Number(document.getElementById("startbetrag").value);
    const monatlicherSparbetrag = Number(
        document.getElementById("monatlicher-sparbetrag").value
    );

    // Eingaben überprüfen
    if (
        bezeichnung === "" ||
        !Number.isFinite(zielbetrag) || zielbetrag <= 0 ||
        !Number.isFinite(startbetrag) || startbetrag < 0 ||
        !Number.isFinite(monatlicherSparbetrag) ||
        monatlicherSparbetrag < 0
    ) {
        alert("Bitte gültige Werte eingeben!");
        return;
    }

    const restbetrag = Math.max(0, zielbetrag - startbetrag);

    let monate;

    if (restbetrag === 0) {
        monate = 0;
    } else if (monatlicherSparbetrag === 0) {
        monate = null;
    } else {
        monate = Math.ceil(restbetrag / monatlicherSparbetrag);
    }

    const neuesSparziel = {
        id: Date.now() + Math.random(),
        bezeichnung: bezeichnung,
        zielbetrag: zielbetrag,
        startbetrag: startbetrag,
        monatlicherSparbetrag: monatlicherSparbetrag,
        restbetrag: restbetrag,
        monate: monate
    };

    
    // Sparziel dauerhaft in SQLite speichern
    try {
        const antwort = await fetch("/api/sparziele", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bezeichnung: zielname,
                zielbetrag: Math.round(zielbetrag * 100),
                startbetrag: Math.round(startbetrag * 100),
                monatlicher_sparbetrag: Math.round(monatlicherSparbetrag * 100)
            })
        });

        if (!antwort.ok) {
            throw new Error("Sparziel konnte nicht gespeichert werden");
        }

    } catch (fehler) {
        alert("Das Sparziel konnte nicht gespeichert werden.");
        console.error(fehler);
        return;
    }

    

    // Sparziel dauerhaft in SQLite speichern
    try {
        const antwort = await fetch("/api/sparziele", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bezeichnung: bezeichnung,
                zielbetrag: Math.round(zielbetrag * 100),
                startbetrag: Math.round(startbetrag * 100),
                monatlicher_sparbetrag: Math.round(monatlicherSparbetrag * 100)
            })
        });

        if (!antwort.ok) {
            throw new Error("Speichern fehlgeschlagen");
        }

    } catch (fehler) {
        alert("Das Sparziel konnte nicht gespeichert werden.");
        console.error(fehler);
        return;
    }

    // Sparziel zur Liste hinzufügen
    sparziele.push(neuesSparziel);

    // Aktuelles Sparziel für spätere Berechnungen merken
    aktuellesSparziel = neuesSparziel;


    // Sparziel zur Liste hinzufügen
    sparziele.push(neuesSparziel);

    // Aktuelles Sparziel für spätere Berechnungen merken
    aktuellesSparziel = neuesSparziel;

    // Karten neu anzeigen
    zeigeSparziele();

    // Formular leeren
    sparzielFormular.reset();
});

// Alle Sparziel-Karten anzeigen
function zeigeSparziele() {
    const liste = document.getElementById("sparziel-liste");

    liste.innerHTML = "";

    sparziele.forEach(function(ziel) {
        const fortschritt = Math.min(
            100,
            (ziel.startbetrag / ziel.zielbetrag) * 100
        );

        const karte = document.createElement("div");
        karte.className = "sparziel-karte";

        const titel = document.createElement("h4");
        titel.textContent = ziel.bezeichnung;

        const dauer = document.createElement("p");
        dauer.className = "sparziel-dauer";

        if (ziel.monate === 0) {
            dauer.textContent = "Ziel erreicht!";
        } else if (ziel.monate === null) {
            dauer.textContent = "Noch keine Dauer berechenbar";
        } else {
            dauer.textContent = ziel.monate + " Monate bis zum Ziel";
        }

        const balken = document.createElement("div");
        balken.className = "fortschritt-hintergrund";

        const fuellung = document.createElement("div");
        fuellung.className = "fortschritt-fuellung";
        fuellung.style.width = fortschritt + "%";

        balken.appendChild(fuellung);

        const details = document.createElement("p");
        details.textContent =
            formatiereEuro(ziel.startbetrag) +
            " von " +
            formatiereEuro(ziel.zielbetrag) +
            " gespart (" +
            fortschritt.toFixed(1) +
            " %)";

        const monatlich = document.createElement("p");
        monatlich.textContent =
            "Monatlicher Sparbetrag: " +
            formatiereEuro(ziel.monatlicherSparbetrag);

        karte.appendChild(titel);
        karte.appendChild(dauer);
        karte.appendChild(balken);
        karte.appendChild(details);
        karte.appendChild(monatlich);

        
        // Bereich für den Sparvorschlag
        const vorschlagBereich = document.createElement("div");
        vorschlagBereich.className = "sparziel-vorschlag";

        // Button für 3 Monate früher
        const button3 = document.createElement("button");
        button3.textContent = "3 Monate früher";
        button3.type = "button";

        button3.addEventListener("click", function() {
            berechneSchnellerSparen(ziel, 3, vorschlagBereich);
        });

        // Button für 6 Monate früher
        const button6 = document.createElement("button");
        button6.textContent = "6 Monate früher";
        button6.type = "button";

        button6.addEventListener("click", function() {
            berechneSchnellerSparen(ziel, 6, vorschlagBereich);
        });

        // Buttons nebeneinander anzeigen
        const buttonBereich = document.createElement("div");
        buttonBereich.className = "sparziel-buttons";

        buttonBereich.appendChild(button3);
        buttonBereich.appendChild(button6);

        // Buttons und Ergebnis zur Karte hinzufügen
        karte.appendChild(buttonBereich);
        karte.appendChild(vorschlagBereich);


        liste.appendChild(karte);
    });
}


function berechneSchnellerSparen(ziel, monateFrueher, ergebnis) {

    // Prüfen, ob eine Berechnung möglich ist
    if (ziel.monate === null) {
        ergebnis.textContent =
            "Bitte zuerst einen monatlichen Sparbetrag festlegen.";
        return;
    }

    if (ziel.monate === 0) {
        ergebnis.textContent =
            "Dieses Sparziel ist bereits erreicht!";
        return;
    }

    // Neue Anzahl der Monate berechnen
    const neueMonate = ziel.monate - monateFrueher;

    if (neueMonate <= 0) {
        ergebnis.textContent =
            "Dieses Sparziel kann nicht um " +
            monateFrueher +
            " Monate vorgezogen werden.";
        return;
    }

    // Benötigten monatlichen Sparbetrag berechnen
    const neuerSparbetrag =
        Math.ceil((ziel.restbetrag / neueMonate) * 100) / 100;

    // Zusätzlichen Sparbetrag berechnen
    const zusaetzlich = Math.max(
        0,
        neuerSparbetrag - ziel.monatlicherSparbetrag
    );

    // Ergebnis anzeigen
    ergebnis.textContent =
        "Um dein Sparziel " + monateFrueher +
        " Monate früher zu erreichen, müsstest du monatlich " +
        formatiereEuro(neuerSparbetrag) +
        " sparen. Das sind " +
        formatiereEuro(zusaetzlich) +
        " zusätzlich pro Monat.";
}


async function ladeEinnahmen() {

    try {
        // Gespeicherte Einnahmen vom Flask-Server abrufen
        const antwort = await fetch("/api/einnahmen");

        if (!antwort.ok) {
            throw new Error("Einnahmen konnten nicht geladen werden");
        }

        const gespeicherteEinnahmen = await antwort.json();

        // Bisherige Liste durch Datenbankeinträge ersetzen
        einnahmen = gespeicherteEinnahmen;

        // Übersicht aktualisieren
        aktualisiereUebersicht();

    } catch (fehler) {
        console.error("Fehler beim Laden der Einnahmen:", fehler);
    }
}

// Einnahmen beim Öffnen der Webseite laden
ladeEinnahmen();


async function ladeAusgaben() {

    try {
        // Gespeicherte Ausgaben vom Flask-Server abrufen
        const antwort = await fetch("/api/ausgaben");

        if (!antwort.ok) {
            throw new Error("Ausgaben konnten nicht geladen werden");
        }

        const gespeicherteAusgaben = await antwort.json();

        // Ausgaben aus SQLite übernehmen
        ausgaben = gespeicherteAusgaben;

        // Dashboard und Diagramme aktualisieren
        aktualisiereUebersicht();
        aktualisiereKategorieDiagramm();
        aktualisiereMonatsDiagramm(3);

    } catch (fehler) {
        console.error("Fehler beim Laden der Ausgaben:", fehler);
    }
}

// Ausgaben beim Öffnen der Webseite laden
ladeAusgaben();


async function ladeSparbetraege() {

    try {
        // Sparbeträge vom Flask-Server abrufen
        const antwort = await fetch("/api/sparen");

        if (!antwort.ok) {
            throw new Error("Sparbeträge konnten nicht geladen werden");
        }

        const gespeicherteSparbetraege = await antwort.json();

        // Sparbeträge aus SQLite übernehmen
        sparen = gespeicherteSparbetraege;

        // Übersicht aktualisieren
        aktualisiereUebersicht();

    } catch (fehler) {
        console.error("Fehler beim Laden der Sparbeträge:", fehler);
    }
}

// Sparbeträge beim Öffnen der Webseite laden
ladeSparbetraege();
