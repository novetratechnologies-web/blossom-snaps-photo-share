let csrfToken = '';

async function readResponse(response) {
  const data = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : null;
  if (data?.csrfToken) csrfToken = data.csrfToken;
  return data;
}

async function refreshCsrfToken() {
  const response = await fetch('/api/session.php', { credentials: 'same-origin', cache: 'no-store' });
  const data = await readResponse(response);
  if (!response.ok || !data?.csrfToken) throw new Error(data?.error || 'Your session expired. Reload the page and sign in again.');
  return data.csrfToken;
}

export async function api(path, options = {}) {
  const makeRequest = (headers = options.headers || {}) => fetch(`/api/${path}`, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  });
  let response = await makeRequest();
  let data = await readResponse(response);
  if (response.status === 403 && data?.error === 'Your session expired. Refresh the page and try again.' && !['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase())) {
    const token = await refreshCsrfToken();
    response = await makeRequest({ ...(options.headers || {}), 'X-CSRF-Token': token });
    data = await readResponse(response);
  }
  if (!response.ok) throw new Error(data?.error || 'Something went wrong. Please try again.');
  return data;
}

export async function apiUpload(path, body, headers, onProgress) {
  const send = (requestHeaders) => new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `/api/${path}`);
    request.withCredentials = true;
    Object.entries(requestHeaders || {}).forEach(([name, value]) => request.setRequestHeader(name, value));
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    });
    request.addEventListener('load', () => {
      let data = null;
      try { data = JSON.parse(request.responseText); } catch { /* API may return an empty response. */ }
      if (data?.csrfToken) csrfToken = data.csrfToken;
      if (request.status >= 200 && request.status < 300) resolve(data);
      else reject(Object.assign(new Error(data?.error || 'The upload could not be completed. Please try again.'), { status: request.status }));
    });
    request.addEventListener('error', () => reject(new Error('The upload connection was interrupted. Check your connection and try again.')));
    request.addEventListener('abort', () => reject(new Error('The upload was cancelled.')));
    request.send(body);
  });
  try {
    return await send(headers);
  } catch (error) {
    if (error.status !== 403 || error.message !== 'Your session expired. Refresh the page and try again.') throw error;
    const token = await refreshCsrfToken();
    return send({ ...(headers || {}), 'X-CSRF-Token': token });
  }
}
