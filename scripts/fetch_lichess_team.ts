async function fetchLichessTeam() {
  console.log('Fetching members of jgec-chess-club from Lichess...');
  const res = await fetch('https://lichess.org/api/team/jgec-chess-club/users');
  const text = await res.text();
  const members = text.trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
  console.log(`Retrieved ${members.length} members from Lichess.`);

  const userIds = members.map(m => m.id);

  const chunkSize = 150;
  const userDetails: any[] = [];
  for (let i = 0; i < userIds.length; i += chunkSize) {
    const chunk = userIds.slice(i, i + chunkSize);
    const userDetailsRes = await fetch('https://lichess.org/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'Chaturanga-JGEC-ChessClub/1.0'
      },
      body: chunk.join(',')
    });

    if (!userDetailsRes.ok) {
      throw new Error(`Failed to fetch Lichess users batch: HTTP ${userDetailsRes.status}`);
    }

    const chunkData = await userDetailsRes.json();
    userDetails.push(...chunkData);
  }
  console.log(`Fetched live details for ${userDetails.length} users.`);

  // Process ratings
  const ranked = userDetails.map((u: any) => {
    const rapid = u.perfs?.rapid?.rating || 0;
    const blitz = u.perfs?.blitz?.rating || 0;
    const classical = u.perfs?.classical?.rating || 0;
    const bullet = u.perfs?.bullet?.rating || 0;

    // Determine primary rating and format
    let bestRating = rapid;
    let bestFormat = 'Rapid';
    if (blitz > bestRating) {
      bestRating = blitz;
      bestFormat = 'Blitz';
    }
    if (classical > bestRating) {
      bestRating = classical;
      bestFormat = 'Classical';
    }

    return {
      username: u.username,
      title: u.title || null,
      rapid,
      blitz,
      classical,
      bullet,
      bestRating,
      bestFormat,
      platform: 'Lichess',
      profileUrl: `https://lichess.org/@/${u.username}`
    };
  });

  // Sort by highest rating descending
  ranked.sort((a: any, b: any) => b.bestRating - a.bestRating);

  console.log('\n=== TOP 10 RATED PLAYERS (JGEC CHESS CLUB ON LICHESS) ===');
  ranked.slice(0, 10).forEach((p: any, idx: number) => {
    console.log(`${idx + 1}. ${p.username} — ${p.bestRating} (${p.bestFormat} on ${p.platform}) | Rapid: ${p.rapid}, Blitz: ${p.blitz}, Classical: ${p.classical}`);
  });

  console.log('\n=== TOP 3 PODIUM CANDIDATES ===');
  ranked.slice(0, 3).forEach((p: any, idx: number) => {
    const medal = idx === 0 ? '🥇 Gold' : idx === 1 ? '🥈 Silver' : '🥉 Bronze';
    console.log(`${medal}: ${p.username} — ${p.bestRating} [Lichess ${p.bestFormat}]`);
  });
}

fetchLichessTeam();
