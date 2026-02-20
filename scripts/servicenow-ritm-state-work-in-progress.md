# ServiceNow: Set New RITM State to "Work in Progress" on Create

Use this **Business Rule** so newly created RITMs automatically get state **Work in Progress** instead of staying in Open/Pending.

---

## 1. Create the Business Rule

1. Go to **System Definition > Business Rules**.
2. Click **New**.
3. Configure:

| Field | Value |
|-------|--------|
| **Name** | RITM – Set Work in Progress on Create |
| **Table** | Requested Item [sc_req_item] |
| **Active** | ✓ |
| **When** | **before** |
| **Insert** | ✓ |
| **Update** | ☐ |

---

## 2. Script (paste into the Script field)

```javascript
// Set new RITM state to "Work in Progress" on insert
(function executeRule(current, previous /*null when async*/) {
    // Only on insert (new record)
    if (previous) return;

    // Look up "Work in Progress" state from sc_request_state
    var grState = new GlideRecord('sc_request_state');
    grState.addQuery('label', 'CONTAINS', 'Work in Progress');
    grState.addOrCondition('label', 'CONTAINS', 'In Progress');
    grState.query();

    if (grState.next()) {
        current.setValue('state', grState.getUniqueValue());
        gs.info('RITM BR: Set state to Work in Progress for new RITM');
    } else {
        // Fallback: try numeric value 2 (common for Work in Progress)
        grState = new GlideRecord('sc_request_state');
        grState.addQuery('value', '2');
        grState.query();
        if (grState.next()) {
            current.setValue('state', grState.getUniqueValue());
        }
    }
})(current, previous);
```

---

## 3. Optional: Only for Discovery Catalog Items

If you want this only for Discovery RITMs, add **Filter conditions**:

| Field | Operator | Value |
|-------|----------|-------|
| Catalog item | contains | Initiate Discovery |
| **OR** Catalog item | contains | Discovery process |

---

## 4. Verify Your Instance's State Labels

Your instance may use different labels. Check:

1. Go to **System Definition > Tables**.
2. Open **Request State [sc_request_state]**.
3. List records and note the **Label** for "Work in Progress" (e.g. "Work in Progress", "In Progress", "In progress").

If the script doesn't find a match, adjust the query:

```javascript
// Example: if your label is exactly "Work in Progress"
grState.addQuery('label', 'Work in Progress');
```

---

## 5. After Adding the Rule

1. Create a new RITM in ServiceNow (Catalog, Service Portal, or direct form).
2. The state should be set to **Work in Progress** immediately.
3. In the app, refresh the Discovery view – the RITM State column should show "Work in Progress".
