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

// render success/error note
const renderNote = (text, success, time) => {
  const launchNote = document.getElementById('launch-success');

  const div = document.createElement('div');

  div.textContent = text;
  div.classList.add(success ? 'success' : 'failure');
  launchNote.appendChild(div);

  setTimeout(() => {
    div.classList.remove(success ? 'success' : 'failure');
    launchNote.removeChild(div);
  }, time);
};

function initValues() {
  const today = new Date().toISOString().split('T')[0];
  const launchDaySelector = document.getElementById('launch-day');
  launchDaySelector.setAttribute('min', today);
  launchDaySelector.setAttribute('value', today);
}

async function loadLaunches() {
  try {
    // is loading
    loadingLaunches = true;
    // console.log(loadingLaunches, 'launches');

    const res = await fetch('/api/v1/launches', {
      method: 'GET',
    });

    if (!res.ok) throw new Error('Server respond with status FAIL.');

    const data = await res.json();
    // console.log(data);
    launches = data;

    // render success notification
    renderNote('Exoplanets are successfuly loaded.', true, 10000);

    // is loaded
    loadingLaunches = false;
  } catch (err) {
    // render failure notification
    renderNote(`Something is not quite right...\n${err.message}`, false, 10000);

    // is loaded
    loadingLaunches = false;
  }
}

async function loadPlanets() {
  try {
    loadingPlanets = true;

    const res = await fetch('/api/v1/planets', {
      method: 'GET',
    });

    if (!res.ok) throw new Error('Server respond with status FAIL.');

    const data = await res.json();
    // console.log(data);
    planets = data;

    // render success notification
    renderNote('Launches are successfuly loaded.', true, 10000);

    // is loaded
    loadingPlanets = false;
  } catch (err) {
    // render failure notification
    renderNote(`Something is not quite right...\n${err.message}`, false, 10000);

    // is loaded
    loadingPlanets = false;
  }
}

async function abortLaunch(flightNumber) {
  try {
    const res = await fetch(`/api/v1/launches/${flightNumber}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flightNumber,
        upcoming: false,
        success: false,
      }),
    });

    if (!res.ok) throw new Error('Server respond with status FAIL.');

    await loadLaunches();

    listUpcoming();

    // render success notification
    renderNote(`Launch ${flightNumber} was successfuly aborted.`, true, 10000);
  } catch (err) {
    // render failure notification
    renderNote(`Something is not quite right...\n${err.message}`, false, 10000);

    // is loaded
    loadingPlanets = false;
  }
}

async function submitLaunch(e) {
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

  const newLaunch = {
    flightNumber,
    mission,
    rocket,
    launchDate: launchDate / 1000,
    upcoming: true,
    target,
    customers,
  };

  try {
    // loading
    loadingLaunches = true;

    const res = await fetch('/api/v1/launches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLaunch),
    });

    if (!res.ok) throw new Error('Server respond with status FAIL.');
    const data = await res.json();
    launches.push(data);

    // render success notification
    renderNote(
      'Congratulations! Interstellar launch is scheduled.',
      true,
      10000
    );

    // is loaded
    loadingLaunches = false;
  } catch (err) {
    // render failure notification
    renderNote(`Something is not quite right...\n${err.message}`, false, 10000);

    // is loaded
    loadingLaunches = false;
  }
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
          ? `<span class="status-square positive"></span>`
          : `<span class="status-square negative"></span>`;
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

  if (navigateTo === 'upcoming') {
    // loadLaunches();
    // document.getElementById('launch-success').hidden = true;
    listUpcoming();
  } else if (navigateTo === 'history') {
    // loadLaunches();
    // document.getElementById('launch-success').hidden = true;
    listHistory();
  } else {
    // loadPlanets
    // document.getElementById('launch-success').hidden = false;
    listPlanets();
  }
}

window.onload = () => {
  initValues();
  loadLaunches();
  loadPlanets();
  navigate('launch');
};
