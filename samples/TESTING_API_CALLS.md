# Testing Auction Backend API Calls

## How to Verify API Calls Are Being Made

### 1. Open Browser Developer Tools
1. Open `http://localhost:5173/admin/auction`
2. Press `F12` to open DevTools
3. Go to **Network** tab
4. Filter by `XHR` or `Fetch` to see API calls

---

### 2. Test Auction Creation

#### Steps:
1. Click "Create Auction" button
2. Fill in the form:
   - Select a tournament
   - Select at least 2 teams
   - Set budget, increment, base price
3. Click "Create" button

#### Expected API Call:
```
POST http://localhost:8888/api/v2/auctions

Request Payload:
{
  "tournamentId": "tournament_1",
  "auctionConfig": {
    "totalBudgetPerTeam": 10000,
    "maxPlayersPerTeam": 15,
    "minPlayersPerTeam": 11,
    "basePricePerPlayer": 500,
    "minBidIncrement": 100
  },
  "teams": [
    { "teamId": "1", "team": { "teamId": "1", "name": "Team A", "shortName": "TA" } }
  ]
}
```

#### Check Console Logs:
```
🚀 Creating auction in backend...
📤 Sending auction data to backend: { ... }
📥 Backend response: { ... }
✅ Auction created in backend: auction_xxx
```

#### Success Alert:
You should see: `Auction created successfully! ID: auction_xxx`

---

### 3. Test Starting Auction

#### Steps:
1. After creating auction, go to "Live Auction" tab
2. Click "Start Auction" button

#### Expected API Call:
```
POST http://localhost:8888/api/v2/auctions/{auctionId}/start
```

#### Check Console:
```
Auction started in backend
```

---

### 4. Test Bidding

#### Steps:
1. With auction started, click any team's "Bid" button

#### Expected API Call:
```
POST http://localhost:8888/api/v2/auctions/{auctionId}/bid

Request Payload:
{
  "teamId": "team_1",
  "amount": 600
}
```

#### Check Console:
```
Bid placed successfully in backend
```

#### Visual Indicator:
Orange "Syncing to Backend..." chip should appear briefly in the header

---

### 5. Test Player Sold/Unsold

#### Steps:
1. Click "Sold" or "Unsold" button

#### Expected API Call:
```
POST http://localhost:8888/api/v2/auctions/{auctionId}/next
```

#### Check Console:
```
Moved to next player in backend
```

---

### 6. Test Pause/Resume

#### Steps:
1. Click "Pause" button
2. Click "Resume" button

#### Expected API Calls:
```
POST http://localhost:8888/api/v2/auctions/{auctionId}/pause
POST http://localhost:8888/api/v2/auctions/{auctionId}/resume
```

#### Check Console:
```
Auction paused in backend
Auction resumed in backend
```

---

## Troubleshooting

### If API Calls Are Not Showing:

#### 1. Check API Base URL
Open DevTools Console and check:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```
Should be: `http://localhost:8888/api`

#### 2. Check Backend Server
Verify backend is running:
```bash
curl http://localhost:8888/api/v2/tournaments
```

#### 3. Check CORS
If you see CORS errors in console, backend needs to allow `http://localhost:5173`

#### 4. Network Tab Filter
Make sure "XHR" or "Fetch" filter is enabled in Network tab
- Clear "All" filter
- Enable "XHR" filter
- Enable "Fetch" filter

#### 5. Preserve Log
Enable "Preserve log" checkbox in Network tab so API calls don't disappear on navigation

---

## Console Logging

### Debug Emojis Used:
- 🚀 = Function called
- 📤 = Sending data to backend
- 📥 = Receiving data from backend
- ✅ = Success
- ❌ = Error

### Example Console Output:
```
🚀 Creating auction in backend... {config: {...}, teams: [...]}
📤 Sending auction data to backend: {...}
📥 Backend response: {success: true, data: {...}}
✅ Auction created in backend: auction_1234567890
```

---

## Expected Backend Responses

### Success Response:
```json
{
  "success": true,
  "data": {
    "auctionId": "auction_1234567890",
    "status": "scheduled",
    ...
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## Verification Checklist

- [ ] Network tab shows API calls
- [ ] Console shows emoji logs (🚀 📤 📥 ✅)
- [ ] "Syncing to Backend..." chip appears during operations
- [ ] Success/error alerts appear
- [ ] Backend database has new auction record
- [ ] Auction ID is stored in UI state

---

## Quick Debug Script

Paste this in browser console to check state:
```javascript
// Check if auction was created
console.log('Current page:', window.location.href);
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// Monitor fetch calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 Fetch called:', args[0]);
  return originalFetch.apply(this, args);
};

console.log('✅ Fetch monitoring enabled');
```

---

## Success Indicators

When everything is working correctly:

1. **Network Tab**: Shows POST requests to `/api/v2/auctions/*`
2. **Console**: Shows colorful emoji logs
3. **UI**: "Syncing..." indicator appears
4. **Alerts**: Success messages displayed
5. **State**: Auction ID visible in React DevTools

---

## Next Steps

If API calls are working:
- ✅ Test full auction flow
- ✅ Verify data persists in backend
- ✅ Check database records
- ✅ Test error scenarios

If API calls are NOT working:
- Check console for errors
- Verify backend is running
- Check network tab for failed requests
- Review backend logs
