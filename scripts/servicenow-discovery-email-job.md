# ServiceNow: Discovery RITM Email Automation (Scheduled Job)

Run this **on the ServiceNow side** to automatically send Email 1, 2, and 3 on schedule (7 days, 7 days, 3 days), and escalate when no response.

**Order of operations:** The script **sends the email first**, then sets **u_discovery_status** to email_1_sent (or email_2_sent / email_3_sent). So the discovery status changes to "email 1 sent" only after the email has been sent.

## Prerequisites

1. On **sc_req_item** table, create:
   - **u_discovery_status** (Choice): `new`, `email_1_sent`, `email_2_sent`, `email_3_sent`, `response_received`, `escalated`, `completed`
   - **u_last_email_date** (Date/Time)

2. **Scheduled Job**: System Definition → Scheduled Jobs → New

   - **Name:** Discovery RITM Email Automation  
   - **Run:** Daily (e.g. 8:00 AM) or every 6 hours  
   - **Active:** true  

## Script (paste into the scheduled job)

```javascript
// Discovery RITM Email Automation
// Schedule: Email 1 → 7 days → Email 2 → 7 days → Email 3 → 3 days → Escalation
// Order: SEND EMAIL FIRST, then set u_discovery_status (so status = "email 1 sent" only after email is sent)
// If u_discovery_status = response_received, skip (customer already responded)

var DISCOVERY_CAT_ITEM = 'Initiate Discovery process'; // Match your catalog item name
var SCHEDULE = {
    email1ToEmail2: 7,
    email2ToEmail3: 7,
    email3ToEscalation: 3
};

var gr = new GlideRecord('sc_req_item');
gr.addQuery('cat_item.name', DISCOVERY_CAT_ITEM);
gr.addQuery('state', 'NOT IN', '3,4,7'); // Exclude closed/cancelled
gr.addQuery('u_discovery_status', 'NOT IN', 'response_received,completed,escalated');
gr.query();

while (gr.next()) {
    var status = gr.getValue('u_discovery_status') || 'new';
    var lastEmail = gr.getValue('u_last_email_date');
    var now = new GlideDateTime();
    var daysSince = 0;
    if (lastEmail) {
        var last = new GlideDateTime(lastEmail);
        daysSince = gs.dateDiff(last.getDisplayValue(), now.getDisplayValue(), true) / 86400;
    } else {
        daysSince = 999;
    }

    if (status == 'new' || status == '') {
        sendDiscoveryEmail(gr, 1);
        gr.setValue('u_discovery_status', 'email_1_sent');
        gr.setValue('u_last_email_date', now.getDisplayValue());
        setWorkInProgress(gr);
        gr.update();
    } else if (status == 'email_1_sent' && daysSince >= SCHEDULE.email1ToEmail2) {
        sendDiscoveryEmail(gr, 2);
        gr.setValue('u_discovery_status', 'email_2_sent');
        gr.setValue('u_last_email_date', now.getDisplayValue());
        gr.update();
    } else if (status == 'email_2_sent' && daysSince >= SCHEDULE.email2ToEmail3) {
        sendDiscoveryEmail(gr, 3);
        gr.setValue('u_discovery_status', 'email_3_sent');
        gr.setValue('u_last_email_date', now.getDisplayValue());
        gr.update();
    } else if (status == 'email_3_sent' && daysSince >= SCHEDULE.email3ToEscalation) {
        escalateRITM(gr);
        gr.setValue('u_discovery_status', 'escalated');
        gr.update();
    }
}

function setWorkInProgress(ritm) {
    var grState = new GlideRecord('sc_request_state');
    grState.addQuery('label', 'CONTAINS', 'Work in Progress');
    grState.addOrCondition('label', 'CONTAINS', 'In Progress');
    grState.query();
    if (grState.next()) {
        ritm.setValue('state', grState.getUniqueValue());
    }
}

function sendDiscoveryEmail(ritm, emailNum) {
    var requester = ritm.requested_for.getRefRecord();
    var to = requester.getValue('email') || requester.getDisplayValue();
    var name = requester.getDisplayValue('name') || 'Customer';
    var num = ritm.getDisplayValue('number');
    var desc = ritm.getDisplayValue('short_description');
    
    var email = new GlideEmailOutbound();
    email.setTo(to);
    
    if (emailNum == 1) {
        email.setSubject('[Action Required] Discovery Onboarding - ' + num);
        email.setBody('Dear ' + name + ',\n\nWe are reaching out regarding your request ' + num + ': "' + desc + '".\n\nTo proceed with Discovery onboarding, we need to schedule a Technical Engagement Meeting (TEM).\n\nPlease respond with your availability and technical contact.\n\nBest regards,\nDiscovery Team');
    } else if (emailNum == 2) {
        email.setSubject('[Reminder] Discovery Onboarding - ' + num);
        email.setBody('Dear ' + name + ',\n\nThis is a follow-up regarding ' + num + '. We haven\'t received a response about Discovery onboarding.\n\nPlease respond with your availability for a TEM meeting.\n\nBest regards,\nDiscovery Team');
    } else if (emailNum == 3) {
        email.setSubject('[Final Notice] Discovery Onboarding - ' + num);
        email.setBody('Dear ' + name + ',\n\nFINAL NOTICE for ' + num + '. If we don\'t receive a response within 3 days, this request will be escalated.\n\nPlease respond immediately.\n\nBest regards,\nDiscovery Team');
    }
    email.send();
}

function escalateRITM(ritm) {
    ritm.work_notes = 'ESCALATED: No response after 3 email attempts.';
    ritm.update();
}
```

## Flow

| u_discovery_status | After time passes        | Job does                          |
|--------------------|--------------------------|-----------------------------------|
| new                | —                        | Send Email 1, set email_1_sent   |
| email_1_sent       | 7 days since u_last_email_date | Send Email 2, set email_2_sent   |
| email_2_sent       | 7 days                   | Send Email 3, set email_3_sent   |
| email_3_sent       | 3 days                   | Escalate, set escalated          |
| response_received  | —                        | Skipped (no auto emails)         |
| completed / escalated | —                    | Skipped                           |

## App behavior

- The **app** reads `u_discovery_status` and `u_last_email_date` from ServiceNow.
- When the **job** updates those fields, the app shows the correct step and due dates.
- **How we record “response received”:** ServiceNow does not auto-detect email replies. When the service provider responds (by any channel), a person records it: in the app, expand the RITM → **Enter IP / Edit info** → fill Host IP (and optional notes) → **Save IP**. That sets `u_discovery_status = response_received` so the job stops and does not escalate. Optionally you can set up Inbound Email + Flow in ServiceNow to set `response_received` when a reply email is received (see docs/DISCOVERY_WORKFLOW.md).
- Then use the app or ServiceNow to move to completed when done.

---

## Send Email from the App (ServiceNow Email REST API)

The app can send discovery emails directly via ServiceNow's Email REST API. Emails appear in **System > Email > Outbound** (or Email Log).

### Prerequisites

1. **email_api_send role**: The ServiceNow user (OAuth or Basic Auth) must have the `email_api_send` role.
   - Go to **User Administration > Users** → open the user → **Roles** tab → add `email_api_send`.

2. **Outbound email configured**: System Properties > Email > Outbound must be set up (SMTP server, etc.).

### Usage

1. Open the Discovery view in the app.
2. Expand a Discovery RITM row (click the chevron).
3. Click **Send Email 1**, **Send Email 2**, or **Send Email 3** depending on the current phase.
4. The email is sent via ServiceNow and linked to the RITM. View it in **System > Email > Outbound**.
