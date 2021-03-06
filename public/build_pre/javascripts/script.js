// @ts-nocheck
// styles
import './css/styles.css';

// generator function runtime - e.g. async / await enabler
import 'core-js/stable';
import 'regenerator-runtime/runtime';

let launches = [];
let planets = [];

let url = '';

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

// load proper vid based on screen width
const loadRespectiveVideo = () => {
  const video = document.getElementById('video');
  // const height = window.screen.height;
  const width = window.screen.width;

  if (width > 1024) {
    video.poster = '/images/earth-min-desk.jpg';
    video.innerHTML = `
      <source
        src="./videos/earth-large-compressed-mp4.mp4"
        type="video/mp4"
      />
      <source
        src="./videos/earth-large-compressed-webm.webm"
        type="video/webm"
      />
      <img src="/images/earth-min-desk.jpg" 
        alt="planet earth"  
        title="Your browser does not support the <video> tag"
      />
    `;
  } else if (width >= 720 && width <= 1024) {
    video.poster = '/images/earth-min-tablet.jpg';
    video.innerHTML = `
      <source
        src="./videos/earth-medium-compressed-mp4.mp4"
        type="video/mp4"
      />
      <source
        src="./videos/earth-medium-compressed-webm.webm"
        type="video/webm"
      />
      <img src="/images/earth-min-tablet.jpg" 
        alt="planet earth"  
        title="Your browser does not support the <video> tag"
      />
    `;
  } else if (width < 720) {
    video.poster = '/images/earth-min-mob.jpg';
    video.innerHTML = `
      <source
        src="./videos/earth-small-compressed-mp4.mp4"
        type="video/mp4"
      />
      <source
        src="./videos/earth-small-compressed-webm.webm"
        type="video/webm"
      />
      <img src="/images/earth-min-mob.jpg" 
        alt="planet earth"  
        title="Your browser does not support the <video> tag"
      />
    `;
  }
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

    const res = await fetch(`${url}/api/v1/launches`, {
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

    const res = await fetch(`${url}/api/v1/planets`, {
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
    const res = await fetch(`${url}/api/v1/launches/${flightNumber}`, {
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

    const res = await fetch(`${url}/api/v1/launches`, {
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
    planetSelector.innerHTML = ``;
    planets.forEach((planet) => {
      planetSelector.innerHTML += `
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

        const upcomingBot = document.createElement('div');
        upcomingBot.classList.add('upcoming__bot--item');

        const upcomingAbort = document.createElement('span');
        upcomingAbort.textContent = '✖';
        upcomingAbort.classList.add('upcoming__bot--desc');
        upcomingAbort.addEventListener('click', () =>
          abortLaunch(launch.flightNumber)
        );
        upcomingBot.appendChild(upcomingAbort);

        const upcomingFlightNumber = document.createElement('span');
        upcomingFlightNumber.textContent = flightNumber;
        upcomingFlightNumber.classList.add('upcoming__bot--desc');
        upcomingBot.appendChild(upcomingFlightNumber);

        const upcomingLaunchDate = document.createElement('span');
        upcomingLaunchDate.textContent = launchDate;
        upcomingLaunchDate.classList.add('upcoming__bot--desc');
        upcomingBot.appendChild(upcomingLaunchDate);

        const upcomingMission = document.createElement('span');
        upcomingMission.textContent = mission;
        upcomingMission.classList.add('upcoming__bot--desc');
        upcomingBot.appendChild(upcomingMission);

        const upcomingRocket = document.createElement('span');
        upcomingRocket.textContent = rocket;
        upcomingRocket.classList.add('upcoming__bot--desc');
        upcomingBot.appendChild(upcomingRocket);

        const upcomingTarget = document.createElement('span');
        upcomingTarget.textContent = target;
        upcomingTarget.classList.add('upcoming__bot--desc');
        upcomingBot.appendChild(upcomingTarget);

        upcomingList.appendChild(upcomingBot);
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
    listUpcoming();
  } else if (navigateTo === 'history') {
    listHistory();
  } else {
    listPlanets();
  }
}

const nav1 = document.getElementById('nav1');
const nav2 = document.getElementById('nav2');
const nav3 = document.getElementById('nav3');
const nav4 = document.getElementById('nav4');
const submit = document.getElementById('submit');

nav1.addEventListener('click', () => navigate('launch'));
nav2.addEventListener('click', () => navigate('launch'));
nav3.addEventListener('click', () => navigate('upcoming'));
nav4.addEventListener('click', () => navigate('history'));
submit.addEventListener('click', (e) => submitLaunch(e));

window.onload = () => {
  initValues();
  loadLaunches();
  loadPlanets();
  loadRespectiveVideo();
  navigate('launch');
};
