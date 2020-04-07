// JavaScript kodas

/* UŽDUOTIS: Reikės sukurti filtravimo (paieškos) aplikaciją,
 *  kurioje vartotojas galės pasirinkti vieną iš
 *  pastarūjų 20 metų NBA (krepšinio lygos)
 *  sezonų t.y. nuo 2000 metų iki 2019 metų ir
 *  išsifiltruoti informaciją t.y. kas atitinkamą sezoną:
 *  1) tapo NBA lygos čempionais (champion);
 *  2) tapo NBA lygos vicečempionais (runnerUp);
 *  3) laimėjo finalo serijos naudingaiuso žaidėjo apdovanojimą (finalsMVP)
 *  4) laimėjo reguliaraus sezono naudingiauso žaidėjo apdovanojimą (mvp)
 *
 *  Informaija apie atitinakmą sezoną bus talpinama masyve nbaSeasons.
 *  Informacija, kuri bus atvaiduojama turės būti imama iš masyvo nbaSeasons
 *  Vartojas galės atlikti paiešką šiais būdais:
 *       - Pasirinkti metus (naudokite <select> HTML tagą)
 *       - Pasirinkti norimą informaciją paslausdamas mygtuką (pvz. "Tapo čempionais")
 *       - Informacija turės būti pateikima su tekstu ir nuotrauka (pvz. žaidėjo nuotrauka
 *       ar komandos nuotrauka su trofėjumi).
 */
import _ from 'lodash';
const buttons = document.querySelectorAll('button.btn.btn-info');
const clearFiltersButton = document.querySelector('#btn-clear');
const yearSelector = document.querySelector('#yearSelector');
const pageContent = document.querySelector('#pageContent');
const pageTitle = document.querySelector('#title');
const headshotFallback = 'https://stats.nba.com/media/img/league/nba-headshot-fallback.png';
const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Modi dolores amet ab in velit ipsa asperiores aspernatur! Autem eaque quis eum, optio rem expedita, ducimus unde incidunt quod voluptas architecto!';

//SET UP DATA OBJECTS
//set up players object
let players;
async function getPlayerData() {
  let res = await fetch('../src/players.json');
  players = await res.json();
}
getPlayerData();

//set up teams object
let teams;
async function getTeamData() {
  let res = await fetch('../src/teams.json');
  teams = await res.json();
}
getTeamData();
//set up seasons object
let seasonsObj;
async function getSeasonData() {
  let res = await fetch('../src/seasons.json');
  let nbaSeasons = await res.json();
  seasonsObj = nbaSeasons.reduce((acc, curr) => {
    acc[curr.year] = curr;
    return acc;
  }, {});
  createSeasonsOptions();
  populatePage();
}
getSeasonData();

// HELPERS TO CREATE CONTENT COMPONENTS
function getImage(detail, name) {
  if (detail === 'mvp' || detail === 'finalsMVP') {
    let playerId = players[name].PlayerID;
    return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
  } else if (detail === 'champion' || detail === 'runnerUp') {
    let teamAbr = teams[name].Abbrev;
    return `https://www.nba.com/assets/logos/teams/primary/web/${teamAbr}.svg`;
  }
}
function getBio(detail, name) {
  if (detail === 'mvp' || detail === 'finalsMVP') {
    return players[name].bio;
  } else if (detail === 'champion' || detail === 'runnerUp') {
    return teams[name].bio;
  }
}
function getDetailText(detail) {
  switch (detail) {
    case 'champion':
      return 'Champion';
    case 'runnerUp':
      return 'Runner up';
    case 'finalsMVP':
      return 'Finals MVP';
    case 'mvp':
      return 'MVP';
    default:
      return 'unknown';
  }
}

