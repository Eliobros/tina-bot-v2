
import SpotifyWebApi from 'spotify-web-api-node';
// Substitua pelas suas credenciais
const spotifyApi = new SpotifyWebApi({
  clientId: '945324e21e04420d8f1a3d72b891dee4',
  clientSecret: '407c5fcbb52a467cb56aeefb1cf00a8f',
  redirectUri: 'YOUR_REDIRECT_URI'
});

// Obtenha o token de acesso
spotifyApi.clientCredentialsGrant().then(
  (data) => {
    console.log('Access token:', data.body['access_token']);
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  (err) => {
    console.log('Something went wrong when retrieving an access token', err);
  }
);