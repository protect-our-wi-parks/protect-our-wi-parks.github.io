// ============================================================
// Protect Our WI Parks
// Sections: 1 Screens and paths · 2 Buttons · 3 Plant pages · 4 Photo · 5 Location
//           6 Plant lists · 7 Plant ID · 8 Result · 9 Report · 10 Start
// ============================================================


// ===== 1. Screens and paths =====

// Every screen in the app.
const SCREENS = ["home", "photo", "location", "result", "report"];

// The two paths through the app. Next and Back follow the path you're on.
const PATHS = {
  known: ["home", "location", "report"],                    // you picked the plant from the list
  photo: ["home", "photo", "location", "result", "report"], // you're not sure, so the plant AI helps
};
let path = PATHS.photo;
let currentScreen = "home";

// Show one screen and hide all the others. Some screens need to get ready first.
function showScreen(name) {
  currentScreen = name;
  for (const screen of SCREENS) {
    document.getElementById("screen-" + screen).hidden = (screen !== name);
  }
  showStep(name);
  window.scrollTo(0, 0);
  if (name === "location") showMap();
  if (name === "result") identifyPhoto();
  if (name === "report") updateReportScreen();
}

// Write "Step 1 of 2" at the top of a screen. The front page doesn't count as a step.
function showStep(name) {
  const label = document.querySelector(`#screen-${name} .step`);
  if (label) label.textContent = `Step ${path.indexOf(name)} of ${path.length - 1}`;
}

// Go to the next or the previous screen on the path we're on.
function move(direction) {
  const step = direction === "next" ? 1 : -1;
  showScreen(path.at(path.indexOf(currentScreen) + step) || "home");
}

// Make every button with data-go="next" or data-go="back" move along the path.
function setUpNavButtons() {
  for (const button of document.querySelectorAll("[data-go]")) {
    button.addEventListener("click", () => move(button.dataset.go));
  }
}


// ===== 2. Buttons =====

// Open the About box (how the app works, where data goes, credits).
function openAbout() {
  document.getElementById("about").showModal();
}

// Hook up the buttons that aren't Next or Back.
function setUpButtons() {
  document.getElementById("about-button").addEventListener("click", openAbout);
  document.getElementById("home-about").addEventListener("click", openAbout);
  document.getElementById("open-plant-list").addEventListener("click", () => openList("plant-list"));
  document.getElementById("open-endangered-list").addEventListener("click", () => openList("endangered-list"));
  document.getElementById("photo-start").addEventListener("click", startPhotoPath);
  document.getElementById("retry-button").addEventListener("click", identifyPhoto);
  document.getElementById("gps-button").addEventListener("click", findMe);
  document.getElementById("copy-button").addEventListener("click", copyDetails);
  document.getElementById("start-over").addEventListener("click", startOver);
  document.getElementById("sheet-report").addEventListener("click", reportShownPlant);
  document.getElementById("plant-sheet").addEventListener("click", closeWhenTappedOutside);
}


// ===== 3. Plant pages (invasive and endangered) =====

// What the colored label on each plant says.
const BADGE_WORDS = {
  prohibited: "🚨 Prohibited: report it right away",
  restricted: "Restricted",
  "depends-on-county": "Prohibited or restricted, depending on the county",
  "not-regulated": "Invasive, but not regulated by state law",
  mixed: "A group of look-alike plants: see each kind below",
  endangered: "🌸 Endangered: protected by Wisconsin law",
  threatened: "🌸 Threatened: protected by Wisconsin law",
};

// The warning on every endangered or threatened plant.
const PROTECTED_WARNING = "Don't pick it or dig it up. It's protected by law.";

// Endangered and threatened plants are protected by Wisconsin law.
function isProtected(plant) {
  return ["endangered", "threatened"].includes(plant.category);
}

// The short label next to each kind of plant in a group.
const STATUS_WORDS = {
  prohibited: "prohibited",
  restricted: "restricted",
  "depends-on-county": "depends on county",
  "not-regulated": "not regulated",
};

// Groups of look-alike plants (like bush honeysuckles) from invasive-plants.json. Each group gets one card.
let plantGroups = [];

