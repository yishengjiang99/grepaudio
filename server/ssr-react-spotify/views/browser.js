if (!window) throw new Exception("no");

const fetchAPI = (uri) =>
  fetch("https://api.spotify.com/v1/" + uri, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authToken,
    },
  })
    .then((resp) => resp.json())
    .catch((e) => alert(e.message));
