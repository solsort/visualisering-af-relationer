[![Build Status](https://travis-ci.org/solsort/visualisering-af-relationer.svg?branch=master)](https://travis-ci.org/solsort/visualisering-af-relationer)
[![Code Climate](https://codeclimate.com/github/solsort/visualisering-af-relationer/badges/gpa.svg)](https://codeclimate.com/github/solsort/visualisering-af-relationer)

# Visualisering af relationer - HTML5 visual relationsbrowser

Dette repositorie indeholder kode i forbindelse med projektet `visualisering af relationer`, og kommer til at indeholde en html5 visuel relationsbrowser til de danske biblioteker.

Projektet drives af Vejle og Herning biblioteker med støtte fra DDB-puljen.

Udviklingen foregår agilt/scrum-inspireret gennem 7 sprints á 2 uger. 
Hvert sprint afsluttes med en ny release, demo og retrospektiv.
Datoerne for sprintafslutningerne 26/9, 10/10, 24/10, 7/11, 21/11, 5/12 og 19/12.

Vi bruger scrumdo til at holde styr på opgaverne. Taskboard etc. er på http://www.scrumdo.com/projects/project/visualisering-af-relationer

## Installation/kørsel

- installer _npm_, _bower_ `npm install -g bower` og _grunt_ `npm install -g grunt-cli`
- hent projekt-afhængigheder `npm install`, `bower install`, `cd test; bower install`
- kør `grunt build` for at bygge minifiseret/optimeret udgave af kode i `dist/`. Se også de øvrige grunt-kommandoer med `grunt --help`

## Successkriterier og produktmål for HTML5 relationsbrowseren

*foreløbigt udkast*

- Relationsbrowseren skal fungere uanset hvilket system den implementeres i:
  - Skal kunne indlejres på hjemmesider, herunder særligt DDB
  - Skal kunne indlejres i applikation til storskærm (dog kun med en interagerende bruger ad gangen)
- Resultatet skal være en enkeltstående minifiseret javascript-fil, der kun afhænger af jquery og d3js
  - Skal have sit eget JavaScript scope, og ikke kollidere med globale objekter
  - Skal kunne initialiseres og styres med et enkelt api
- Relationsbrowseren skad mindst have tre "views":
  - Eksterne relationer: Fokus på et enkelt materiale, med visning tilhørende relationer (anmeldelser, forfatterinfo, værkstruktur og emner/cirkulære-relationer)
  - Strukturelle relationer: En samling af materialer og deres indbyrdes struktur, ie. bind i serie, eller et tidskrift med artikler
  - Cirkulære relationer: Relationer mellem forskellige værker eksempelvis på baggrund af emne, forfatter eller ADHL(andre der har lånt)
- Målplatform er efgrænset til nyere browsere der har features til at understøtte en visuel dynamisk relationsbrowser 
  - Webbrowsere: IE10+, Chrome, Safari, Firefox, iOS browser, Android 4+ browser
  - Skal fungere på mobil, tablet, computer og storskærm (dog kun med én interagerende bruger ad gangen)
- Teknologi og kode
  - Der kan frit vælges teknologi der gør det mest effektivt at udvikle modulet
  - Arkitektur og valg skal dokumenteres
  - Koden skal overholde best practices

## Kodestandard

Som udgangspunkt anvendes Ding coding standard for javascript http://ting.dk/wiki/ding-code-guidelines/.

Se `.jshintrc`, samt `jsbeautifier: {...}` afsnittet i `Gruntfile.js` for konkrete valg om formattering og valg af tilgang.
I forhold til jshint, er der truffet en del valg om at være mere stringent end ding-code-guidelines kræver. 
Nuværende eneste undtagelse hvor vi er mindre stringente, er at vi tillader brug af bitwise operatorer da disse skal bruges til geometriske beregninger.

Kommentarer indeholder desuden fold markers til at navigere i filen med editorer der understøtter dette, ie.: `{{{1`, `{{{2`, ...

## Release- og teststrategi og workflow.

- Release strategi html5-applikationen
  - Vi bruger semantisk versionering(http://semver.org), og laver typisk en ny release efter hvert sprint.
  - Minifiseret udgave (`grunt build`) af seneste release bliver lagt online på http://ssl.solsort.com/visualisering-af-relationer
  - Releases bliver tagget i git `git tag v0.?.?; git push --tags`, og også opdateret i `package.json`, og i releaseloggen i `README.md`
  - Email sendes herefter ud til arbejdsgruppen om ny udviklingsrelease, så yderligere manuel test og inkludering i drupal-modulet kan udføres.
- Teststrategi for manuel afprøvning: eksisterende, samt nyudviklede features i releaset testes:
  - På desktop browsere: IE10, IE11, Chrome, Safari, og Firefox
  - På Android og iOS enheder, både tablet og telefon.
  - Bugs, ændringer etc. tilføjes på https://github.com/solsort/visualisering-af-relationer/issues/new
- Efter test kan den minifiserede udgave inkluderes i https://github.com/vejlebib/ting_visual_relation og https://github.com/vejlebib/visual_relation

## Indlejring/API

Tilføj css-klassen `relvis-request` til de elementer der skal få relationsbrowseren til at poppe op. Tilføj derudover dataproperty'en `data-relvis-id` med ting-id for det pågældende element, og optional `data-relvis-type` der angiver hvilken type view det skal referere til, eksempelvis:

    <button class="relvis-request" data-relvis-type="external"
        data-relvis-id="870970-basis:22331892"> 
      click me
    </button>

Når siden loades, eller ændres skal `relvis.init({...});` kaldes. 
Denne gør at elementer ændre klasse fra `relvis-request` til enten `relvis-enabled` eller `relvis-disabled` afhængigt af om klient-browseren understøtter relationsvisualiseringen. Samtidigt vil `relvis.init` også bind'e events til `relvis-enabled` elementer så relationsbrowseren popper op ved klik/touch af elementet.

`relvis.init` tager et objekt med forskellige parametre som argument. Eksempler på parametre kan være `apiUrl` for url'en på det API widget'en skal tale med, eller `searchQuery`, hvis den nuværende side er en søgning.

Et mere komplet eksempel er:

    <style>
      .relvis-request {
        display: none;
      }
      .relvis-disabled {
        display: none;
      }
      .relvis-enabled {
      }
    </style>
    <button class="relvis-request" 
        data-relvis-id="870970-basis:22331892"> 
      click me
    </button>
    <script>
    $(function() {
      relvis.init({
        apiUrl: '//api.vejlebib.dk/'
      });
    });
    </script>

## ADHL test services

A development/sample data source for circular relations are generated. This is the python scripts in `adhl/`. to run them leveldb for python has to be installed `pip install leveldb` and the adhl dataset has to be available in the parent directory as `final_adhl.csv`. The adhl-dataset is the one DBC released on hack4dk 2014, with the fields `user,library,gender,birthyear,id,localid,clusterid,loan_date,title,authors,type`.

# Applikationsarkitektur og teknologivalg
## Cross-component functions and properties

- canvas-overlay
  - overlayVisible
  - showCanvasOverlay()
  - hideCanvasOverlay() 
  - initCanvas()
- canvas-util
  - writeBox(...)
- graph-canvas
  - fixedViewport = true | false
  - nodeAt(x, y)
  - `toCanvasCoord({x:..,y:..})`
  - `toGraphCoord({x:..,y:..})`
  - requestRedraw()
- item-view
  - visualObjectRatio
  - drawEdge(...)
  - drawNode(...)
- graph-layout
  - layoutGraph()
- graph-model
  - edges
  - nodes
  - reacts on `data-update`
- util
  - nearestPoints(...)
  - findBoundaries(...)
  - xy.add, xy.mul, xy.sub, xy.scale, xy.inv
  - addEventListener(name, fn), dispatchEvent(name, event-object), 
  - throttle(maxrate ie. 100ms, fn)
  - nextTick(fn)
- ui
  - initUI()
- main
  - init(...)
  - show(...)

## Events

- tapstart
- tapmove
- tapend
- redraw
- data-update
- get-triple

## Mind map
- Nuværende arkitektur
  - `canvas-overlay` - komponent der sikre
  - `main` - prototype-kode, skal refaktoreres nedenstående beskrevne komponenter
- Plan for arkitektur, koden forventes ihvertfald opdelt i følgende dele, - dele af disse udtrækkes til separate komponenter senere hen:
  - `canvas-overlay` - fuldskærmsoverlay, der abstraherer browserforskelle i forhold til skærm og mouse/touch-events.
  - `graph-layout` - udregner graf-layoutet på data-modellen i graf-vektorrummet
  - `graph-canvas` - afbilleder graf-vektorrummet til canvas-vektorrummet, og håndtere events (zoom, og interaktion med graf), og sikre flydende transitioner
  - `data-model` - data for objekter og relationer organiseres primært som objekter + triple store.
  - `util` - utility functions
  - `logging` - application logging and statistics
  - `item-view` - *applikationsspecifik* ved hvordan de enkelte objekter og relationer tegnes på canvas
  - `graph-model` - *applikationsspecifik* genererer graf ud fra datamodellen, herunder kant-liste og også kontrol af graf-layout
  - `data-source` - *applikationsspecifik* opdaterer data-modellen ud fra web-servicen, og kan forespørges for hvilke data der skal opdateres snarest
- Filstruktur
  - `app/` - selve kildekoden, javascript koden ligger i `app/scripts`
  - `test/` - kildekode testcases
  - `dist/` - den minificerede optimerede app havner her når `grunt build køres`
  - `node_modules/`, `bower_components/`, `.tmp/` - autogenerede og installerede dependencies og temporære filer
  - `bower.json`, `.gitignore`, `package.json`, `.yo-rc.json`, `.travis.yml`, `Gruntfile.js`, `.editorconfig`, `.gitattributes`, `COPYING`, `.jshintrc`  - konfigurationsfiler og metainformationer
  - `README.md` denne fil/dokumentation
- Teknologivalg
  - jquery - abstraktion over browserforskelligheder, vælges da den allerede anvendes på DDB-CMS hvilket er det primære sted hvor relationsbrowseren skal indlejres
  - d3js - bruges til graf-layout og forskellig geometrisk funktionalitet
  - grunt - byggeværktøj
  - bower - styring af afhængigheder ifht. browserafhængigheder
  - npm - bruges primært til installation af øvrige værktøj
  - travis-ci - service for continous integration - automatisk kørsel af test
  - jshint, jsbeautifier - værktøj til at understøtte best practices og formattering af kode

# Releaselog

Indeværende sprint - todo and progress:

- √klarere data model
  - √triple-store: `addTriple(obj, prop, val)`, `removeTriple(obj, prop, val)`, `getTripleValues(obj, prop)`
  - √generering af graf-data fra triple-store-data
  - √data-model som separat komponent
  - √events for requests
  - √data-update event, og regenerer-graf on event
  - √throttled function
- √kommunikation med APIet
  - √get the data from the API
  - √sample api-button
- √interaktion - træk elementer rundt på skærmen
  - √pinned option på node
  - √lock view during interaction
  - √handle tap-down
  - √handle move
  - √handle release
- √sikr den kan køre rent asynkront, ie. ikke anvender jquery og d3 før init kaldes
- •sample server for cirkulære relationer (baseret på ADHL)
  - √undersøg om det kan lade sig gøre, ie. korrespondans mellem ting-id og adhl-data
  - •script der skaber database
  - api-server
- visualisering af cirkulære relationer 
  - indhentning af data fra api-server
  - graph-walk, og identifikation af hvilke nodes der skal vises
  - tegning af relationer
  - knap til aktivering


## Version 0.2.0, released 10/10, sprint 2

- API for embedning
  - afklar api for embedning
  - implementér
  - dokumentér
- refaktorér - gå mere i retning af arkitekturplan
  - item-view som separat komponent
  - util som separat komponent
  - fælles relvis scope
  - graph-layout som separat komponent
  - graph-model som separat komponent, både kant-liste og også pseudo-nodes for forfatter/anmeldels/struktur/cirkulær
  - graph-canvas som separat komponent
  - mere dokumentation 
  - mere test
- graph-canvas
  - to-vejs transformation mellem canvas-koordinater og graf-koordinater
  - klik/touch element afklar hvilket
- visualisering
  - forside som del af visning hvis tilgængelig
  - kanter/linjer mellem relationer
- canvas-overlay
  - korrekt placering af canvas i Internet Explorer
  - opdater position ved scroll/zoom/skærm-rotation
  - abstraher touch/mouse-events
  - skala/unit-information
  - håndtér unsupported browsers
  - Undersøg om vi kan køre på android 2, eller er bundet til android 4+ pga. canvas bugs.
    - android 2.1 virker ikke pga. https://code.google.com/p/android/issues/detail?id=5141
    - android 2.2 ser ud til at virke

## Version 0.1.0, released 27/9, sprint 1

- Infrastruktur udvikling af HTML5 relationsbrowseren
  - oprettelse af github-repositorie http://github.com/solsort/visualisering-af-relationer så der er åbenhed om udviklingsprocessen, og muligt løbende at følge med
  - application skeleton
  - build environment: grunt, bower, npm, jshint, jsbeautifier, codeclimate
  - continous integration server
  - online udgave af seneste release på http://ssl.solsort.com/visualisering-af-relationer
- Start på første prototype af den eksterne relationsbrowser
  - sample/dummy data for development
  - overlay for visualisering
  - layout af elementer via d3 force graph
  - automatisk skalering af elementer
  - linjeskift og automatisk skalering af tekst
  - tegning af klynge/sky
- Afklaring og dokumentation
  - kodestandard
  - applikationsarkitektur
  - udkast til release og test-strategi
  - udkast til produktmål

# Backlog

- margin fit size of objects
- zoom/dpi-bug when interacting
- ensure repeated open/close of overlay doesn't leak resources
- afklaring: hvilke relationstyper/data har vi tilgængelige fra brønd etc.
- visualiserings-view: addi/eksterne relationer - relationer der vender ind ad
- visualiserings-view: strukturelle relationer
- visualiserings-view: cirkulære relationer - relationer der vender ud ad
- evt. sky/graf-agtig
- evt. tile/mesh-visualisering
- træstruktur-visualisering rettet mod små skærme
- mulighed for at dele link til visualisering, samt virkende tilbageknap til visualisering i browseren. Teknisk: indkodning af visualiseringen i #-fragment i urlen, og brug af history-apiet.
- storskærmsapplikation (evt. via node-webkit)
- opsamling af statistik / måling af anvendelse
- forbedring/optimering ud fra indsamlet statistik - logger modul

# Projektnoter

_nedenstående er mine(rasmuserik) umiddelbare noter_

- Use cases
  - DDB-CMS - mobil - tablet - pc 
    - eksempelvis knap/overlay på værkvisning object/collection
    - eksempelvis knap/overlay ved hvert værk i søgeresultat
  - storskærme med touch - dog kun én bruger per skærm (ikke flere samtidige brugere af samme skærm)
- Formål: udforskning af biblioteksmaterialer, evt. lappe på værkvisning, præsentere relationer bedre
- Inspiration:
  - kig på spotify ui
  - tiles/mesh
  - komplekse strukturelle relationer i klassiske musikværker


## Møder og arrangementer

- næste udviklernetværksmøde i Herning - med præsentation/status på projekt

- indledende møde vejle 2014-08-06
- arbejdsmøde vejle 2014-09-10
