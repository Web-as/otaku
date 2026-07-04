# 🎁 Unified Entitlement System

## How It Works

**Buy one, get both!**

### Option 1: Buy Library Premium ($1)
✅ **You get:**
- Library Premium features (unlimited anime tracking)
- Program Download + License Key (FREE GIFT!)

### Option 2: Buy Program Download ($1)
✅ **You get:**
- Program Download + License Key
- Library Premium features (FREE BONUS!)

**Same price. Same benefits. Your choice!**

---

## Technical Implementation

### User Tier System

```typescript
type UserTier = 'free' | 'premium' | 'lifetime';

// After ANY purchase:
tier = 'lifetime' // Both products grant lifetime access
hasLibraryPremium = true
hasProgramAccess = true
programLicenseKey = "XXXXX-XXXXX-XXXXX-XXXXX"
```

### Database Schema

```sql
user_profiles table:
- tier: 'lifetime' (after any purchase)
- program_license_key: unique key for program activation
- purchase_date: when they bought
- purchase_type: 'library_premium' or 'program_download'
```

### Usage in Sites

#### LT Tracker (Library Site)
```typescript
import { getUserEntitlements } from '../../shared/entitlements';

const entitlements = await getUserEntitlements(userId);

if (entitlements.hasLibraryPremium) {
  // Show premium features
  // Show "You also have program access!" banner
}
```

#### EU Site (Program Download)
```typescript
import { getUserEntitlements, getProgramLicenseKey } from '../../shared/entitlements';

const entitlements = await getUserEntitlements(userId);

if (entitlements.hasProgramAccess) {
  const licenseKey = await getProgramLicenseKey(userId);
  // Show download button
  // Display license key
  // Show "You also have library premium!" banner
}
```

---

## Success Pages

### After Buying Library Premium
```
🎉 Library Premium Activated!

✅ Unlimited anime tracking
✅ Advanced filters & sorting
✅ Cloud sync across devices

🎁 BONUS: Program Download Unlocked!
Your License Key: XXXXX-XXXXX-XXXXX-XXXXX
[Download Program]
```

### After Buying Program
```
🎉 Program Download Ready!

Your License Key: XXXXX-XXXXX-XXXXX-XXXXX
[Download for Windows] [Download for Mac]

🎁 BONUS: Library Premium Included!
✅ Unlimited anime tracking
✅ Premium features unlocked
[Go to Library]
```

---

## Marketing Copy

### LT Tracker Upgrade Button
```
Upgrade to Premium - $1
✅ Unlimited tracking
✅ Advanced features
🎁 FREE: Program Download + License ($1 value)
```

### EU Site Buy Button
```
Get Otaku Core - $1
✅ Desktop program + License
✅ Lifetime updates
🎁 FREE: Library Premium ($1 value)
```

---

## Benefits

1. **Simpler for users:** One purchase = everything
2. **Higher perceived value:** "Get $2 worth for $1"
3. **Cross-site engagement:** Users try both products
4. **Easier to maintain:** One entitlement system
5. **Better conversion:** "Free gift" psychology

---

## Implementation Checklist

- [x] Create unified entitlement system
- [x] Link Stripe products
- [ ] Update success pages to show both benefits
- [ ] Add "You also have..." banners
- [ ] Update marketing copy on both sites
- [ ] Test purchase flow end-to-end