//POPULATE DOCUMENT FUNCTIONS
// populate Year dropdown
let createSeasonsOptions = () => {
  let seasons = Object.keys(seasonsObj).reverse();

  seasons.forEach((season) => {
    let option = document.createElement('option');
    option.innerText = season;
    option.setAttribute('value', season);
    yearSelector.appendChild(option);
  });
};
// main function to populate page content
let populatePage = (
  years = Object.keys(seasonsObj).reverse(),
  details = ['champion', 'runnerUp', 'finalsMVP', 'mvp']
) => {
  if (typeof years === 'object' && typeof details === 'object') {
    createTable(years, details);
  } else if (typeof years === 'string' && typeof details === 'object') {
    createGrid(years, details);
  } else if (typeof years === 'string' && typeof details === 'string') {
    createProfile(years, details);
  } else if (typeof years === 'object' && typeof details === 'string') {
    createList(years, details);
  }
};
// sub function to populate page with a table
let createTable = (years, details) => {
  //set up table structure
  pageContent.innerHTML = `<table class="table table-hover">
                            <thead>
                              <tr>
                                <th scope="col">Seasons</th>
                              </tr>
                            </thead>
                            <tbody></tbody>
                          <table>`;
  pageTitle.innerText = `All seasons results`;

  let table = pageContent.firstElementChild;
  let tableHead = table.firstElementChild;
  let tableBody = table.lastElementChild;
  let trHead = tableHead.firstElementChild;

  //  create table headers
  details.forEach((detail) => {
    trHead.innerHTML += `<th scope="col">${getDetailText(detail)}</th>`;
  });

  // populate table body
  years.forEach((year) => {
    let tr = document.createElement('tr');

    let output = `<th scope="row">${year}</th>`;

    details.forEach((detail) => {
      output += `<td>${seasonsObj[year][detail]}</td>`;
    });

    tr.innerHTML = output;
    tableBody.appendChild(tr);
  });
};

// sub function to populate page with a grid
let createGrid = (year, details) => {
  pageContent.innerHTML = '';
  pageTitle.innerText = `${year} season results`;
  let cardGrid = document.createElement('div');
  cardGrid.setAttribute('class', 'row row-cols-1 row-cols-md-2');
  pageContent.appendChild(cardGrid);

  details.forEach((detail) => {
    let name = seasonsObj[year][detail];
    let newCard = `<div class="col mb-4">
                    <div class="card">
                      <h5 class="card-header">${getDetailText(detail)}</h5>
                      <div class="d-flex justify-content-center">
                        <img 
                        src="${getImage(detail, name)}" 
                        onerror="this.onerror=null; this.src='${headshotFallback}';">
                      </div>
                      <div class="card-body">
                        <h5>${name}</h5>
                        <p>${getBio(detail, name)}</p>
                      </div>
                    </div>
                  </div>`;
    cardGrid.innerHTML += newCard;
  });
};
// sub function to populate page with a profile
let createProfile = (year, detail) => {
  pageTitle.innerText = `${year} season ${getDetailText(detail)}:`;
  let name = seasonsObj[year][detail];
  pageContent.innerHTML = `<div>
                            <h3>${name}</h3>
                            <img src="${getImage(detail, name)}">
                            <p>${getBio(detail, name)}</p>
                            <p>${lorem}</p>
                            <p>${lorem}</p>
                          <div>`;
};
// sub function to populate page with a list
let createList = (years, detail) => {
  pageTitle.innerText = `All seasons ${getDetailText(detail)}s`;
  pageContent.innerHTML = '<ul class="p-0"></ul>';
  let ul = pageContent.firstElementChild;

  years.forEach((year) => {
    let name = seasonsObj[year][detail];
    let newLi = `<li class="media border p-3 d-flex align-items-center">
                    <img
                      src="${getImage(detail, name)}"
                      class="mr-3 h50px" onerror="this.onerror=null; this.src='${headshotFallback}';"
                    >
                    <div class="media-body">
                      <h5 class="mt-0 mb-1">${year} ${getDetailText(detail)}: ${name}</h5>
                      <p>${getBio(detail, name)}</p>
                    </div>
                </li>`;

    ul.innerHTML += newLi;
  });
};

//EVENT LISTENERS

yearSelector.addEventListener('change', function () {
  let activeButton = document.querySelector('button.active');
  let years = yearSelector.value ? yearSelector.value : undefined;
  let details = activeButton ? activeButton.getAttribute('data-details') : undefined;
  populatePage(years, details);
});

buttons.forEach((button) => {
  button.addEventListener('click', function () {
    //reset active state on all buttons
    buttons.forEach((btn) => {
      btn.classList.remove('active');
    });

    this.classList.add('active');

    clearFiltersButton.disabled = false;
    // check if year is selected, then populate page
    yearSelector.value
      ? populatePage(yearSelector.value, this.getAttribute('data-details'))
      : populatePage(undefined, this.getAttribute('data-details'));
  });
});

clearFiltersButton.addEventListener('click', function () {
  buttons.forEach((button) => {
    button.classList.remove('active');
  });
  let years = yearSelector.value ? yearSelector.value : undefined;
  populatePage(years);
  this.disabled = true;
});
