console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs = [];
let currFolder = '';

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let response = await fetch(`/${folder}/`);
  let text = await response.text();
  let div = document.createElement("div");
  div.innerHTML = text;
  let links = div.getElementsByTagName("a");

  songs = Array.from(links)
    .filter(link => link.href.endsWith(".mp3"))
    .map(link => link.href.split(`/${folder}/`)[1]);

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = songs.map(song => `
    <li>
      <img class="invert" width="34" src="img/music.svg" alt="music icon">
      <div class="info">
        <div>${song.replaceAll("%20", " ")}</div>
        <div>Harry</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="img/play.svg" alt="play icon">
      </div>
    </li>`).join("");

  Array.from(songUL.getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", () => playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()));
  });
}

function playMusic(track, pause = false) {
  currentSong.src = `/${currFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    document.getElementById("play").src = "img/pause.svg";
  } else {
    currentSong.pause();
    document.getElementById("play").src = "img/play.svg";
  }
  
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / " + secondsToMinutesSeconds(currentSong.duration);
}

async function displayAlbums() {
  let response = await fetch("/songs/");
  let text = await response.text();
  let div = document.createElement("div");
  div.innerHTML = text;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  for (let anchor of anchors) {
    if (anchor.href.includes("/songs") && !anchor.href.includes(".htaccess")) {
      let folder = anchor.href.split("/").slice(-2)[0];
      let folderInfo = await fetch(`/songs/${folder}/info.json`);
      let metadata = await folderInfo.json();
      
      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </div>
          <img src="/songs/${folder}/cover.jpg" alt="album cover">
          <h2>${metadata.title}</h2>
          <p>${metadata.description}</p>
        </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async () => {
      songs = await getSongs(`songs/${e.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  await displayAlbums();

  document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      document.getElementById("play").src = "img/pause.svg";
    } else {
      currentSong.pause();
      document.getElementById("play").src = "img/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
  });
}

main();

