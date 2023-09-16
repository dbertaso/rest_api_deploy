const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'El título de la película debe ser string',
    required_error: 'El título de la pelicula es requerido.'
  }),
  year: z.number().int().positive().min(1900).max(2023),
  duration: z.number().int().positive(),
  rate: z.number().positive().min(0).max(10).default(5.5),
  poster: z.string().url({
    message: 'Poster debe ser una URL válida'
  }),
  genre: z.array(
    z.enum([
      'Action',
      'Adventure',
      'Comedy',
      'Drama',
      'Fantasy',
      'Horror',
      'Thriller',
      'Crime',
      'Suspense',
      'Sci-Fi'
    ]),
    {
      required_error: 'El género de la película es requerido.',
      invalid_type_error:
        'El género de la película debe ser un arreglo de valores enumerados'
    }
  )
})

// eslint-disable-next-line space-before-function-paren
function validateMovie(object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}
module.exports = {
  validateMovie,
  validatePartialMovie
}
