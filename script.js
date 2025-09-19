// --- Global cookieStore support check ---
const supportsCookieStore = (
  'cookieStore' in window &&
  typeof cookieStore.set === 'function' &&
  typeof cookieStore.getAll === 'function' &&
  typeof cookieStore.delete === 'function'
);

async function setCookie() {
  const cookieName = document.getElementById('cookieName');
  const cookieValue = document.getElementById('cookieValue');
  const cookieDays = document.getElementById('cookieDays');
  /*parseInt(..., 10)
  Converts that string into an integer (a number).
  The second argument 10 tells JavaScript to parse in base 10 (decimal).
  Without it, older browsers could interpret a string starting with 0 as octal (base 8).
  Example: parseInt("010") could become 8 instead of 10 if radix isn’t specified.
  With parseInt("7", 10) → result is 7 (number).*/
  const name = cookieName.value.trim();
  const value = cookieValue.value.trim();
  const days = parseInt(cookieDays.value, 10)


  if (!name || !value) {
    alert('Please enter both a cookie name and value');
    return;
  }

  // Expiry date (if provided)
  let expiresDate = undefined;
  if (!isNaN(days) && days > 0) {
    expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + days);
  }



  if (supportsCookieStore) {
    await cookieStore.set({
      name,
      value,
      ...(expiresDate ? { expires: expiresDate } : {}),
      path: '/'
    })
  } else {
    // ✅ Fallback API
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    if (expiresDate) {
      cookieStr += `; expires=${expiresDate.toUTCString()}`;
    }
    cookieStr += '; path=/';
    document.cookie = cookieStr;
  }

  // ✅ Show feedback
  const list = document.getElementById('cookieList');
  list.textContent = "Cookie Saved!";
  list.style = "color: green; text-align: center;";
  setTimeout(() => list.textContent = '', 4000);

  cookieName.value = '';
  cookieValue.value = '';
  cookieDays.value = '';
}




// --- Show Cookies Function ---
async function showCookies() {
  const list = document.getElementById('cookieList');
  list.innerHTML = '';

  if (supportsCookieStore) {
    // Modern API
    const cookies = await cookieStore.getAll();
    if (cookies.length === 0) {
      list.textContent = 'No Cookies found.';
      list.style.color = 'red';
      list.style.textAlign = 'center';
      return;
    }
    cookies.forEach(cookie => {
      const div = document.createElement('div');
      div.textContent = `Name: ${cookie.name} = Value: ${cookie.value}`;
      div.style.color = 'green';
      div.style.textAlign = 'center';
      list.appendChild(div);
    });
  } else {
    //Fallback API
    if (!document.cookie) {
      list.textContent = 'No Cookies found.';
      list.style.color = 'red';
      list.style.textAlign = 'center';
      return;
    }
    const cookies = document.cookie.split(';')
      .map(c => {
        const [name, value] = c.split('=');
        return { name: name.trim(), value: value ? value.trim() : '' };
      })
      .filter(cookie => cookie.name && cookie.value);

    if (cookies.length === 0) {
      list.textContent = 'No Cookies found.';
      list.style.color = 'red';
      list.style.textAlign = 'center';
      return;
    }

    cookies.forEach(cookie => {
      const div = document.createElement('div');
      div.textContent = `Name: ${decodeURIComponent(cookie.name)} = Value: ${decodeURIComponent(cookie.value)}`;
      div.style.color = 'green';
      div.style.textAlign = 'center';
      list.appendChild(div);
    });
  }
}


// --- Clear Cookies Function ---
async function clearCookies() {
  if (supportsCookieStore) {
    const cookies = await cookieStore.getAll();
    for (const cookie of cookies) {
      await cookieStore.delete(cookie.name);
    }
  } else {
    // Parse document.cookie and expire them aggressively
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim();
      if (!name) return;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/`;
    });
  }

  const list = document.getElementById('cookieList');
  list.textContent = "All cookies cleared.";
  list.style.color = 'red';
  list.style.textAlign = 'center';
  setTimeout(() => list.textContent = '', 3000);
}


// --- Event Listeners ---
document.getElementById('showCookiesBtn').addEventListener('click', showCookies);
document.getElementById('clearCookiesBtn').addEventListener('click', clearCookies);
document.getElementById('setCookieBtn').addEventListener('click', setCookie);



//--- Handling Keydown On Inputs ---
function handleKeydown(e) {
  if (e.key === 'Enter') {
    setCookie();
  }
}
document.getElementById('cookieValue').addEventListener('keydown', handleKeydown);
document.getElementById('cookieName').addEventListener('keydown', handleKeydown);
document.getElementById('cookieDays').addEventListener('keydown', handleKeydown);