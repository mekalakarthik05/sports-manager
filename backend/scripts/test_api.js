#!/usr/bin/env node

/**
 * Comprehensive API test script for Sports Event Manager
 * Tests: auth, events, sports, teams, matches, points aggregation
 * Run: node scripts/test_api.js
 */

const http = require('http');
const BASE_URL = 'http://localhost:5000/api';

let authToken = null;
let adminId = null;
let eventId = null;
let sportId = null;
let teamId1 = null;
let teamId2 = null;
let matchId = null;

const tests = [];
let passCount = 0;
let failCount = 0;

function log(msg) {
  console.log(`[TEST] ${msg}`);
}

function pass(msg) {
  console.log(`✓ PASS: ${msg}`);
  passCount++;
}

function fail(msg, err) {
  console.error(`✗ FAIL: ${msg}`);
  if (err) console.error(`  Error: ${err}`);
  failCount++;
}

async function httpRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data || '{}');
          resolve({ status: res.statusCode, body: json, headers: res.headers });
        } catch (err) {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  log('Starting API Tests...\n');

  // 1. Test Health Check
  try {
    const res = await httpRequest('GET', '/health');
    if (res.status === 200) {
      pass('Health check');
    } else {
      fail('Health check', `Status ${res.status}`);
    }
  } catch (err) {
    fail('Health check (connection)', err.message);
    console.error('\nERROR: Cannot connect to backend. Ensure it is running on port 5000.');
    process.exit(1);
  }

  // 2. Register Admin
  const adminUser = `admin_test_${Date.now()}`;
  try {
    const res = await httpRequest('POST', '/admin/register', {
      username: adminUser,
      password: 'TestPassword123',
    });
    if (res.status === 201 && res.body.success && res.body.data.id) {
      adminId = res.body.data.id;
      pass(`Register admin (${adminUser})`);
    } else {
      fail(`Register admin`, `Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  } catch (err) {
    fail('Register admin', err.message);
  }

  // 3. Login Admin
  try {
    const res = await httpRequest('POST', '/admin/login', {
      username: adminUser,
      password: 'TestPassword123',
    });
    if (res.status === 200 && res.body.success && res.body.data.token) {
      authToken = res.body.data.token;
      pass('Login admin');
    } else {
      fail('Login admin', `Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  } catch (err) {
    fail('Login admin', err.message);
  }

  if (!authToken) {
    fail('Cannot continue without auth token');
    process.exit(1);
  }

  // 4. Create Event
  try {
    const res = await httpRequest(
      'POST',
      '/events',
      {
        name: 'Test Event',
        start_date: '2026-02-05',
        end_date: '2026-02-10',
      },
      authToken
    );
    if (res.status === 201 && res.body.success && res.body.data.id) {
      eventId = res.body.data.id;
      pass('Create event');
    } else {
      fail('Create event', `Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  } catch (err) {
    fail('Create event', err.message);
  }

  // 5. Create Team 1
  try {
    const res = await httpRequest(
      'POST',
      '/teams',
      { name: 'Team Alpha' },
      authToken
    );
    if (res.status === 201 && res.body.success && res.body.data.id) {
      teamId1 = res.body.data.id;
      pass('Create team 1');
    } else {
      fail('Create team 1', `Status ${res.status}`);
    }
  } catch (err) {
    fail('Create team 1', err.message);
  }

  // 6. Create Team 2
  try {
    const res = await httpRequest(
      'POST',
      '/teams',
      { name: 'Team Beta' },
      authToken
    );
    if (res.status === 201 && res.body.success && res.body.data.id) {
      teamId2 = res.body.data.id;
      pass('Create team 2');
    } else {
      fail('Create team 2', `Status ${res.status}`);
    }
  } catch (err) {
    fail('Create team 2', err.message);
  }

  // 7. Add team 1 to event
  try {
    const res = await httpRequest(
      'POST',
      `/teams/event/${eventId}/team/${teamId1}`,
      {},
      authToken
    );
    if (res.status === 200 || res.status === 201) {
      pass('Add team 1 to event');
    } else {
      fail('Add team 1 to event', `Status ${res.status}`);
    }
  } catch (err) {
    fail('Add team 1 to event', err.message);
  }

  // 8. Add team 2 to event
  try {
    const res = await httpRequest(
      'POST',
      `/teams/event/${eventId}/team/${teamId2}`,
      {},
      authToken
    );
    if (res.status === 200 || res.status === 201) {
      pass('Add team 2 to event');
    } else {
      fail('Add team 2 to event', `Status ${res.status}`);
    }
  } catch (err) {
    fail('Add team 2 to event', err.message);
  }

  // 9. Create Sport
  try {
    const res = await httpRequest(
      'POST',
      '/sports',
      {
        event_id: eventId,
        category: 'men',
        name: 'Cricket',
        playoff_format: 'ipl',
      },
      authToken
    );
    if (res.status === 201 && res.body.success && res.body.data.id) {
      sportId = res.body.data.id;
      pass('Create sport');
    } else {
      fail('Create sport', `Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  } catch (err) {
    fail('Create sport', err.message);
  }

  // 10. Create Match
  try {
    const res = await httpRequest(
      'POST',
      '/matches',
      {
        sport_id: sportId,
        team1_id: teamId1,
        team2_id: teamId2,
        match_type: 'group',
        status: 'upcoming',
        scheduled_at: '2026-02-06T10:00:00Z',
      },
      authToken
    );
    if (res.status === 201 && res.body.success && res.body.data.id) {
      matchId = res.body.data.id;
      pass('Create match');
    } else {
      fail('Create match', `Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  } catch (err) {
    fail('Create match', err.message);
  }

  // 11. List Matches for Sport
  try {
    const res = await httpRequest('GET', `/matches/sport/${sportId}`);
    if (res.status === 200 && res.body.success && Array.isArray(res.body.data)) {
      if (res.body.data.length > 0) {
        pass('List matches for sport');
      } else {
        fail('List matches for sport', 'No matches returned');
      }
    } else {
      fail('List matches for sport', `Status ${res.status}`);
    }
  } catch (err) {
    fail('List matches for sport', err.message);
  }

  // 12. Update Match (complete with winner)
  try {
    const res = await httpRequest(
      'PATCH',
      `/matches/${matchId}`,
      {
        status: 'completed',
        winner_team_id: teamId1,
        team1_score: '150',
        team2_score: '140',
      },
      authToken
    );
    if (res.status === 200 && res.body.success) {
      pass('Update match (complete with winner)');
    } else {
      fail('Update match', `Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  } catch (err) {
    fail('Update match', err.message);
  }

  // 13. Get Sport Points Table
  try {
    const res = await httpRequest('GET', `/points/sport/${sportId}`);
    if (res.status === 200 && res.body.success && Array.isArray(res.body.data)) {
      pass('Get sport points table');
    } else {
      fail('Get sport points table', `Status ${res.status}`);
    }
  } catch (err) {
    fail('Get sport points table', err.message);
  }

  // 14. Get Event Points Table
  try {
    const res = await httpRequest('GET', `/points/event/${eventId}`);
    if (res.status === 200 && res.body.success && Array.isArray(res.body.data)) {
      pass('Get event points table');
    } else {
      fail('Get event points table', `Status ${res.status}`);
    }
  } catch (err) {
    fail('Get event points table', err.message);
  }

  // 15. Get Event Dashboard
  try {
    const res = await httpRequest('GET', `/events/${eventId}/dashboard`);
    if (res.status === 200 && res.body.success) {
      pass('Get event dashboard');
    } else {
      fail('Get event dashboard', `Status ${res.status}`);
    }
  } catch (err) {
    fail('Get event dashboard', err.message);
  }

  // 16. List Events (public)
  try {
    const res = await httpRequest('GET', '/events');
    if (res.status === 200 && res.body.success && Array.isArray(res.body.data)) {
      pass('List events (public)');
    } else {
      fail('List events', `Status ${res.status}`);
    }
  } catch (err) {
    fail('List events', err.message);
  }

  // 17. Test Invalid Login
  try {
    const res = await httpRequest('POST', '/admin/login', {
      username: 'nonexistent',
      password: 'wrongpassword',
    });
    if (res.status === 401) {
      pass('Invalid login returns 401');
    } else {
      fail('Invalid login', `Expected 401, got ${res.status}`);
    }
  } catch (err) {
    fail('Invalid login', err.message);
  }

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESULTS: ${passCount} passed, ${failCount} failed`);
  console.log(`${'='.repeat(50)}`);

  if (failCount === 0) {
    console.log('\n✓ All tests passed! Application is ready.');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed. Review the errors above.');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
