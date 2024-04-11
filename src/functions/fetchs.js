export async function fetchGetAsync(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error; // Puedes manejar el error según tus necesidades
  }
}

export async function fetchGetAsyncText(url, headers = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        ...headers,
        "Content-Type": "text/plain",
      },
    });
    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error; // Puedes manejar el error según tus necesidades
  }
}
