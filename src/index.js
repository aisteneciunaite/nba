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

// Pastarūjų 20 metų NBA sezono svarbiausia informacija (iš čia reikės imti informaciją)

import _ from 'lodash';
const buttons = document.querySelectorAll('button.btn.btn-info');
const clearFiltersButton = document.querySelector('#btn-clear');
const yearSelector = document.querySelector('#yearSelector');
const pageContent = document.querySelector('#pageContent');
const pageTitle = document.querySelector('#title');
const headshotFallback =
  'https://stats.nba.com/media/img/league/nba-headshot-fallback.png';
const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Modi dolores amet ab in velit ipsa asperiores aspernatur! Autem eaque quis eum, optio rem expedita, ducimus unde incidunt quod voluptas architecto!';

//SET UP DATA OBJECTS
//set up players object
let players;
function getPlayerData() {
  let xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (this.status == 200) {
      players = JSON.parse(this.responseText);
    }
  };
  xhr.open('GET', '../src/players.json', true);
  xhr.send();
}
getPlayerData();
//set up teams object
let teams;
function getTeamData() {
  let xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (this.status == 200) {
      teams = JSON.parse(this.responseText);
    }
  };
  xhr.open('GET', '../src/teams.json', true);
  xhr.send();
}
getTeamData();
//set up seasons object
let seasonsObj;
function getSeasonData() {
  let nbaSeasons;
  let xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (this.status == 200) {
      nbaSeasons = JSON.parse(this.responseText);
      seasonsObj = nbaSeasons.reduce((acc, curr) => {
        acc[curr.year] = curr;
        return acc;
      }, {});
      createSeasonsOptions();
      populatePage();
    }
  };
  xhr.open('GET', '../src/seasons.json', true);
  xhr.send();
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

//POPULATE DODUMENT FUNCTIONS
// populate Year dropdown
let createSeasonsOptions = () => {
  let seasons = Object.keys(seasonsObj).reverse();

  seasons.forEach(season => {
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
  pageContent.innerHTML = '';
  pageTitle.innerText = `All seasons results`;
  let table = document.createElement('table');
  table.classList.add('table', 'table-hover');
  table.innerHTML = '<thead></thead><tbody></tbody>';
  pageContent.appendChild(table);
  let tableHead = table.firstElementChild;
  let tableBody = table.lastElementChild;
  let trHead = document.createElement('tr');
  trHead.innerHTML = '<th scope="col">Seasons</th>';
  tableHead.appendChild(trHead);
  //populate table head
  details.forEach(detail => {
    let th = document.createElement('th');
    th.innerText = getDetailText(detail);
    th.setAttribute('scope', 'col');
    trHead.appendChild(th);
  });
  // populate table body
  years.forEach(year => {
    let tr = document.createElement('tr');
    tr.innerHTML = `<th scope="row">${year}</th>`;
    tableBody.appendChild(tr);
    details.forEach(detail => {
      let td = document.createElement('td');
      td.innerText = seasonsObj[year][detail];
      tr.appendChild(td);
    });
  });
};
// sub function to populate page with a grid
let createGrid = (year, details) => {
  pageContent.innerHTML = '';
  pageTitle.innerText = `${year} season results`;
  let cardGrid = document.createElement('div');
  cardGrid.setAttribute('class', 'row row-cols-1 row-cols-md-2');
  pageContent.appendChild(cardGrid);
  details.forEach(detail => {
    let name = seasonsObj[year][detail];
    let cardColumn = document.createElement('div');
    cardColumn.setAttribute('class', 'col mb-4');
    let card = document.createElement('div');
    card.classList.add('card');
    cardGrid.appendChild(cardColumn);
    cardColumn.append(card);

    let cardHeader = document.createElement('h5');
    cardHeader.classList.add('card-header');
    cardHeader.innerText = getDetailText(detail);
    card.appendChild(cardHeader);

    let imageContainer = document.createElement('div');
    imageContainer.setAttribute('class', 'd-flex justify-content-center');
    let image = document.createElement('img');
    let imageContent = getImage(detail, name);
    image.setAttribute('src', imageContent);
    imageContainer.appendChild(image);
    card.appendChild(imageContainer);

    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    card.appendChild(cardBody);

    let cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.innerText = name;
    cardBody.appendChild(cardTitle);

    let description = document.createElement('p');
    description.innerText = getBio(detail, name);
    cardBody.appendChild(description);
  });
};
// sub function to populate page with a profile
let createProfile = (year, detail) => {
  pageContent.innerHTML = '';
  pageTitle.innerText = `${year} season ${getDetailText(detail)}:`;
  let name = seasonsObj[year][detail];

  let profileContainer = document.createElement('div');
  pageContent.appendChild(profileContainer);

  let profileHeading = document.createElement('h3');
  profileHeading.innerText = name;
  profileContainer.appendChild(profileHeading);

  let profileImage = document.createElement('img');
  profileImage.src = getImage(detail, name);
  profileContainer.appendChild(profileImage);

  let par1 = document.createElement('p');
  par1.innerText = getBio(detail, name);
  profileContainer.appendChild(par1);

  let par2 = document.createElement('p');
  par2.innerText = lorem;
  profileContainer.appendChild(par2);

  let par3 = document.createElement('p');
  par3.innerText = lorem;
  profileContainer.appendChild(par3);
};
// sub function to populate page with a list
let createList = (years, detail) => {
  pageContent.innerHTML = '';
  pageTitle.innerText = `All seasons ${getDetailText(detail)}s`;
  let ul = document.createElement('ul');
  ul.classList.add('p-0');
  pageContent.appendChild(ul);

  years.forEach(year => {
    let name = seasonsObj[year][detail];
    let li = document.createElement('li');
    li.classList.add('media', 'border', 'p-3', 'd-flex', 'align-items-center');

    let img = document.createElement('img');
    img.classList.add('mr-3', 'h50px');
    img.setAttribute('src', getImage(detail, name));
    img.setAttribute(
      'onError',
      `this.onerror=null; this.src='${headshotFallback}';`
    );
    li.appendChild(img);

    let mediaBody = document.createElement('div');
    mediaBody.classList.add('media-body');
    li.appendChild(mediaBody);

    let h5 = document.createElement('h5');
    h5.classList.add('mt-0', 'mb-1');
    h5.innerText = `${year} ${getDetailText(detail)}: ${name}`;
    mediaBody.appendChild(h5);
    let text = document.createTextNode(getBio(detail, name));
    mediaBody.appendChild(text);

    ul.appendChild(li);
  });
};

//EVENT LISTENERS
document.onload();

yearSelector.addEventListener('change', function() {
  let activeButton = document.querySelector('button.active');
  let years = yearSelector.value ? yearSelector.value : undefined;
  let details = activeButton
    ? activeButton.getAttribute('data-details')
    : undefined;
  populatePage(years, details);
});

buttons.forEach(button => {
  button.addEventListener('click', function() {
    //reset active state on all buttons
    buttons.forEach(btn => {
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

clearFiltersButton.addEventListener('click', function() {
  buttons.forEach(button => {
    button.classList.remove('active');
  });
  let years = yearSelector.value ? yearSelector.value : undefined;
  populatePage(years);
  this.disabled = true;
});
