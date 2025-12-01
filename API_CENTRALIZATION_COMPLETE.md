# ✅ API URL Centralization - Complete!

## Summary of Changes

All API URLs in the frontend are now managed from **ONE SINGLE FILE**:

### 📁 Central Configuration File
**File:** `frontend/src/services/api.js` (Lines 11-12)

```javascript
// 🔧 SINGLE SOURCE OF TRUTH - Change URLs here only!
export const API_URL = 'http://localhost:5001';          // ← For API calls
export const BASE_URL = 'http://localhost:5001';         // ← For files/images
```

### ✅ Files Updated

1. **`src/services/api.js`**
   - Centralized API_URL and BASE_URL
   - Direct configuration (no env files)
   - Clear documentation with arrows pointing to edit locations

2. **`src/pages/CompanyProfile.jsx`**
   - Removed hardcoded URL
   - Now imports and uses `BASE_URL` from api.js

### 📊 Verification Results

✅ **0** hardcoded URLs remaining in component files  
✅ **All** components import from centralized config  
✅ **Simple** - Just edit 2 lines in ONE file  
✅ **No env files** needed

### 🎯 How to Use

#### To Change API URL:

1. Open `src/services/api.js`
2. Edit lines 11-12
3. Save and restart dev server

**For Development:**
```javascript
export const API_URL = 'http://localhost:5001';
export const BASE_URL = 'http://localhost:5001';
```

**For Production:**
```javascript
export const API_URL = 'https://jobs.wizoneit.com/api';
export const BASE_URL = 'https://jobs.wizoneit.com/api';
```

### 📝 Files That Use API URLs

All these files now import from `src/services/api.js`:

**Pages:**
- UsersManager.jsx
- SelectedCandidates.jsx
- RolesManager.jsx
- Interviews.jsx
- ShortlistedCandidates.jsx
- DocumentVerification.jsx
- CandidateDocumentUpload.jsx
- AIMatchingResults.jsx
- AIConfigManager.jsx
- AcceptOffer.jsx
- CompanyProfile.jsx

**Components:**
- InterviewScheduleModal.jsx

**Services:**
- companySettings.js

### ⚡ Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 📚 Documentation

See `API_CONFIG.md` for detailed documentation.

---

**Status:** ✅ **COMPLETE**  
**Date:** November 29, 2025  
**Configuration:** Direct in `src/services/api.js` (No env files)  
**Lines to Edit:** 11-12 only
