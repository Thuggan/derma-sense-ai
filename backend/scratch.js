const apiKey = 'AIzaSyBw89SCeCRGuozLnpatW404SxQmFXUhlSs';
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log(data.models.map(m => m.name));
    } else {
      console.log(data);
    }
  })
  .catch(console.error);
