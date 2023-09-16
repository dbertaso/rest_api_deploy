const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')
const movies = require('./movies.json')

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'https://movies.com',
        'https://midu.dev'
      ]

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }

      if (!origin) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    }
  })
)

// eslint-disable-next-line no-multi-spaces
app.disable('x-powered-by') // deshabilitar el header X-Powered-By: Express

// Todos los recursos que sean MOVIES se indentifica con /movies
app.get('/movies', (req, res) => {
  const { genre } = req.query
  // console.log('Género: ', genre)
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

// Endpoint para recuperar una película por id

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  // console.log(id)
  const movie = movies.find((movie) => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Película no existe' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  // console.log(req.body)

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  // Esto no sería REST, por estamos guardando el estado de la petición en memoria
  movies.push(newMovie)
  // movies.jsonconsole.log('Nueva Película: ', newMovie)
  res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(400).json({ message: 'Película no existe' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Película eliminada' })
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params

  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex < 0) {
    return res.status(400).json({ message: 'Película no existe' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Aplicación ejecutandose en http://localhost:${PORT}`)
})
