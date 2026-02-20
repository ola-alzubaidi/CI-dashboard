# ServiceNow: Discovery RITM Business Rule – Send Email to Requested For

Use this **Business Rule** to send an email to the **Requested for** user when a Discovery RITM reaches a given status. You can then verify the email in **System > Email > Outbound**.

---

## 1. Create the Business Rule

1. Go to **System Definition > Business Rules**.
2. Click **New**.
3. Configure:

| Field | Value |
|-------|--------|
| **Name** | Discovery RITM – Send Email to Requested For |
| **Table** | Requested Item [sc_req_item] |
| **Active** | ✓ |
| **When** | before or after (see below) |
| **Insert** | ✓ (optional – if you want email on create) |
| **Update** | ✓ |
| **Filter conditions** | (optional) See below |

---

## 2. Filter Conditions (optional)

To run only for Discovery catalog items:

| Field | Operator | Value |
|-------|----------|-------|
| Catalog item | contains | Initiate Discovery |
| **OR** Catalog item | contains | Discovery process |

Or to run only when `u_discovery_status` changes to an email-sent value:

| Field | Operator | Value |
|-------|----------|-------|
| u_discovery_status | changes to | email_1_sent |
| **OR** u_discovery_status | changes to | email_2_sent |
| **OR** u_discovery_status | changes to | email_3_sent |

---

## 3. Script (paste into the Script field)

```javascript
// Send email to Requested for when u_discovery_status is set to email_1_sent, email_2_sent, or email_3_sent
(function executeRule(current, previous /*null when async*/) {
    var status = current.getValue('u_discovery_status');
    if (!status || !['email_1_sent', 'email_2_sent', 'email_3_sent'].includes(status)) {
        return;
    }

    var requester = current.requested_for.getRefRecord();
    if (!requester) {
        gs.warn('Discovery BR: No requested_for on RITM ' + current.getDisplayValue('number'));
        return;
    }

    var to = requester.getValue('email');
    if (!to) {
        gs.warn('Discovery BR: Requested for user has no email on RITM ' + current.getDisplayValue('number'));
        return;
    }

    var name = requester.getDisplayValue('name') || 'Customer';
    var num = current.getDisplayValue('number');
    var desc = current.getDisplayValue('short_description') || '';

    var email = new GlideEmailOutbound();
    email.setTo(to);

    if (status === 'email_1_sent') {
        email.setSubject('[Action Required] Discovery Onboarding - ' + num);
        email.setBody('Dear ' + name + ',\n\nWe are reaching out regarding your request ' + num + ': "' + desc + '".\n\nTo proceed with Discovery onboarding, we need to schedule a Technical Engagement Meeting (TEM).\n\nPlease respond with your availability and technical contact.\n\nBest regards,\nDiscovery Team');
    } else if (status === 'email_2_sent') {
        email.setSubject('[Reminder] Discovery Onboarding - ' + num);
        email.setBody('Dear ' + name + ',\n\nThis is a follow-up regarding ' + num + '. We haven\'t received a response about Discovery onboarding.\n\nPlease respond with your availability for a TEM meeting.\n\nBest regards,\nDiscovery Team');
    } else if (status === 'email_3_sent') {
        email.setSubject('[Final Notice] Discovery Onboarding - ' + num);
        email.setBody('Dear ' + name + ',\n\nFINAL NOTICE for ' + num + '. If we don\'t receive a response within 3 days, this request will be escalated.\n\nPlease respond immediately.\n\nBest regards,\nDiscovery Team');
    }

    email.setRelatedTo('sc_req_item', current.getUniqueValue());
    email.send();

    gs.info('Discovery BR: Sent ' + status + ' email to ' + to + ' for ' + num);
})(current, previous);
```

---

## 4. When to run

- **Before** – Runs before the record is written. Use if you need to block or change data.
- **After** – Runs after the record is written. Use if you want the email to fire only when `u_discovery_status` is already saved.

For this rule, use **After** so the email is sent only after the status is updated.

---

## 5. How to check outbound emails

1. **System Logs > Email > Outbound**
   - Or: **System > Email > Outbound** (depending on your instance).

2. **System Logs > Email**
   - Shows all email activity (inbound and outbound).

3. **Filter by:**
   - **Related record** = your RITM (if `setRelatedTo` is used).
   - **To** = requester email.
   - **Subject** = e.g. `[Action Required] Discovery Onboarding - RITM0000005`.

4. **Email record fields:**
   - **State** – Sent, Pending, Failed, etc.
   - **Direction** – Outbound.
   - **Sent date** – When it was sent.

---

## 6. Flow with app + Business Rule

1. App or scheduled job sets `u_discovery_status` to `email_1_sent`, `email_2_sent`, or `email_3_sent`.
2. Business Rule runs **after** update.
3. Email is sent to **Requested for**.
4. Email appears in **System > Email > Outbound**.
5. You can verify by filtering on the RITM number or requester email.

---

## 7. Troubleshooting

| Issue | Check |
|-------|--------|
| No email sent | Outbound email configured? (System Properties > Email) |
| No email in Outbound | Business Rule active? Filter conditions correct? |
| Requester has no email | Add email to user in **User Administration > Users** |
| Email stuck in Pending | SMTP server, credentials, and firewall settings |