// The plants in a group, looked up by their scientific names.
function groupMembers(group) {
  return group.members.map((name) => invasivePlants.find((plant) => plant.scientificName === name));
}

// A plant's category, or for a group: the category all its kinds share, or "mixed" if they differ.
function categoryOf(item) {
  if (!item.members) return item.category;
  const categories = new Set(groupMembers(item).map((plant) => plant.category));
  return categories.size === 1 ? [...categories][0] : "mixed";
}

// Make a photo tile for each plant that has a frontPage number, in that order, and credit each photo
// in the About box. The first 5 photos also go on the front-page button as small circles.
function showTiles(items, gridId, photosId) {
  const front = items.filter((item) => item.frontPage).sort((a, b) => a.frontPage - b.frontPage);
  for (const plant of front) {
    document.getElementById(gridId).append(plantTile(plant));
    creditPhoto(plant);
  }
  for (const plant of front.slice(0, 5)) addText(document.getElementById(photosId), "img", "").src = plant.photo;
}

// Open a plant page ("plant-list" for invasive plants, "endangered-list" for endangered plants).
function openList(id) {
  document.getElementById(id).showModal();
  document.getElementById(id).scrollTop = 0;
}

// Build one small tile: a photo and the name. Tapping it opens the plant's pop-out card.
function plantTile(plant) {
  const tile = document.createElement("button");
  const kinds = plant.members ? groupMembers(plant) : [plant];
  tile.className = "plant-tile " + categoryOf(plant);
  if (kinds.some((kind) => kind.category === "prohibited")) tile.classList.add("prohibited"); // red border
  const photo = addText(tile, "img", "");
  photo.src = plant.photo;
  photo.alt = ""; // the name under the photo already says what it is
  addText(tile, "span", plant.commonName);
  if (plant.warning) addText(tile, "span", "⚠️", "tile-warning").title = "Don't touch";
  tile.addEventListener("click", () => openPlantCard(plant));
  return tile;
}

// The plant whose pop-out card is open.
let shownPlant = null;

// Open the pop-out card: big photo, label, any warning, how to spot it, and why it matters.
function openPlantCard(plant) {
  shownPlant = plant;
  const body = document.getElementById("sheet-content");
  body.replaceChildren();
  const photo = addText(body, "img", "");
  photo.src = plant.photo;
  photo.alt = "Photo of " + plant.commonName;
  const name = addText(body, "h2", plant.commonName);
  if (plant.scientificName) addText(body, "p", plant.scientificName, "science-name");
  addText(body, "p", BADGE_WORDS[categoryOf(plant)], "badge " + categoryOf(plant));
  if (isProtected(plant)) addText(body, "p", "🚫 " + PROTECTED_WARNING, "warning");
  if (plant.warning) addText(body, "p", "⚠️ " + plant.warning, "warning");
  addText(addText(body, "p", ""), "strong", "Look for: ").after(plant.lookFor);
  addText(addText(body, "p", ""), "strong", isProtected(plant) ? "Why it needs help: " : "Why it's a problem: ").after(plant.why);
  if (plant.members) listKinds(body, plant);
  else addMoreInfoLink(body, plant);
  const sheet = document.getElementById("plant-sheet");
  sheet.showModal();
  name.tabIndex = -1;
  name.focus(); // start at the top (the photo and name), not at the first button
  sheet.scrollTop = 0;
}

// On a group's card: list each kind with its label and its own "more info" link.
function listKinds(body, group) {
  addText(body, "h3", "Kinds in this group");
  const list = addText(body, "ul", "", "kinds");
  for (const kind of groupMembers(group)) {
    const item = addText(list, "li", "");
    addText(item, "strong", kind.commonName);
    item.append(` (${kind.scientificName}), ${STATUS_WORDS[kind.category]}. `);
    addMoreInfoLink(item, kind);
  }
}

// Add the "more about it" link: the DNR page if there is one, or another trusted source.
function addMoreInfoLink(parent, plant) {
  if (plant.dnrPage) addLink(parent, "More about it on the DNR website", plant.dnrPage);
  else if (plant.infoPage) addLink(parent, `More about it from ${plant.infoSource}`, plant.infoPage);
}

