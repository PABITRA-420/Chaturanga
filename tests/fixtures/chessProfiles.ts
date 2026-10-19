export const MOCK_CHESS_COM_PLAYER = {
  username: 'magnuscarlsen',
  player_id: 1234567,
  title: 'GM',
  name: 'Magnus Carlsen',
  avatar: 'https://images.chesscomfiles.com/uploads/v1/user/1234567.png',
  status: 'premium',
  is_streamer: true,
  verified: true
};

export const MOCK_CHESS_COM_STATS = {
  chess_rapid: {
    last: { rating: 2832, date: 1600000000, rd: 32 },
    best: { rating: 2882, date: 1550000000 }
  },
  chess_blitz: {
    last: { rating: 2886, date: 1600000000, rd: 45 },
    best: { rating: 2920, date: 1570000000 }
  },
  chess_bullet: {
    last: { rating: 3105, date: 1600000000, rd: 50 },
    best: { rating: 3200, date: 1580000000 }
  }
};

export const MOCK_LICHESS_USER = {
  id: 'rebeccaharris',
  username: 'RebeccaHarris',
  title: 'GM',
  perfs: {
    blitz: { rating: 2750, games: 500 },
    rapid: { rating: 2680, games: 320 },
    bullet: { rating: 2820, games: 1200 },
    classical: { rating: 2500, games: 40 }
  },
  profile: {
    country: 'US',
    bio: 'Candidate Master & Streamer'
  }
};
