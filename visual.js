let wakeLock = null;


async function enableWakeLock() {
    try {
        if ("wakeLock" in navigator) {
            wakeLock = await navigator.wakeLock.request("screen");
            console.log("Wake Lock активний");

           
            wakeLock.addEventListener("release", () => {
                console.log("Wake Lock вимкнувся, повторне увімкнення...");
            });
        } else {
            console.log("Wake Lock не підтримується цим браузером");
        }
    } catch (err) {
        console.log("Wake Lock помилка:", err);
    }
}


document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        enableWakeLock();
    }
});


enableWakeLock();

const popup = document.getElementById("donatePopup");
const closeBtn = document.getElementById("closePopup");
const openBtn = document.getElementById("openDonate");
let shown1 = false;
let shown2 = false;
let shown3 = false;
 
openBtn.addEventListener("click", (e) => {
  e.preventDefault();
  popup.classList.remove("hidden");
});


setTimeout(() => {
    if (!shown1) {
        popup.classList.remove("hidden");
        shown1 = true;

        setTimeout(() => {
            popup.classList.add("hidden");
        }, 25000);
    }
}, 45000);


setTimeout(() => {
    if (!shown2) {
        popup.classList.remove("hidden");
        shown2 = true;

        setTimeout(() => {
            popup.classList.add("hidden");
        }, 25000);
    }
}, 60000);


setTimeout(() => {
    if (!shown3) {
        popup.classList.remove("hidden");
        shown3 = true;

        setTimeout(() => {
            popup.classList.add("hidden");
        }, 25000);
    }
}, 300000);

closeBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
});

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Скопійовано");
    });
}

let scale = 1;

let posX = 0;
let posY = 0;

let isDown = false;
let startX = 0;
let startY = 0;

let startPosX = 0; 
let startPosY = 0;
const minScale = 1;
const maxScale = 8;

const mapInner = document.getElementById("mapInner");
const container = document.getElementById("mapContainer");

let isActive = false;
const closeBtnMap = document.getElementById("closeBtn");

let touches = [];
let lastDist = null;



container.ondragstart = () => false; 

container.addEventListener("click", () => {
    if (isActive) return;
  
    isActive = true;
    closeBtnMap.classList.remove("hidden");
  });
  closeBtnMap.addEventListener("click", (e) => {
    e.stopPropagation();
  
    isActive = false;
    closeBtnMap.classList.add("hidden");
  
    scale = 1;
    posX = 0;
    posY = 0;
  
    update();
  });

function update() {
  mapInner.style.transform =
    `translate(${posX}px, ${posY}px) scale(${scale})`;
}

function applyConstrain() {
  const rect = container.getBoundingClientRect();
  const mapWidth = mapInner.offsetWidth * scale;
  const mapHeight = mapInner.offsetHeight * scale;

  if (mapWidth > rect.width) {
      if (posX > 0) posX = 0;
      if (posX < rect.width - mapWidth) posX = rect.width - mapWidth;
  } else {
      posX = (rect.width - mapWidth) / 2;
  }

  if (mapHeight > rect.height) {
      if (posY > 0) posY = 0;
      if (posY < rect.height - mapHeight) posY = rect.height - mapHeight;
  } else {
      posY = (rect.height - mapHeight) / 2;
  }
}

container.addEventListener("mousedown", (e) => {
    if (!isActive || e.button !== 0) return;
    e.preventDefault();
  isDown = true;
  container.style.cursor = "grabbing";

  startX = e.clientX;
  startY = e.clientY;
  
  startPosX = posX;
  startPosY = posY;
});

window.addEventListener("mouseup", () => {
  isDown = false;
  container.style.cursor = "grab";
});

container.addEventListener("mousemove", (e) => {
  if (!isDown || !isActive) return;

  const dx = (e.clientX - startX) / scale;
  const dy = (e.clientY - startY) / scale;
 
  posX = startPosX + dx;
  posY = startPosY + dy;

  constrain();
  update();
});



container.addEventListener("wheel", (e) => {
    if (!isActive) return;
    e.preventDefault();

  const rect = container.getBoundingClientRect();

  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const prevScale = scale;

  const zoomStep = 0.5;

  if (e.deltaY < 0) {
    scale = Math.min(maxScale, scale + zoomStep);
  } else {
    scale = Math.max(minScale, scale - zoomStep);
  }

  const factor = scale / prevScale;

  posX = mx - (mx - posX) * factor;
  posY = my - (my - posY) * factor;

  applyConstrain();
  update();
}, { passive: false });
container.addEventListener("pointerdown", (e) => {
    if (!isActive) return;
    
    touches.push(e);
    
    
    if (touches.length === 1) {
      isDown = true;
      
      startX = e.clientX;
      startY = e.clientY;
     
      startPosX = posX; 
      startPosY = posY;
  }

  if (touches.length === 2) {
      isDown = false;
      lastDist = getDist(touches[0], touches[1]);
  }
  });
  
  container.addEventListener("pointermove", (e) => {
    if (!isActive) return;
    e.preventDefault(); 

   
    const idx = touches.findIndex(t => t.pointerId === e.pointerId);
    
    if (idx > -1) touches[idx] = e;
 


    if (touches.length === 2) {
      e.preventDefault(); 
      const dist = getDist(touches[0], touches[1]);
      if (lastDist) {
          const center = getCenter(touches[0], touches[1]);
          const prevScale = scale;
          scale = Math.max(minScale, Math.min(maxScale, prevScale * (dist / lastDist)));

          const factor = scale / prevScale;
          posX = center.x - (center.x - posX) * factor;
          posY = center.y - (center.y - posY) * factor;
          
          update();
      }
      lastDist = dist;
      return; 
  }

  if (isDown && touches.length === 1) {
     
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

    
      posX = startPosX + dx;
      posY = startPosY + dy;
      
      applyConstrain();
      update();
  }
  });
  function getDist(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getCenter(t1, t2) {
    return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
    };
}
  container.addEventListener("pointerup", (e) => {
    touches = touches.filter(t => t.pointerId !== e.pointerId);
  
    if (touches.length < 2) lastDist = null;
    if (touches.length === 0) isDown = false;
  });
  
  container.addEventListener("pointercancel", () => {
    touches = [];
    isDown = false;
    lastDist = null;
  });
 
  function getDistMap(a, b) {
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  document.getElementById("mapImage").addEventListener("click", (e) => {
    console.log(e.offsetX, e.offsetY);
  });
  
  const x = 546;
  const y = 374;
  
  function updateMap() {
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const offsetX = (screenWidth / 2) - (x * scaleMap);
const offsetY = (screenHeight / 2) - (y * scaleMap);

mapInner.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scaleMap})`;
  };
