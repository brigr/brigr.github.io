console.clear();

let wakeButtonName = 'off';
let isSupported = false;
let waitLock = null;

const statusElem = document.getElementById('acquirestat');
const wakeButton = document.getElementById('wakebutton');
const reaquireCheck = document.getElementById('reacquire');

// change button and status if wakelock becomes aquired or is released
const changeUI = (status = 'acquired') => {
  const acquired = status === 'acquired';
  wakeButtonName = acquired ? 'on' : 'off';
  wakeButton.value = `Turn Wake Lock ${acquired ? 'OFF' : 'ON'}`;
  statusElem.textContent = `Wake Lock ${acquired ? 'is active!' : 'has been released.'}`;
}

// create a reference for the wake lock
if ('wakeLock' in navigator) {
  isSupported = true;
  statusElem.textContent = 'Screen Wake Lock API supported 🎉';
} else {
  wakeButton.disabled = true;
  statusElem.textContent = 'Wake lock is not supported by this browser.';
}

if (isSupported) {
  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request('screen');

      // change up our interface to reflect wake lock active
      changeUI();

      // listen for our release event
      wakeLock.onrelease = function(ev) {
        console.log(ev);
      }
      wakeLock.addEventListener('release', () => {
        // if wake lock is released alter the button accordingly
        changeUI('released');
      });

    } catch (err) {
      // if wake lock request fails - usually system related, such as battery
      wakeButtonName = 'off';
      wakeButton.value = 'Turn Wake Lock ON';
      statusElem.textContent = `${err.name}, ${err.message}`;

    }
  } // requestWakeLock()

  // if we click our button
  wakeButton.addEventListener('click', () => {
    // if wakelock is off request it
    if (wakeButtonName === 'off') {
         requestWakeLock()
    } else { // if it's on release it
      if(wakeLock) {
        wakeLock.release().then(() => {
            wakeLock = null;
        })
      }
    }
  })

  const handleVisibilityChange = () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
      requestWakeLock();
    }
  }

  reaquireCheck.addEventListener('change', () => {
    if (reaquireCheck.checked) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  });

} // isSupported
