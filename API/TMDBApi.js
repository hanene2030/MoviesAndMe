const API_TOKEN = "";

export function getFilmsFromApiWithSearchedText(text, page) {
  const url =
    "https://api.themoviedb.org/3/search/movie?api_key=" +
    API_TOKEN +
    "&language=en&query=" +
    text +
    "&page=" +
    page;

  return fetch(url)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export function getImageFromApi(name) {
  return "https://image.tmdb.org/t/p/w300" + name;
}

// Récupération du détail d'un film
export function getFilmDetailFromApi(id) {
  const url =
    "https://api.themoviedb.org/3/movie/" +
    id +
    "?api_key=" +
    API_TOKEN +
    "&language=fr";
 
  return fetch(url)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}
