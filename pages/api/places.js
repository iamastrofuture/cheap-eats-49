export default async function handler(req, res) {
  const { zip = '10001' } = req.query;

  // Convert ZIP to coordinates
  const geoRes = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${process.env.GOOGLE_API_KEY}`
  );
  const geoData = await geoRes.json();
  const location = geoData.results?.[0]?.geometry?.location;

  if (!location) {
    return res.status(400).json({ error: 'Invalid ZIP code' });
  }

  const { lat, lng } = location;

  // Get nearby restaurants
  const placesRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=restaurant&key=${process.env.GOOGLE_API_KEY}`
  );
  const placesData = await placesRes.json();

  res.status(200).json(placesData.results);
}
