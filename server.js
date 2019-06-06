const express = require("express")
const app = express()

app.get('/', (req, res) => res.send("Hello, World!"));
app.get('/ping', (req, res) => res.json({ pong: "Pong!"}))


const port = process.env.PORT || 3100
app.listen(port, () => {
  console.log(`Express listening on port ${port}`)
})
