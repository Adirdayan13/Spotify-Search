require("dotenv").config();
const express = require("express");
const hbs = require("hbs");
const SpotifyWebApi = require("spotify-web-api-node");
let next;
const app = express();

// require spotify-web-api-node package here:

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch(error => console.log("err in access token", error));

// Our routes go here:

app.get("/", (req, res) => {
  res.render("artist-search");
});

app.get("/artist-search", (req, res) => {
  input = req.query.input;
  spotifyApi
    .searchArtists(req.query.input, { limit: 50 })
    .then(data => {
      data.body.artists.items.map(artist => {
        if (artist.images.length > 0) {
          artist.images = [artist.images[0]];
        }
        if (artist.images.length === 0) {
          artist.images = [{ url: "/images/default.jpg" }];
        }
      });
      let results = data.body.artists.items;
      res.render("artist-search-results", {
        results: results,
        next: data.body.artists.next
      });
    })
    .catch(err => console.log("err GET artist-search: ", err));
});
let date;
app.get("/albums/:artistId", (req, res) => {
  spotifyApi
    .getArtistAlbums(req.params.artistId, { limit: 50 })
    .then(data => {
      data.body.items.map(item => {
        item.release_year = item.release_date.slice(0, 4);
        if (item.images.length > 0) {
          item.images = [item.images[1]];
        }
        if (item.images.length === 0) {
          item.images = [{ url: "/images/default.jpg" }];
        }
      });
      res.render("albums", {
        albums: data.body.items,
        date: data.body.items.release_date
      });
    })
    .catch(err => console.log("error  GET albums/:artistId: ", err));
});

app.get("/tracks/:trackId", (req, res) => {
  spotifyApi.getAlbumTracks(req.params.trackId, { limit: 50 }).then(
    function(data) {
      res.render("tracks", { results: data.body.items });
    },
    function(err) {
      console.log("err GET tracks/:trackId", err);
    }
  );
});

app.listen(process.env.PORT || 3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