// "I found this" on the pop-out card: close the card and the plant page, and start the report.
function reportShownPlant() {
  document.getElementById("plant-sheet").close();
  document.getElementById("plant-list").close();
  document.getElementById("endangered-list").close();
  startKnownPath(shownPlant);
}

// Tapping the dark area outside the pop-out card closes it.
function closeWhenTappedOutside(event) {
  if (event.target === event.currentTarget) event.currentTarget.close();
}

// Add a link that opens in a new tab, so the app stays open.
function addLink(parent, words, address) {
  const link = addText(parent, "a", words);
  link.href = address;
  link.target = "_blank";
  link.rel = "noopener";
  return link;
}

// List a plant's photo credit in the About box.
function creditPhoto(plant) {
  addLink(addText(document.getElementById("credits"), "li", plant.commonName + " photo: "), plant.photoCredit, plant.photoCreditUrl);
}

// "I found this": the person knows the plant for sure, so we skip the photo and the plant AI.
function startKnownPath(plant) {
  clearAnswers();
  path = PATHS.known;
  decision = { kind: "known", guess: null, plant };
  showScreen("location");
}

// "Not sure? Take a photo": the plant AI will help.
function startPhotoPath() {
  clearAnswers();
  path = PATHS.photo;
  showScreen("photo");
}


// ===== 4. Photo =====

// The photo the user picked. We keep it so we can send it to the plant AI.
let photoFile = null;

// Change the tip above the photo.
function showPhotoTip(text) {
  document.getElementById("photo-tip").textContent = text;
}

// When a photo is picked: check it's a picture, save it, show it, and show the Next button.
function usePhoto(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showPhotoTip("That doesn't look like a photo. Please try again.");
    return;
  }
  photoFile = file;
  const preview = document.getElementById("photo-preview");
  if (preview.src) URL.revokeObjectURL(preview.src);
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  showPhotoTip("Looks good! Tap Next. (Blurry? Take another one.)");
  document.getElementById("photo-camera-label").className = "small"; // Next becomes the main button
  document.getElementById("photo-next").hidden = false;
  readPhotoLocation(file);
}

// Listen to both photo buttons (camera and photo library).
function setUpPhotoButtons() {
  for (const id of ["photo-camera", "photo-gallery"]) {
    const input = document.getElementById(id);
    input.addEventListener("change", () => {
      usePhoto(input.files[0]);
      input.value = ""; // so picking the same photo again still works
    });
  }
}


// ===== 5. Location =====

// Where the plant is: { lat, lon, source }. Empty until we know.
let plantLocation = null;

// The map and the pin on it. We make them the first time the Location screen opens.
let map = null;
let pin = null;

// The middle of Wisconsin, so the map starts somewhere useful.
const WISCONSIN_CENTER = [44.6, -89.9];

// The words we show for each way of finding the location.
const LOCATION_WORDS = {
  gps: "📍 Found you with GPS!",
  photo: "📷 Found the spot saved in your photo!",
  map: "🗺️ Pin dropped where you tapped.",
};

// The same thing in short words, for the report details at the end.
const LOCATION_SOURCE_WORDS = {
  gps: "from phone GPS",
  photo: "from GPS saved in the photo",
  map: "picked on a map",
};

// Change the tip above the map.
function showLocationTip(text) {
  document.getElementById("location-tip").textContent = text;
}

// Make the map the first time it's needed. If the map library didn't load (no internet), say so.
function showMap() {
  if (map) {
    map.invalidateSize(); // the map was hidden, so let it re-measure the screen
    return;
  }
  if (!window.L) {
    if (!plantLocation) showLocationTip('The map needs internet. Tap "Find me" instead.');
    return;
  }
  map = L.map("map").setView(WISCONSIN_CENTER, 6);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  map.on("click", (event) => setLocation(event.latlng.lat, event.latlng.lng, "map"));
  if (plantLocation) setLocation(plantLocation.lat, plantLocation.lon, plantLocation.source);
}

