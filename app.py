
from flask import Flask, request, send_from_directory
import sqlite3

app = Flask(__name__)

# Verbindung zur SQLite-Datenbank
def datenbank_verbinden():
    verbindung = sqlite3.connect("finanzplaner.db")
    verbindung.row_factory = sqlite3.Row
    return verbindung


# Startseite

# Unsere Finanzplaner-Webseite anzeigen
@app.route("/")
def startseite():
    return send_from_directory(".", "index.html")


# CSS-Datei bereitstellen
@app.route("/style.css")
def css_datei():
    return send_from_directory(".", "style.css")


# JavaScript-Datei bereitstellen
@app.route("/script.js")
def javascript_datei():
    return send_from_directory(".", "script.js")


# Datenbankverbindung testen
@app.route("/test-datenbank")
def test_datenbank():

    verbindung = datenbank_verbinden()

    tabellen = verbindung.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()

    verbindung.close()

    tabellen_namen = [tabelle["name"] for tabelle in tabellen]

    return {
        "status": "Verbindung erfolgreich",
        "tabellen": tabellen_namen
    }


# Neue Einnahme in der Datenbank speichern
@app.route("/api/einnahmen", methods=["POST"])
def einnahme_speichern():

    daten = request.get_json()

    if not isinstance(daten, dict):
        return {"fehler": "Ungültige Daten"}, 400

    try:
        betrag = int(daten["betrag"])
        kategorie = daten["kategorie"]
        datum = daten["datum"]
    except (KeyError, TypeError, ValueError):
        return {"fehler": "Ungültige Eingaben"}, 400

    if betrag <= 0 or not isinstance(kategorie, str) or not kategorie.strip():
        return {"fehler": "Ungültige Eingaben"}, 400

    if not isinstance(datum, str) or not datum.strip():
        return {"fehler": "Ungültiges Datum"}, 400

    verbindung = datenbank_verbinden()

    verbindung.execute(
        """
        INSERT INTO Einnahmen (betrag, kategorie, datum)
        VALUES (?, ?, ?)
        """,
        (betrag, kategorie.strip(), datum)
    )

    verbindung.commit()
    verbindung.close()

    return {"status": "Einnahme gespeichert"}, 201


# Alle gespeicherten Einnahmen abrufen
@app.route("/api/einnahmen", methods=["GET"])
def einnahmen_laden():

    verbindung = datenbank_verbinden()

    einnahmen = verbindung.execute(
        "SELECT id, betrag, kategorie, datum FROM Einnahmen ORDER BY id"
    ).fetchall()

    verbindung.close()

    # Datenbankeinträge in JSON umwandeln
    ergebnis = []

    for einnahme in einnahmen:
        ergebnis.append({
            "id": einnahme["id"],
            "betrag": einnahme["betrag"] / 100,
            "kategorie": einnahme["kategorie"],
            "datum": einnahme["datum"]
        })

    return ergebnis


# Neue Ausgabe in SQLite speichern
@app.route("/api/ausgaben", methods=["POST"])
def ausgabe_speichern():

    daten = request.get_json(silent=True)

    if not isinstance(daten, dict):
        return {"fehler": "Ungültige Daten"}, 400

    try:
        betrag = int(daten["betrag"])
        kategorie = daten["kategorie"]
        datum = daten["datum"]
    except (KeyError, TypeError, ValueError):
        return {"fehler": "Ungültige Eingaben"}, 400

    # Eingaben überprüfen
    if betrag <= 0:
        return {"fehler": "Der Betrag muss größer als 0 sein"}, 400

    if not isinstance(kategorie, str) or not kategorie.strip():
        return {"fehler": "Ungültige Kategorie"}, 400

    if not isinstance(datum, str) or not datum.strip():
        return {"fehler": "Ungültiges Datum"}, 400

    # Ausgabe in Datenbank speichern
    verbindung = datenbank_verbinden()

    verbindung.execute(
        """
        INSERT INTO Ausgaben (betrag, kategorie, datum)
        VALUES (?, ?, ?)
        """,
        (betrag, kategorie.strip(), datum)
    )

    verbindung.commit()
    verbindung.close()

    return {"status": "Ausgabe gespeichert"}, 201


