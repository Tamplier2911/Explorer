// @ts-nocheck

let launches = [];
let planets = [];

const numberHeading = 'No.';
const dateHeading = 'Date';
const missionHeading = 'Mission';
const rocketHeading = 'Rocket';
const targetHeading = 'Destination';
const customersHeading = 'Customers';

let loadingPlanets = false;
let loadingLaunches = false;

// format string to look pretty
const chopString = (str) =>
  str.length > 19 ? [...str.slice(0, 19)].concat('...').join('') : str;

// simple update enforcer
const enforceUpdate = (loading, cb, time) => {
  loading ? setTimeout(cb, time) : cb();
};

function initValues() {
  const today = new Date().toISOString().split('T')[0];
  const launchDaySelector = document.getElementById('launch-day');
  launchDaySelector.setAttribute('min', today);
  launchDaySelector.setAttribute('value', today);
}

async function loadLaunches() {
  // TODO: Once API is ready.
  try {
    // is loading
    loadingLaunches = true;
    // console.log(loadingLaunches, 'launches');

    const res = await fetch('/api/v1/launches', {
      method: 'GET',
    });
    const data = await res.json();
    // console.log(data);
    launches = data;

    // is loaded
    loadingLaunches = false;
    // console.log(loadingLaunches, 'launches');
  } catch (err) {
    console.log(err.message);
  }
}

async function loadPlanets() {
  // TODO: Once API is ready.

  try {
    loadingPlanets = true;
    // console.log(loadingPlanets, 'planets');

    const res = await fetch('/api/v1/planets', {
      method: 'GET',
    });
    const data = await res.json();
    // console.log(data);
    planets = data;

    // is loaded
    loadingPlanets = false;
    // console.log(loadingPlanets, 'planets');
  } catch (err) {
    console.log(err.message);
  }
}

function abortLaunch() {
  // TODO: Once API is ready.
  // Delete launch and reload launches.
}

function submitLaunch(e) {
  e.preventDefault();

  const target = document.getElementById('planets-selector').value;
  const launchDate = new Date(document.getElementById('launch-day').value);
  const mission = document.getElementById('mission-name').value;
  const rocket = document.getElementById('rocket-name').value;
  const flightNumber = launches.length
    ? launches[launches.length - 1].flightNumber + 1
    : 1;

  // remvoe later
  const customers = ['NASA', 'ZTM'];

  launches.push({
    target,
    launchDate: launchDate / 1000,
    mission,
    rocket,
    flightNumber,
    customers,
    upcoming: true,
  });

  document.getElementById('launch-success').hidden = false;

  // TODO: Once API is ready.
  // Submit above data to launch system and reload launches.
}

function listPlanets() {
  const planetSelector = document.getElementById('planets-selector');
  if (loadingPlanets) {
    planetSelector.innerHTML = `<option>...Loading</option>`;
    enforceUpdate(loadingPlanets, listPlanets, 2000);
  } else {
    planets.forEach((planet) => {
      planetSelector.innerHTML = `
        <option value="${planet.kepoi_name}">${planet.kepoi_name}</option>`;
    });
  }
}

function listUpcoming() {
  const upcomingList = document.getElementById('upcoming-list');
  if (loadingLaunches) {
    upcomingList.innerHTML = `
    <div class="loading">
      <div class="loading__wrapper">
        <div class="loading__inner"></div>
        <div class="loading__inner"></div>
      </div>
    </div>`;
    enforceUpdate(loadingLaunches, listUpcoming, 2000);
  } else {
    upcomingList.innerHTML = `
     <div class="upcoming__bot--head">
       <span class="upcoming__bot--line">RM</span>
       <span class="upcoming__bot--line">${numberHeading}</span>
       <span class="upcoming__bot--line">${dateHeading}</span>
       <span class="upcoming__bot--line">${missionHeading}</span>
       <span class="upcoming__bot--line">${rocketHeading}</span>
       <span class="upcoming__bot--line">${targetHeading}</span>
     </div>`;

    // filter all upcoming launches
    // const filteredLaunches = launches.filter((launch) => launch.upcoming);
    // sort by current date
    // filteredLaunches.sort((a, b) => a.launchDate - b.launchDate);

    launches
      .filter((launch) => launch.upcoming)
      .forEach((launch) => {
        // console.log(launch);
        const launchDate = new Date(launch.launchDate * 1000).toDateString();
        const flightNumber = String(launch.flightNumber);
        const mission = chopString(launch.mission);
        const rocket = chopString(launch.rocket);
        const target = launch.target ?? '';
        upcomingList.innerHTML += `
         <div class="upcoming__bot--item">
           <span class="upcoming__bot--desc" onclick="abortLaunch(${launch.flightNumber})">✖</span> 
           <span class="upcoming__bot--desc">${flightNumber}</span> 
           <span class="upcoming__bot--desc">${launchDate}</span> 
           <span class="upcoming__bot--desc">${mission}</span> 
           <span class="upcoming__bot--desc">${rocket}</span> 
           <span class="upcoming__bot--desc">${target}</span>
         </div>`;
      });
  }
}

function listHistory() {
  const historyList = document.getElementById('history-list');
  if (loadingLaunches) {
    historyList.innerHTML = `
    <div class="loading">
      <div class="loading__wrapper">
        <div class="loading__inner"></div>
        <div class="loading__inner"></div>
      </div>
    </div>`;
    enforceUpdate(loadingLaunches, listHistory, 2000);
  } else {
    historyList.innerHTML = `
    <div class="history__bot--head">
      <span class="history__bot--line">+</span>
      <span class="history__bot--line">${numberHeading}</span>
      <span class="history__bot--line">${dateHeading}</span>
      <span class="history__bot--line">${missionHeading}</span>
      <span class="history__bot--line">${rocketHeading}</span>
      <span class="history__bot--line">${customersHeading}</span>
    </div>`;
    // █ █
    launches
      .filter((launch) => !launch.upcoming)
      .forEach((launch) => {
        const success = launch.success
          ? `<span class="success status-square"></span>`
          : `<span class="failure status-square"></span>`;
        const launchDate = new Date(launch.launchDate * 1000).toDateString();
        const flightNumber = String(launch.flightNumber);
        const mission = chopString(launch.mission);
        const rocket = chopString(launch.rocket);
        const customers = launch.customers.join(', ').slice(0, 19);
        historyList.innerHTML += `
        <div class="history__bot--item">
          <span class="history__bot--desc">${success}</span> 
          <span class="history__bot--desc">${flightNumber}</span> 
          <span class="history__bot--desc">${launchDate}</span> 
          <span class="history__bot--desc">${mission}</span> 
          <span class="history__bot--desc">${rocket}</span>
          <span class="history__bot--desc">${customers}</span> 
        </div>`;
      });
  }
}

function navigate(navigateTo) {
  const pages = ['history', 'upcoming', 'launch'];
  document.getElementById(navigateTo).hidden = false;
  pages
    .filter((page) => page !== navigateTo)
    .forEach((page) => {
      document.getElementById(page).hidden = true;
    });
  document.getElementById('launch-success').hidden = true;

  if (navigateTo === 'upcoming') {
    // loadLaunches();
    listUpcoming();
  } else if (navigateTo === 'history') {
    // loadLaunches();
    listHistory();
  } else {
    // loadPlanets
    listPlanets();
  }
}

window.onload = () => {
  initValues();
  loadLaunches();
  loadPlanets();
  navigate('launch');
};
