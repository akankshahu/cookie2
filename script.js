const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');
 const checkButton =document.getElementById('check');
 console.log('check button :',checkButton);
// Store data in localStorage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Retrieve data from localStorage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Generate a random 3-digit number between MIN and MAX
function getRandomArbitrary(min, max) {
  let cached;
  cached = Math.random() * (max - min) + min;
  cached = Math.floor(cached);
  return cached;
}

// Clear localStorage
function clear() {
  localStorage.clear();
}

// Generate sha256 hash of a string
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message); // Encode message to UTF-8
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer); // Generate hash
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to array
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // Convert array to hex string
}

// Get or generate SHA-256 hash for a random PIN
async function getSHA256Hash() {
  let cached = retrieve('sha256');
  if (cached) {
    return cached; // Return cached value if available
  }
  cached = await sha256(getRandomArbitrary(MIN, MAX).toString()); // Generate hash for random PIN
  store('sha256', cached); // Save hash in localStorage
  return cached;
}

// Main logic to display SHA256 hash
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash; // Display SHA256 hash
}

// Handle user input and check if the PIN matches the hash
async function test() {
  const pin = pinInput.value;
  if (pin.length !== 3) {
    resultView.innerHTML = '💡 PIN must be 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  const sha256Hash = sha256HashView.innerHTML;
  const hashedPin = await sha256(pin);

  if (hashedPin === sha256Hash) {
    resultView.innerHTML = '🎉 Success!';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = '❌ Incorrect PIN';
    resultView.classList.remove('hidden');
  }
}

// Brute-force to find the correct PIN for debugging (not for production)
async function bruteForceHash() {
  const targetHash = sha256HashView.innerHTML;
  for (let i = MIN; i <= MAX; i++) {
    const pin = i.toString();
    const hash = await sha256(pin);
    if (hash === targetHash) {
      console.log(`Found the PIN: ${pin}`);
      break;
    }
  }
}

// Ensure the pin input is only 3 digits long and numeric
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3); // Keep only digits, max 3 characters
});

// Attach the test function to the button click event
document.getElementById('check').addEventListener('click', test);

// Optionally, run brute force for debugging (you can disable this part for production)
(async () => {
  const targetHash = localStorage.getItem('sha256');

  for (let i = 100; i <= 999; i++) {
    const hash = await sha256(i.toString());
    if (hash === targetHash) {
      console.log(`✅ Found the number: ${i}`);
      break;
    }
  }
})();
main();