export interface Actor {
  id: number;
  name: string;
  nickname: string;
  bio: string;
  rating: number;
  photoUrl: string;
  genre: string;
  upcomingProjects: string[];
  awards: number;
  social: { instagram: string; twitter: string; youtube: string };
}

export interface Movie {
  id: number;
  title: string;
  year: number;
  posterUrl: string;
  cast: string[];
  director: string;
  ottPlatform: string;
  runtime: string;
  rating: number;
  genre: string;
  songs: string[];
  trailerUrl: string;
  description: string;
}

export const actorsData: Actor[] = [
  {
    id: 1,
    name: "Shah Rukh Khan",
    nickname: "King of Bollywood",
    bio: "Shah Rukh Khan, also known as SRK, is an Indian actor, film producer, and television personality. With over 80 films to his credit, he is one of the most successful film stars in the world.",
    rating: 4.9,
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg/440px-Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg",
    genre: "Drama, Romance, Action",
    upcomingProjects: ["Dunki 2", "King (2025)", "The Diplomat"],
    awards: 14,
    social: { instagram: "#", twitter: "#", youtube: "#" },
  },
  {
    id: 2,
    name: "Alia Bhatt",
    nickname: "Powerhouse Performer",
    bio: "Alia Bhatt is an Indian actress who works in Hindi films. She is one of the highest-paid actresses in India and is known for her versatile performances.",
    rating: 4.7,
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Alia_Bhatt_snapped_at_the_airport.jpg/440px-Alia_Bhatt_snapped_at_the_airport.jpg",
    genre: "Drama, Thriller, Romance",
    upcomingProjects: ["Alpha (2025)", "Jigra 2", "Love & War"],
    awards: 11,
    social: { instagram: "#", twitter: "#", youtube: "#" },
  },
  {
    id: 3,
    name: "Ranveer Singh",
    nickname: "The Entertainer",
    bio: "Ranveer Singh is known for his energetic performances and flamboyant style. He has starred in some of the biggest Bollywood blockbusters and is celebrated for his dedication.",
    rating: 4.8,
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ranveer_Singh_at_HT_India%27s_Most_Stylish_2019.jpg/440px-Ranveer_Singh_at_HT_India%27s_Most_Stylish_2019.jpg",
    genre: "Action, Drama, Historical",
    upcomingProjects: ["Don 3 (2025)", "Singham Again 2", "Dil Dhadakne Do 2"],
    awards: 9,
    social: { instagram: "#", twitter: "#", youtube: "#" },
  },
  {
    id: 4,
    name: "Deepika Padukone",
    nickname: "Global Icon",
    bio: "Deepika Padukone is one of the world's highest-paid actresses. She is known for her portrayal of strong female characters and her global advocacy for mental health awareness.",
    rating: 4.8,
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Deepika_Padukone_at_Cannes_2022.jpg/440px-Deepika_Padukone_at_Cannes_2022.jpg",
    genre: "Drama, Action, Romance",
    upcomingProjects: ["Singham Again 2", "The Intern Remake", "Fighter 2"],
    awards: 13,
    social: { instagram: "#", twitter: "#", youtube: "#" },
  },
  {
    id: 5,
    name: "Ayushmann Khurrana",
    nickname: "The Content King",
    bio: "Ayushmann Khurrana is celebrated for choosing unconventional, socially relevant scripts. He has won the National Film Award and reshaped mainstream Bollywood storytelling.",
    rating: 4.6,
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Ayushmann_Khurrana_at_Filmfare.jpg/440px-Ayushmann_Khurrana_at_Filmfare.jpg",
    genre: "Comedy, Drama, Social",
    upcomingProjects: ["Dream Girl 3", "Action Hero 2", "Anek 2"],
    awards: 8,
    social: { instagram: "#", twitter: "#", youtube: "#" },
  },
  {
    id: 6,
    name: "Rajkummar Rao",
    nickname: "Method Actor",
    bio: "Rajkummar Rao is widely regarded as one of the finest actors of his generation. Known for his intense method acting and choice of diverse, challenging roles.",
    rating: 4.7,
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Rajkummar_Rao_at_press_conference_of_Bose_Dead_Alive.jpg/440px-Rajkummar_Rao_at_press_conference_of_Bose_Dead_Alive.jpg",
    genre: "Thriller, Drama, Comedy",
    upcomingProjects: [
      "Maarich (2025)",
      "Srikanth 2",
      "Vicky Vidya Ka Woh Wala Video 2",
    ],
    awards: 7,
    social: { instagram: "#", twitter: "#", youtube: "#" },
  },
];