# Alle gespeicherten Ausgaben abrufen
@app.route("/api/ausgaben", methods=["GET"])
def ausgaben_laden():

    verbindung = datenbank_verbinden()

    ausgaben = verbindung.execute(
        "SELECT id, betrag, kategorie, datum FROM Ausgaben ORDER BY id"
    ).fetchall()

    verbindung.close()

    ergebnis = []

    for ausgabe in ausgaben:
        ergebnis.append({
            "id": ausgabe["id"],
            "betrag": ausgabe["betrag"] / 100,
            "kategorie": ausgabe["kategorie"],
            "datum": ausgabe["datum"]
        })

    return ergebnis


# Neue Sparbeträge in SQLite speichern
@app.route("/api/sparen", methods=["POST"])
def sparen_speichern():

    daten = request.get_json(silent=True)

    if not isinstance(daten, dict):
        return {"fehler": "Ungültige Daten"}, 400

    try:
        betrag = int(daten["betrag"])
        kategorie = daten["kategorie"]
        datum = daten["datum"]
    except (KeyError, TypeError, ValueError):
        return {"fehler": "Ungültige Eingaben"}, 400

    # Eingaben überprüfen
    if betrag <= 0:
        return {"fehler": "Der Betrag muss größer als 0 sein"}, 400

    if not isinstance(kategorie, str) or not kategorie.strip():
        return {"fehler": "Ungültige Kategorie"}, 400

    if not isinstance(datum, str) or not datum.strip():
        return {"fehler": "Ungültiges Datum"}, 400

    # Sparbetrag in SQLite speichern
    verbindung = datenbank_verbinden()

    verbindung.execute(
        """
        INSERT INTO Sparen (betrag, kategorie, datum)
        VALUES (?, ?, ?)
        """,
        (betrag, kategorie.strip(), datum)
    )

    verbindung.commit()
    verbindung.close()

    return {"status": "Sparbetrag gespeichert"}, 201


# Alle gespeicherten Sparbeträge abrufen
@app.route("/api/sparen", methods=["GET"])
def sparen_laden():

    verbindung = datenbank_verbinden()

    sparbetraege = verbindung.execute(
        "SELECT id, betrag, kategorie, datum FROM Sparen ORDER BY id"
    ).fetchall()

    verbindung.close()

    ergebnis = []

    for eintrag in sparbetraege:
        ergebnis.append({
            "id": eintrag["id"],
            "betrag": eintrag["betrag"] / 100,
            "kategorie": eintrag["kategorie"],
            "datum": eintrag["datum"]
        })

    return ergebnis


# Neues Sparziel in SQLite speichern
@app.route("/api/sparziele", methods=["POST"])
def sparziel_speichern():

    daten = request.get_json(silent=True)

    if not isinstance(daten, dict):
        return {"fehler": "Ungültige Daten"}, 400

    try:
        bezeichnung = daten["bezeichnung"]
        zielbetrag = int(daten["zielbetrag"])
        startbetrag = int(daten["startbetrag"])
        monatlicher_sparbetrag = int(daten["monatlicher_sparbetrag"])

    except (KeyError, TypeError, ValueError):
        return {"fehler": "Ungültige Eingaben"}, 400

    # Eingaben überprüfen
    if not isinstance(bezeichnung, str) or not bezeichnung.strip():
        return {"fehler": "Bitte eine Bezeichnung eingeben"}, 400

    if zielbetrag <= 0:
        return {"fehler": "Der Zielbetrag muss größer als 0 sein"}, 400

    if startbetrag < 0 or monatlicher_sparbetrag < 0:
        return {"fehler": "Beträge dürfen nicht negativ sein"}, 400

    # Sparziel in SQLite speichern
    verbindung = datenbank_verbinden()

    verbindung.execute(
        """
        INSERT INTO Sparziele
        (bezeichnung, zielbetrag, startbetrag, monatlicher_sparbetrag)
        VALUES (?, ?, ?, ?)
        """,
        (
            bezeichnung.strip(),
            zielbetrag,
            startbetrag,
            monatlicher_sparbetrag
        )
    )

    verbindung.commit()
    verbindung.close()

    return {"status": "Sparziel gespeichert"}, 201


if __name__ == "__main__":
    app.run(debug=True)
