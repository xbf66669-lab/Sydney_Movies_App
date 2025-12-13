// src/mockData.ts
const mockPoster = (title: string) => {
  const safeTitle = (title || 'No Image').slice(0, 40);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
  <rect width="500" height="750" fill="#111827"/>
  <rect x="24" y="24" width="452" height="702" rx="20" fill="#1f2937"/>
  <text x="250" y="370" text-anchor="middle" fill="#e5e7eb" font-family="Arial, sans-serif" font-size="22">
    <tspan x="250" dy="0">${safeTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tspan>
  </text>
  <text x="250" y="410" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">Mock poster</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const mockMovies = [
  {
    id: 1,
    title: 'Inception',
    year: 2010,
    rating: 8.8,
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    image: mockPoster('Inception'),
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
    image: mockPoster('The Shawshank Redemption'),
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