export const moviesData: Movie[] = [
  {
    id: 1,
    title: "Pathaan",
    year: 2023,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/9/97/Pathaan_film_poster.jpg/220px-Pathaan_film_poster.jpg",
    cast: ["Shah Rukh Khan", "Deepika Padukone", "John Abraham"],
    director: "Siddharth Anand",
    ottPlatform: "Amazon Prime Video",
    runtime: "2h 26m",
    rating: 4.5,
    genre: "Action, Thriller",
    songs: ["Besharam Rang", "Jhoome Jo Pathaan", "Jai Kal Ho"],
    trailerUrl: "https://www.youtube.com/watch?v=vqu4z34wENw",
    description:
      "A RAW agent, Pathaan, fights against a mercenary named Jim who has a personal vendetta against him and India.",
  },
  {
    id: 2,
    title: "Gully Boy",
    year: 2019,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Gully_Boy_poster.jpg/220px-Gully_Boy_poster.jpg",
    cast: ["Ranveer Singh", "Alia Bhatt", "Siddhant Chaturvedi"],
    director: "Zoya Akhtar",
    ottPlatform: "Netflix",
    runtime: "2h 34m",
    rating: 4.7,
    genre: "Drama, Musical",
    songs: ["Mere Gully Mein", "Asli Hip Hop", "Doori", "Azadi"],
    trailerUrl: "https://www.youtube.com/watch?v=JfbxcD6biOk",
    description:
      "An aspiring street rapper from the Dharavi slums of Mumbai rises against all odds to make it in the music world.",
  },
  {
    id: 3,
    title: "3 Idiots",
    year: 2009,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/3_idiots_poster.jpg/220px-3_idiots_poster.jpg",
    cast: ["Aamir Khan", "R. Madhavan", "Sharman Joshi", "Kareena Kapoor"],
    director: "Rajkumar Hirani",
    ottPlatform: "Netflix",
    runtime: "2h 50m",
    rating: 4.9,
    genre: "Comedy, Drama",
    songs: [
      "Aal Izz Well",
      "Zoobi Doobi",
      "Give Me Some Sunshine",
      "Behti Hawa Sa Tha Woh",
    ],
    trailerUrl: "https://www.youtube.com/watch?v=K0eDlFX9GMc",
    description:
      "Two friends search for their long-lost companion, and recall the adventures and transformations they underwent in college.",
  },
  {
    id: 4,
    title: "Dangal",
    year: 2016,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/4/4f/Dangal_Poster.jpg/220px-Dangal_Poster.jpg",
    cast: ["Aamir Khan", "Fatima Sana Shaikh", "Sanya Malhotra"],
    director: "Nitesh Tiwari",
    ottPlatform: "Disney+ Hotstar",
    runtime: "2h 41m",
    rating: 4.8,
    genre: "Biography, Drama, Sports",
    songs: ["Dangal", "Dhaakad", "Gilehriyaan", "Haanikaarak Bapu"],
    trailerUrl: "https://www.youtube.com/watch?v=x_7YlGv9u1g",
    description:
      "Former wrestler Mahavir Singh Phogat trains his daughters Geeta and Babita to become world-class wrestlers.",
  },
  {
    id: 5,
    title: "Andhadhun",
    year: 2018,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/AndhaDhun_Poster.jpg/220px-AndhaDhun_Poster.jpg",
    cast: ["Ayushmann Khurrana", "Tabu", "Radhika Apte"],
    director: "Sriram Raghavan",
    ottPlatform: "Netflix",
    runtime: "2h 19m",
    rating: 4.8,
    genre: "Thriller, Mystery, Dark Comedy",
    songs: ["Naina Da Kya Kasoor", "Woh Ladki Jo", "O Meri Laila"],
    trailerUrl: "https://www.youtube.com/watch?v=t1lMoOTHUHQ",
    description:
      "A series of mysterious events change the life of a blind pianist who becomes a witness to a murder.",
  },
  {
    id: 6,
    title: "KGF Chapter 2",
    year: 2022,
    posterUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/KGF_Chapter_2_poster.jpg/220px-KGF_Chapter_2_poster.jpg",
    cast: ["Yash", "Sanjay Dutt", "Raveena Tandon", "Srinidhi Shetty"],
    director: "Prashanth Neel",
    ottPlatform: "Amazon Prime Video",
    runtime: "2h 48m",
    rating: 4.6,
    genre: "Action, Drama",
    songs: ["Toofan", "Sulthan", "Yaar Mera", "Huttiyidare Kannadadalli"],
    trailerUrl: "https://www.youtube.com/watch?v=LBhN547ZEAM",
    description:
      "Rocky's bloodthirsty followers expect him to expand his territories and become even more powerful. Rocky must bring Garuda under control.",
  },
];

export const ottColors: Record<string, string> = {
  "Amazon Prime Video": "bg-blue-600 text-white",
  Netflix: "bg-red-600 text-white",
  "Disney+ Hotstar": "bg-indigo-600 text-white",
  ZEE5: "bg-purple-600 text-white",
  "Jio Cinema": "bg-sky-500 text-white",
};