// Save where the plant is, put a pin on the map, and show the Next button.
function setLocation(lat, lon, source) {
  // 5 decimal places is about 1 meter: plenty for DNR to find the plant.
  plantLocation = { lat: Number(lat.toFixed(5)), lon: Number(lon.toFixed(5)), source };
  showLocationTip(LOCATION_WORDS[source] + " Wrong spot? Tap the map to move the pin. Then tap Next.");
  if (map) {
    if (pin) pin.setLatLng([lat, lon]);
    else pin = L.circleMarker([lat, lon], { radius: 12, color: "#b71c1c", fillOpacity: 0.8 }).addTo(map);
    // Zoom in close, unless the user is already zoomed in and just moving the pin.
    if (source !== "map" || map.getZoom() < 14) map.setView([lat, lon], 16);
  }
  document.getElementById("gps-button").className = "small"; // Next becomes the main button
  document.getElementById("location-next").hidden = false;
}

// Ask the phone's GPS where we are. The phone asks the user to allow it first.
function findMe() {
  if (!window.isSecureContext || !navigator.geolocation) {
    showLocationTip("GPS only works on a secure (https) page. Tap the map instead.");
    return;
  }
  showLocationTip("Looking for you…");
  navigator.geolocation.getCurrentPosition(
    (position) => setLocation(position.coords.latitude, position.coords.longitude, "gps"),
    (error) => showLocationTip(gpsErrorWords(error)),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
}

// Turn a GPS error into plain words.
function gpsErrorWords(error) {
  if (error.code === error.PERMISSION_DENIED) return "Location is turned off. Tap the map where the plant is.";
  if (error.code === error.TIMEOUT) return "GPS is taking too long. Try again, or tap the map.";
  return "Couldn't find you. Tap the map where the plant is.";
}

// Look for GPS info saved inside the photo. Many phones remove it, so often there is none.
async function readPhotoLocation(file) {
  if (!window.exifr) return;
  try {
    const gps = await exifr.gps(file);
    if (gps && Number.isFinite(gps.latitude) && Number.isFinite(gps.longitude)) {
      setLocation(gps.latitude, gps.longitude, "photo");
    }
  } catch {
    // No readable GPS in this photo. That's fine: the user can use "Find me" or the map.
  }
}


// ===== 6. Plant lists =====

// The Wisconsin invasive plant list from invasive-plants.json. Empty (null) until it loads.
let invasivePlants = null;

// Load the invasive plant list from our JSON file, then show the front-page cards.
async function loadInvasiveList() {
  try {
    const response = await fetch("invasive-plants.json", { cache: "no-cache" }); // always check for a newer list
    const list = await response.json();
    invasivePlants = list.plants;
    plantGroups = list.groups || [];
    showTiles([...invasivePlants, ...plantGroups], "plant-grid", "choice-photos");
  } catch {
    invasivePlants = null; // the result screen will say we couldn't check the list
    document.getElementById("plant-grid").textContent = "😕 Couldn't load the plant list. Check the internet and reload the page.";
  }
}

// The Wisconsin endangered and threatened plant list from endangered-plants.json. Empty (null) until it loads.
let endangeredPlants = null;

// Load the endangered plant list from our JSON file, then show its plant tiles.
async function loadEndangeredList() {
  try {
    const response = await fetch("endangered-plants.json", { cache: "no-cache" }); // always check for a newer list
    endangeredPlants = (await response.json()).plants;
    showTiles(endangeredPlants, "endangered-grid", "endangered-photos");
  } catch {
    endangeredPlants = null; // the result screen will say we couldn't check the list
    document.getElementById("endangered-grid").textContent = "😕 Couldn't load the plant list. Check the internet and reload the page.";
  }
}

// Shrink a scientific name to just "genus species" in small letters, so names match even when
// they're written differently. "Lonicera × bella Zabel" and "lonicera x bella" both become "lonicera bella".
function shortName(name) {
  const words = String(name || "").toLowerCase().replace(/×/g, " ").split(/\s+/);
  return words.filter((word) => word && word !== "x").slice(0, 2).join(" ");
}

// Look up a scientific name in one plant list (also checking old names). Returns the plant, or null.
function findIn(list, scientificName) {
  const wanted = shortName(scientificName);
  if (!wanted.includes(" ") || !list) return null; // need both genus and species
  const isMatch = (plant) => [plant.scientificName, ...plant.otherNames].some((name) => shortName(name) === wanted);
  return list.find(isMatch) || null;
}

// Look up a scientific name in both lists: the invasive list, then the endangered list.
function findPlant(scientificName) {
  return findIn(invasivePlants, scientificName) || findIn(endangeredPlants, scientificName);
}


// ===== 7. Plant ID (Pl@ntNet, through our plant helper) =====

// Our plant helper on Cloudflare. It holds the secret Pl@ntNet key, so the app never needs it.
// If you set up your own helper (see README), put its address here.
const HELPER_URL = "https://plant-helper.wi-invasive-plants.workers.dev";

// Below this, we say the AI "isn't sure". 0.2 means 20% sure.
const LOW_CONFIDENCE = 0.2;

// The AI's top guesses: [{ scientificName, commonName, score }]. "guessesFor" is the photo they belong to.
let guesses = null;
let guessesFor = null;
let asking = false;

// Make the photo smaller and turn it into a JPG, so it uploads fast. Pl@ntNet only takes JPG and PNG.
async function shrinkPhoto(file) {
  try {
    const picture = await createImageBitmap(file);
    const scale = Math.min(1, 1280 / Math.max(picture.width, picture.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(picture.width * scale);
    canvas.height = Math.round(picture.height * scale);
    canvas.getContext("2d").drawImage(picture, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  } catch {
    return file; // couldn't shrink it, so send the original
  }
}

// Send the photo to our plant helper (which asks Pl@ntNet) and get back the top 3 guesses.
async function askPlantHelper(file) {
  const form = new FormData();
  form.append("images", await shrinkPhoto(file), "plant.jpg");
  form.append("organs", "auto");
  const response = await fetch(HELPER_URL, { method: "POST", body: form });
  if (response.status === 404) return []; // Pl@ntNet says 404 when it finds no plant in the photo
  if (!response.ok) throw Object.assign(new Error("Pl@ntNet error"), { status: response.status });
  const answer = await response.json();
  return answer.results.slice(0, 3).map(simpleGuess);
}

// Keep just the parts of a Pl@ntNet answer we need.
function simpleGuess(result) {
  const name = result.species.scientificNameWithoutAuthor;
  return { scientificName: name, commonName: result.species.commonNames[0] || name, score: result.score };
}

// Turn a plant AI problem into plain words.
function plantIdErrorWords(error) {
  if (error.status === 403) return `This website isn't allowed to use the plant helper yet. An adult needs to add "${location.origin}" to ALLOWED_SITES (see README).`;
  if (error.status === 401 || error.status === 500) return "The plant helper's key isn't working. An adult needs to check it (see README).";
  if (error.status === 429) return "We used up today's free plant checks. Try again tomorrow. If you know the plant, go back and pick it from the list.";
  if (error.status === 400 || error.status === 413 || error.status === 415) return "The AI couldn't read this photo. Go back and try a different photo.";
  if (!navigator.onLine) return "No internet. The plant AI needs internet. If you know the plant, go back and pick it from the list.";
  return "The plant AI isn't answering right now. Tap Try again in a minute.";
}

// Ask the AI about the photo (unless we already know the answer), then show the result.
async function identifyPhoto() {
  if (guessesFor === photoFile) return showResult(); // already have the answer for this photo
  if (asking) return;
  if (HELPER_URL.includes("USERNAME")) {
    return showResultProblem("The plant helper isn't set up yet (see README). If you know the plant, go back and pick it from the list.");
  }
  hideResult();
  showResultTip("🔎 Asking the plant AI… this takes a few seconds.");
  asking = true;
  const askedFor = photoFile;
  try {
    const answer = await askPlantHelper(askedFor);
    guesses = answer;
    guessesFor = askedFor;
    if (askedFor === photoFile) showResult();
  } catch (error) {
    const adultNeeded = [401, 403, 500].includes(error.status); // trying again won't fix these
    showResultProblem(plantIdErrorWords(error), !adultNeeded);
  } finally {
    asking = false;
  }
}


// ===== 8. Result =====

// What we know about the plant: { kind, guess, plant }. The report screen uses this.
// kind is "known" (picked from a list), or the AI's answer: "invasive", "endangered", "not-listed", "not-sure" or "no-list".
let decision = null;

// What each list category means, in plain words.
const CATEGORY_WORDS = {
  prohibited: "PROHIBITED in Wisconsin. It's not common here yet, so telling the DNR about it really matters!",
  restricted: "RESTRICTED in Wisconsin. It's already found in parts of the state.",
  "depends-on-county": "Prohibited or restricted in Wisconsin, depending on the county.",
  "not-regulated": "Invasive, but NOT regulated by Wisconsin law, so the DNR may not track it.",
  endangered: "ENDANGERED in Wisconsin: very few are left. It's protected by law.",
  threatened: "THREATENED in Wisconsin: it could become endangered. It's protected by law.",
};

// Change the tip at the top of the result screen.
function showResultTip(text) {
  document.getElementById("result-tip").textContent = text;
}

// Hide the old answer and buttons while we work on a new one.
function hideResult() {
  for (const id of ["result-card", "guesses-box", "result-next", "retry-button"]) {
    document.getElementById(id).hidden = true;
  }
}

// Show a problem (like no internet), and a Try again button if trying again could help.
function showResultProblem(text, canRetry) {
  hideResult();
  showResultTip("😕 " + text);
  document.getElementById("retry-button").hidden = !canRetry;
}

// Make a new piece of the page with some text in it, and add it to a parent.
function addText(parent, tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

// Turn a score like 0.873 into words like "87%".
function percent(score) {
  return score < 0.01 ? "less than 1%" : Math.round(score * 100) + "%";
}

// Decide what to tell the user (the AI must be at least a little sure):
// - Endangered: only if it's the AI's BEST guess. Many common plants look like rare ones
//   (like common milkweed and prairie milkweed), so we don't want false alarms.
// - Invasive: if ANY of the top guesses is on the list. Better safe than sorry.
function decide(guesses) {
  if (!invasivePlants || !endangeredPlants) return { kind: "no-list", guess: guesses[0] || null, plant: null };
  const best = guesses[0];
  const endangered = best && best.score >= LOW_CONFIDENCE && findIn(endangeredPlants, best.scientificName);
  if (endangered) return { kind: "endangered", guess: best, plant: endangered };
  const invasiveGuess = guesses.find((guess) => guess.score >= LOW_CONFIDENCE && findIn(invasivePlants, guess.scientificName));
  if (invasiveGuess) return { kind: "invasive", guess: invasiveGuess, plant: findIn(invasivePlants, invasiveGuess.scientificName) };
  if (guesses.length && guesses[0].score >= LOW_CONFIDENCE) return { kind: "not-listed", guess: guesses[0], plant: null };
  return { kind: "not-sure", guess: guesses[0] || null, plant: null };
}

// Show the big answer card and the list of guesses.
function showResult() {
  hideResult();
  decision = decide(guesses);
  const card = document.getElementById("result-card");
  card.replaceChildren();
  card.className = "card " + decision.kind;
  if (decision.kind === "invasive") fillInvasiveCard(card, decision);
  else if (decision.kind === "endangered") fillEndangeredCard(card, decision);
  else fillOtherCard(card, decision);
  card.hidden = false;
  showGuesses();
  const next = document.getElementById("result-next");
  next.hidden = false;
  showResultTip("Read the card, then tap Next: Report it.");
}

// Fill the card for a possible invasive plant.
function fillInvasiveCard(card, { guess, plant }) {
  addText(card, "h3", "⚠️ Possible invasive plant!");
  addText(card, "p", plant.commonName, "plant-name");
  addText(card, "p", plant.scientificName, "science-name");
  if (plant.warning) addText(card, "p", "⚠️ " + plant.warning, "warning");
  addText(card, "p", CATEGORY_WORDS[plant.category]);
  addText(card, "p", "Why it's a problem: " + plant.why);
  addText(card, "p", `The AI is ${percent(guess.score)} sure. It can be wrong, so the DNR makes the final call.`, "hint");
}

// Fill the card for a possible endangered or threatened plant.
function fillEndangeredCard(card, { guess, plant }) {
  addText(card, "h3", `🌸 Possible ${plant.category} plant!`);
  addText(card, "p", plant.commonName, "plant-name");
  addText(card, "p", plant.scientificName, "science-name");
  addText(card, "p", "🚫 " + PROTECTED_WARNING, "warning");
  addText(card, "p", CATEGORY_WORDS[plant.category]);
  addText(card, "p", "Planted in a garden? Then you don't need to report it. The DNR wants to know about wild ones.", "hint");
  addText(card, "p", `The AI is ${percent(guess.score)} sure. It can be wrong, so the DNR makes the final call.`, "hint");
}

// Fill the card when it's not on the list, the AI isn't sure, or we couldn't check the list.
function fillOtherCard(card, { kind, guess }) {
  const titles = {
    "not-listed": "✅ Not on our invasive or endangered lists",
    "not-sure": "🤔 The AI isn't sure",
    "no-list": "😕 We couldn't check our plant lists",
  };
  addText(card, "h3", titles[kind]);
  if (!guess) {
    addText(card, "p", "The AI couldn't find a plant in this photo. Go back and try a closer photo of the leaves or flowers.");
  } else {
    addText(card, "p", `Its best guess is ${guess.commonName} (${guess.scientificName}), ${percent(guess.score)} sure.`);
    if (kind === "not-listed") addText(card, "p", "That plant isn't on our lists of Wisconsin invasive or endangered plants.");
    if (kind === "not-sure") addText(card, "p", "That's a low score. A closer photo of the leaves or flowers can help.");
  }
  addText(card, "p", "Still think it's invasive or endangered? You can report it anyway.", "hint");
}

// Show the AI's top guesses, each with a bar showing how sure it is.
function showGuesses() {
  const list = document.getElementById("guesses");
  list.replaceChildren();
  for (const guess of guesses) {
    const item = document.createElement("li");
    addText(item, "span", guess.commonName, "guess-name");
    const listed = findPlant(guess.scientificName);
    if (listed) addText(item, "span", isProtected(listed) ? "Endangered list" : "Invasive list", "tag " + (isProtected(listed) ? "protected" : ""));
    addText(item, "span", guess.scientificName, "science-name");
    const bar = addText(item, "span", "", "bar");
    addText(bar, "span", "").style.width = Math.max(2, Math.round(guess.score * 100)) + "%";
    addText(item, "span", percent(guess.score) + " sure", "hint");
    list.append(item);
  }
  document.getElementById("guesses-box").hidden = guesses.length === 0;
}


// ===== 9. Report =====

// The DNR's main pages about invasive species and endangered plants, for plants without their own page.
const DNR_INVASIVES_PAGE = "https://dnr.wisconsin.gov/topic/Invasives";
const DNR_ENDANGERED_PAGE = "https://dnr.wisconsin.gov/topic/EndangeredResources/ETList";

// Where to report: the DNR's invasive species page, or the DNR's rare species form for endangered plants.
const INVASIVE_REPORT_PAGE = "https://dnr.wisconsin.gov/topic/Invasives/report";
const ENDANGERED_REPORT_FORM = "https://survey123.arcgis.com/share/f57cba58511a4c99b1d1292776b05125";

// Is this report about an endangered or threatened plant? Then its spot stays secret.
function isSecretSpot() {
  return Boolean(decision && decision.plant && isProtected(decision.plant));
}

// Fill in the report screen: how sure we are, the details to copy, the map link, and the right DNR pages.
function updateReportScreen() {
  document.getElementById("report-tip").textContent = reportTip();
  document.getElementById("secret-note").hidden = !isSecretSpot();
  document.getElementById("report-details").textContent = reportDetails();
  document.getElementById("spot-map").hidden = isSecretSpot(); // no map link for endangered plants
  if (plantLocation) document.getElementById("spot-map").href = mapLink();
  document.getElementById("report-link").href = isSecretSpot() ? ENDANGERED_REPORT_FORM : INVASIVE_REPORT_PAGE;
  showLearnLink(decision && decision.plant);
}

// The "Learn about…" link: the plant's own page, or the DNR's main page for its kind of plant.
function showLearnLink(plant) {
  const link = document.getElementById("dnr-link");
  const ownPage = plant && !plant.members && (plant.dnrPage || plant.infoPage);
  const endangered = plant && isProtected(plant);
  link.href = ownPage || (endangered ? DNR_ENDANGERED_PAGE : DNR_INVASIVES_PAGE);
  link.textContent = !ownPage ? `🌐 Learn about ${endangered ? "endangered" : "invasive"} plants on the DNR website`
    : plant.dnrPage ? `🌐 Learn about ${plant.commonName} on the DNR website`
    : `🌐 Learn about ${plant.commonName} (${plant.infoSource})`;
}

// One sentence that says how sure we are about the plant.
function reportTip() {
  const { kind, guess, plant } = decision || {};
  const notTracked = plant && categoryOf(plant) === "not-regulated"
    ? " This plant isn't regulated by state law, so the DNR may not track it. You can also tell whoever takes care of the land." : "";
  const thanks = isProtected(plant || {}) ? "Thanks for helping protect it!" : "Thanks for watching out!";
  if (kind === "known") return `You picked ${plant.commonName} from the list. ${thanks}` + notTracked;
  if (plant) return `The AI thinks this may be ${plant.commonName} (${percent(guess.score)} sure). The DNR will check.` + notTracked;
  return "The AI didn't match this to our lists. If you still think it's invasive, you can report it anyway.";
}

// The plant's name for the report, like "Garlic mustard (Alliaria petiolata)". A group lists all its kinds.
function plantNameForReport(plant) {
  if (!plant.members) return `${plant.commonName} (${plant.scientificName})`;
  return `${plant.commonName}, one of: ` + groupMembers(plant).map((kind) => `${kind.commonName} (${kind.scientificName})`).join(", ");
}

// The details to copy into a DNR report: the plant, how we know, where it is, and the date.
function reportDetails() {
  const { kind, guess, plant } = decision || {};
  const name = plant ? plantNameForReport(plant) : guess ? `Not sure. AI's best guess: ${guess.commonName} (${guess.scientificName})` : "Not sure";
  const how = kind === "known" ? "I recognized it" : guess ? `Pl@ntNet AI guess, ${percent(guess.score)} sure` : "The AI couldn't tell";
  const kindOfPlant = isSecretSpot() ? plant.category : "invasive";
  const lines = [`Possible ${kindOfPlant} plant: ${name}`, "How I know: " + how];
  if (plantLocation) {
    const { lat, lon, source } = plantLocation;
    lines.push(`Where: ${lat.toFixed(5)}, ${lon.toFixed(5)} (${LOCATION_SOURCE_WORDS[source]})`);
    if (!isSecretSpot()) lines.push("Map: " + mapLink()); // endangered plant spots stay secret
  }
  lines.push("Date: " + new Date().toLocaleDateString("en-US", { dateStyle: "medium" }));
  return lines.join("\n");
}

// A link to the plant's spot on OpenStreetMap.
function mapLink() {
  const { lat, lon } = plantLocation;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
}

// Copy the details so they can be pasted into the DNR's report.
async function copyDetails() {
  const button = document.getElementById("copy-button");
  try {
    await navigator.clipboard.writeText(reportDetails());
    button.textContent = "✅ Copied!";
  } catch {
    button.textContent = "Press and hold the details to copy them";
  }
  setTimeout(() => (button.textContent = "📋 Copy details"), 3000);
}


// ===== 10. Start =====

// The first tips on the photo and map screens, saved when the app opens so they can be put back.
const FIRST_TIPS = {};

// Forget the last plant: photo, location, and answers. (No page reload, so this works without internet.)
function clearAnswers() {
  photoFile = guesses = guessesFor = plantLocation = decision = null;
  if (pin) pin.remove();
  pin = null;
  if (map) map.setView(WISCONSIN_CENTER, 6);
  document.getElementById("photo-preview").hidden = true;
  document.getElementById("photo-next").hidden = true;
  document.getElementById("location-next").hidden = true;
  document.getElementById("photo-camera-label").className = "big";
  document.getElementById("gps-button").className = "big";
  for (const id in FIRST_TIPS) document.getElementById(id).innerHTML = FIRST_TIPS[id];
}

// "Check another plant": clear everything and go back to the front page.
function startOver() {
  clearAnswers();
  showScreen("home");
}

// Get the app ready when the page loads.
function start() {
  for (const id of ["photo-tip", "location-tip"]) FIRST_TIPS[id] = document.getElementById(id).innerHTML;
  setUpNavButtons();
  setUpButtons();
  setUpPhotoButtons();
  loadInvasiveList();
  loadEndangeredList();
  showScreen("home");
}

start();
