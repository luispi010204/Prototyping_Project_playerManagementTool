# Projektdokumentation – Prototyping: PlayerManagementTool

## Inhaltsverzeichnis

1. [Einordnung & Zielsetzung](#1-einordnung--zielsetzung)
2. [Zielgruppe & Stakeholder](#2-zielgruppe--stakeholder)
3. [Anforderungen & Umfang](#3-anforderungen--umfang)
4. [Vorgehen & Artefakte](#4-vorgehen--artefakte)
    - [Understand & Define](#41-understand--define)
    - [Sketch](#42-sketch)
    - [Decide](#43-decide)
    - [Prototype](#44-prototype)
    - [Validate](#45-validate)
5. [Erweiterungen [Optional]](#5-erweiterungen-optional)
6. [Projektorganisation [Optional]](#6-projektorganisation-optional)
7. [KI‑Deklaration](#7-ki‑deklaration)
8. [Anhang [Optional]](#8-anhang-optional)

> **Hinweis:** Massgeblich sind die im **Unterricht** und auf **Moodle** kommunizierten Anforderungen.

<!-- WICHTIG: DIE KAPITELSTRUKTUR DARF NICHT VERÄNDERT WERDEN! -->

<!-- Diese Vorlage ist für eine README.md im Repository gedacht. Abschnitte mit [Optional] können weggelassen werden, wenn in den Übungen nichts anderes verlangt wird. -->

## 1. Einordnung & Zielsetzung
Kurz beschreiben, welches Problem adressiert wird und welches Ergebnis angestrebt ist.
- **Kontext & Problem:** 
Trainer kleiner Sportteams haben häufig keinen strukturierten Überblick über ihre Spieler, deren Verfügbarkeit und mögliche Aufstellungen. Informationen darüber, wer für das nächste Spiel einsatzbereit ist, müssen oft manuell oder über persönliche Rückfragen eingeholt werden. Dadurch entsteht schnell Chaos, besonders wenn Verletzungen auftreten und sich die Verfügbarkeit kurzfristig ändert.  
- **Ziele:** 
Das Tool soll eine einfache und zentrale Möglichkeit bieten, Spieler anzulegen, zu verwalten und ihre aktuelle Einsatzfähigkeit festzuhalten. Trainer sollen jederzeit sehen können, welche Spieler verfügbar oder verletzt sind und auf dieser Basis potenzielle Aufstellungen planen können. Kernfunktionen sind das Erfassen, Bearbeiten und Löschen von Spielern sowie das Dokumentieren von Verletzungen oder Ausfällen.  
- **Abgrenzung [Optional]:** _Was gehört explizit nicht zum Umfang?_
Nicht Bestandteil des Projekts sind Taktikvisualisierungen, Statistiken oder Live-Tracking der Spieler. Das Tool konzentriert sich bewusst auf die Kernverwaltung der Spielerverfügbarkeit ohne zusätzliche Analyse- oder Monitoring-Funktionen.
## 2. Zielgruppe & Stakeholder
Wem nützt die Lösung, wer ist beteiligt oder betroffen?
- **Primäre Zielgruppe:** _[kurz beschreiben]_ Die Hauptzielgruppe sind Club-Manager und Coaches kleiner Sportteams, die einen klaren Überblick über ihren Spielerkader benötigen. Sie verwalten den Roster, treffen Entscheidungen für Spiele und müssen wissen, welche Spieler aktuell verfügbar, verletzt oder eingeschränkt einsatzbereit sind.  
- **Weitere Stakeholder [Optional]:** _[z. B. Verwaltung, Geschäftsleitung]_  
 
  - **Assistant Coaches:** profitieren von einem übersichtlichen Zugriff auf alle Spielerinformationen, um Trainings und Spiele besser planen zu können.  
  - **Spieler:** auch wenn sie das Tool nicht aktiv bedienen, betrifft sie die Verwaltung ihrer Verfügbarkeit und Verletzungen direkt – insbesondere im Hinblick auf Kommunikation, Wiedereinstiegszeit und Belastungsmanagement.
- **Annahmen [Optional]:** _[welche Hypothesen werden geprüft?]_
  - Die Trainer und Manager haben wenig Zeit und benötigen ein einfaches, schnelles Tool, um Übersicht über Verfügbarkeiten, Verletzungen und den Kaderstatus zu behalten.  
  - Die Verfügbarkeit der Spieler ist oft unklar oder wird spät kommuniziert, weshalb eine zentrale Dokumentation entscheidend ist.  
  - Wiederkehrende Verletzungen und mentale Belastungen sind reale Herausforderungen im Teamalltag, werden aber im Rahmen dieses Tools nicht tiefgehend behandelt – der Fokus liegt rein auf der Verfügbarkeitsverwaltung. 

## 3. Anforderungen & Umfang
Beschreibt den verbindlichen Umfang gemäss Übungen und allfällige Erweiterungen.
- **Kernfunktionalität (Mindestumfang):** _gemäss Übungen ab Semesterwoche 8; Workflows kurz nennen und optional illustrieren_  
- **Akzeptanzkriterien:** _[z. B. „Nutzende können Workflow X von Start bis Abschluss ohne Fehlermeldung durchführen.“]_  
- **Erweiterungen [Optional]:** _[Liste zusätzlicher Funktionen/Qualitätssprünge, falls umgesetzt]_  

## 4. Vorgehen & Artefakte
Die Durchführung erfolgt phasenbasiert; dokumentieren Sie die wichtigsten Ergebnisse je Phase.

### 4.1 Understand & Define
- **Ausgangslage & Ziele:** _[kurz]_
- **Zielgruppenverständnis:** _[Problemraumanalyse, Recherche]_
- **Wesentliche Erkenntnisse:** _[Stichpunkte]_

### 4.2 Sketch
- **Variantenüberblick:** _[kurz]_
- **Skizzen:** _Mehrere Varianten; Unterschiede kurz dokumentieren._

### 4.3 Decide
- **Gewählte Variante & Begründung:** _[Entscheidkriterien nennen]_  
- **End‑to‑End‑Ablauf:** _[kurz beschreiben]_  
- **Referenz‑Mockup:** _[URL, Screenshots mit kurzen Beschreibungen]_  

### 4.4 Prototype
- **Kernfunktionalität:** _[Kurzbeschreibung der Workflows/Funktionen]_  
- **Deployment:** https://prototypingplayermanagementtool.netlify.app

#### 4.4.1. Entwurf (Design)
Beschreibt die Gestaltung und Interaktion.
> **Hinweis:** Hier wird der **Prototyp** beschrieben, nicht das **Mockup**.
- **Informationsarchitektur:** _[z. B. Seiten/Navigation: Konzept, nicht die technische Umsetzung]_
- **Oberflächenentwürfe:** _[wichtige Screens: Screenshots mit kurzer Erläuterung]_  
- **Designentscheidungen:** _[zentrale Entscheidungen und Begründungen]_

#### 4.4.2. Umsetzung (Technik)
Fasst die technische Realisierung zusammen.
- **Technologie‑Stack:** _[SvelteKit, Bibliotheken falls genutzt]_
- **Tooling:** _[IDE/Erweiterungen, lokale/Cloud‑Tools; den Einsatz von KI beschreiben Sie im Kapitel **KI-Deklaration**]_  
- **Struktur & Komponenten:** _[Seiten, Routen, State/Stores, wichtige Komponenten]_
- **Daten & Schnittstellen [Optional]:** _[Datenquellen, API‑Entwürfe, Modelle]_
- **Besondere Entscheidungen:** _[z. B. Trade‑offs, Vereinfachungen]_  

### 4.5 Validate
- **URL der getesteten Version** (https://testversionofplayermanagementtool.netlify.app)
- **Ziele der Prüfung:** _[welche Fragen sollen beantwortet werden?]_  
- **Vorgehen:** _[moderiert/unmoderiert; remote/on‑site]_  
- **Stichprobe:** _[Mit wem wurde getestet? Profil; Anzahl]_  
- **Aufgaben/Szenarien:** _[Ausformulierte Testaufgaben]_  
- **Kennzahlen & Beobachtungen:** _[z. B. Erfolgsquote, Zeitbedarf, qualitative Findings]_  
- **Zusammenfassung der Resultate:** _[Wichtigste Erkenntnisse; 2–4 Sätze]_  
- **Abgeleitete Verbesserungen:** _[priorisiert, kurz begründet]_  
- **Umgesetzte Anpassungen [Optional]:** _[Im Prototyp umgesetzte Verbesserungen aufgrund der Erkenntnisse in der Evaluation]_ Idealerweise: Zwischenstände separat deployen, Änderungen dokumentieren.

## 5. Erweiterungen [Optional]
Dokumentiert Erweiterungen über den Mindestumfang hinaus.
- **Beschreibung & Nutzen:** _[Was wurde erweitert? Warum?]_  
- **Umsetzung in Kürze:** _[Wie wurde es gemacht?]_  
- **Abgrenzung zum Mindestumfang:** _[klar darstellen]_  

## 6. Projektorganisation [Optional]
Beispiele:
- **Repository & Struktur:** _[Link; kurze Strukturübersicht]_  
- **Issue‑Management:** _[Vorgehen kurz beschreiben]_  
- **Commit‑Praxis:** _[z. B. sprechende Commits]_

## 7. KI‑Deklaration
Die folgende Deklaration ist verpflichtend und beschreibt den Einsatz von KI im Projekt.

### Eingesetzte KI‑Werkzeuge
_[z. B. Copilot, ChatGPT, Claude, lokale Modelle; Version/Variante wenn bekannt]_

### Zweck & Umfang
_[**wie, wofür und in welchem Ausmass** wurde KI eingesetzt (z. B. Textentwürfe, Codevorschläge, Tests, Refactoring) sowie **Überlegungen** zu Qualität, Urheberrecht/Quellen und Prompt‑Vorgehen]_

### Art der Beiträge
_[konkret: welche Teile stammen (ganz/teilweise) aus KI‑Unterstützung?]_

### Eigene Leistung (Abgrenzung)
_[was ist eigenständig erarbeitet/überarbeitet worden?]_

### Reflexion
_[Nutzen, Grenzen, Risiken/Qualitätssicherung]_

### Prompt‑Vorgehen [Optional]
_[wichtige Prompts/Workflows in Kürze]_

### Quellen & Rechte [Optional]
_[verwendete Vorlagen/Assets/Modelle; Lizenz/Urheberrecht; Zitierweise]_

## 8. Anhang [Optional]
Beispiele:
- **Testskript & Materialien:** _[Link/Datei]_  
- **Rohdaten/Auswertung:** _[Link/Datei]_  

---

<!-- Prüfliste (nicht abgeben, nur intern nutzen) -->
<!--
[ ] Kernfunktionalität gemäss Übungen umgesetzt (Workflows durchgängig)
[ ] Akzeptanzkriterien formuliert und erfüllt
[ ] Skizzen erstellt (mehrere Varianten, Unterschiede dokumentiert)
[ ] Referenz‑Mockup in Decide verlinkt (URL/Screenshots)
[ ] Deployment erreichbar
[ ] Umsetzung (Technik) vollständig (Technologie‑Stack; Tooling & KI‑Einsatz inkl. Überlegungen; Struktur/Komponenten; Daten/Schnittstellen falls genutzt)
[ ] Evaluation durchgeführt; Ergebnisse dokumentiert; Verbesserungen abgeleitet
[ ] Dokumentation vollständig, klar strukturiert und konsistent
[ ] KI‑Deklaration ausgefüllt (Werkzeuge; Zweck & Umfang; Art der Beiträge; Abgrenzung; Quellen & Rechte; optional: Prompt‑Vorgehen, Reflexion)
[ ] Erweiterungen (falls vorhanden) begründet und abgegrenzt
[ ] Anhang gepflegt (Testskript/Materialien, Rohdaten/Auswertung) [optional]
-->