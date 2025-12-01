# API Configuration Guide

## Single Source of Truth for API URLs

All API URLs in this frontend application are centralized in **ONE FILE**:

📁 **`src/services/api.js`** (Lines 11-12)

```javascript
// 🔧 EDIT HERE TO CHANGE API URL
export const API_URL = 'http://localhost:5001';          // ← Change this for API calls
export const BASE_URL = 'http://localhost:5001';         // ← Change this for file/image URLs
```

## How to Change API URLs

### ✅ Simple - Just Edit One File!

1. Open `src/services/api.js`
2. Find lines 11-12
3. Change the URLs:

**For Development (localhost):**
```javascript
export const API_URL = 'http://localhost:5001';
export const BASE_URL = 'http://localhost:5001';
```

**For Production:**
```javascript
export const API_URL = 'https://jobs.wizoneit.com/api';
export const BASE_URL = 'https://jobs.wizoneit.com/api';
```

4. Save the file
5. Restart dev server: `npm run dev`

That's it! No env files needed.

## Usage in Components

All components import from this centralized config:

```javascript
import { API_URL, BASE_URL } from '../services/api';

// For API calls
axios.get(`${API_URL}/positions`)

// For images/files
<img src={`${BASE_URL}${logoPath}`} />
```

## Files Using API URLs

✅ All files import from `src/services/api.js` - No hardcoded URLs anywhere!

**Pages:** UsersManager, SelectedCandidates, RolesManager, Interviews, ShortlistedCandidates, DocumentVerification, CandidateDocumentUpload, AIMatchingResults, AIConfigManager, AcceptOffer, CompanyProfile

**Components:** InterviewScheduleModal

**Services:** companySettings, api

## Quick Reference

| Environment | API_URL | Change Location |
|------------|---------|----------------|
| Development | `http://localhost:5001` | `src/services/api.js` line 11 |
| Production | `https://jobs.wizoneit.com/api` | `src/services/api.js` line 11 |

## Important Notes

✅ **All API URLs in ONE file** - Edit `src/services/api.js` only

✅ **No env files needed** - Direct configuration

✅ **Easy to switch** - Just change 2 lines

⚠️ **Restart dev server** after changing URLs

---

**Last Updated:** November 29, 2025
