(async () => {
  const BASE = 'http://localhost:5000/api';
  const username = `ci_admin_${Date.now()}`;
  const password = 'Passw0rd!';
  const headers = { 'Content-Type': 'application/json' };
  try {
    console.log('Registering admin:', username);
    let res = await fetch(`${BASE}/admin/register`, { method: 'POST', headers, body: JSON.stringify({ username, password }) });
    let json = await res.json();
    if (!res.ok) throw new Error(`Register failed: ${json.message || res.statusText}`);
    console.log('Registered:', json.data);

    console.log('Logging in...');
    res = await fetch(`${BASE}/admin/login`, { method: 'POST', headers, body: JSON.stringify({ username, password }) });
    json = await res.json();
    if (!res.ok) throw new Error(`Login failed: ${json.message || res.statusText}`);
    const token = json.data.token;
    console.log('Logged in, token length:', token.length);
    const auth = { Authorization: `Bearer ${token}` };

    console.log('Creating event...');
    const start = new Date();
    const end = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    res = await fetch(`${BASE}/events`, { method: 'POST', headers: { ...headers, ...auth }, body: JSON.stringify({ name: 'CI Test Event', start_date: start.toISOString().slice(0,10), end_date: end.toISOString().slice(0,10) }) });
    json = await res.json();
    if (!res.ok) throw new Error(`Create event failed: ${json.message || res.statusText}`);
    const event = json.data;
    console.log('Event created:', event.id);

    console.log('Creating teams...');
    res = await fetch(`${BASE}/teams`, { method: 'POST', headers: { ...headers, ...auth }, body: JSON.stringify({ name: 'Team Alpha' }) });
    json = await res.json(); if (!res.ok) throw new Error(`Create team1 failed: ${json.message || res.statusText}`);
    const team1 = json.data; console.log('Team1:', team1.id);
    res = await fetch(`${BASE}/teams`, { method: 'POST', headers: { ...headers, ...auth }, body: JSON.stringify({ name: 'Team Beta' }) });
    json = await res.json(); if (!res.ok) throw new Error(`Create team2 failed: ${json.message || res.statusText}`);
    const team2 = json.data; console.log('Team2:', team2.id);

    console.log('Adding teams to event...');
    res = await fetch(`${BASE}/teams/event/${event.id}/team/${team1.id}`, { method: 'POST', headers: { ...headers, ...auth } }); json = await res.json(); if (!res.ok) throw new Error(`Add team1 to event failed: ${json.message || res.statusText}`);
    res = await fetch(`${BASE}/teams/event/${event.id}/team/${team2.id}`, { method: 'POST', headers: { ...headers, ...auth } }); json = await res.json(); if (!res.ok) throw new Error(`Add team2 to event failed: ${json.message || res.statusText}`);
    console.log('Teams added to event');

    console.log('Creating sport...');
    res = await fetch(`${BASE}/sports`, { method: 'POST', headers: { ...headers, ...auth }, body: JSON.stringify({ event_id: event.id, category: 'men', name: 'Cricket Test', playoff_format: 'ipl' }) });
    json = await res.json(); if (!res.ok) throw new Error(`Create sport failed: ${json.message || res.statusText}`);
    const sport = json.data; console.log('Sport created:', sport.id);

    console.log('Creating match...');
    res = await fetch(`${BASE}/matches`, { method: 'POST', headers: { ...headers, ...auth }, body: JSON.stringify({ sport_id: sport.id, team1_id: team1.id, team2_id: team2.id, scheduled_at: new Date(Date.now()+3600*1000).toISOString() }) });
    json = await res.json(); if (!res.ok) throw new Error(`Create match failed: ${json.message || res.statusText}`);
    const match = json.data; console.log('Match created:', match.id);

    console.log('Completing match (setting winner to team1)');
    res = await fetch(`${BASE}/matches/${match.id}`, { method: 'PATCH', headers: { ...headers, ...auth }, body: JSON.stringify({ status: 'completed', winner_team_id: team1.id, team1_score: '160/6', team2_score: '150/9' }) });
    json = await res.json(); if (!res.ok) throw new Error(`Complete match failed: ${json.message || res.statusText}`);
    console.log('Match updated to completed');

    console.log('Fetching sport points...');
    res = await fetch(`${BASE}/points/sport/${sport.id}`); json = await res.json(); if (!res.ok) throw new Error(`Get sport points failed: ${json.message || res.statusText}`);
    console.log('Sport points:', JSON.stringify(json.data, null, 2));

    console.log('Fetching event points...');
    res = await fetch(`${BASE}/points/event/${event.id}`); json = await res.json(); if (!res.ok) throw new Error(`Get event points failed: ${json.message || res.statusText}`);
    console.log('Event points:', JSON.stringify(json.data, null, 2));

    console.log('CI flow completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('CI flow failed:', err.message);
    process.exit(2);
  }
})();
