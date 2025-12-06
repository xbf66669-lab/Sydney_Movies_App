// src/mockData.ts
export const mockMovies = [
  {
    id: 1,
    title: 'Inception',
    year: 2010,
    rating: 8.8,
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    image: 'https://via.placeholder.com/500x750',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    director: 'Christopher Nolan',
    cast: [
      { name: 'Leonardo DiCaprio', character: 'Cobb' },
      { name: 'Joseph Gordon-Levitt', character: 'Arthur' },
      { name: 'Ellen Page', character: 'Ariadne' },
      { name: 'Tom Hardy', character: 'Eames' },
    ],
    runtime: 148,
    releaseDate: '2010-07-16'
  },
  // Add more movies as needed, ensuring each has a unique ID
  {
    id: 2,
    title: 'The Shawshank Redemption',
    year: 1994,
    rating: 9.3,
    genre: ['Drama'],
    image: 'https://via.placeholder.com/500x750',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    director: 'Frank Darabont',
    cast: [
      { name: 'Tim Robbins', character: 'Andy Dufresne' },
      { name: 'Morgan Freeman', character: 'Ellis Boyd "Red" Redding' },
    ],
    runtime: 142,
    releaseDate: '1994-09-23'
  }
  // Add more movies here...
];