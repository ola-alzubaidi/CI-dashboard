# Demo Security Q&A - Quick Answers

**Brief, confident answers to security questions during your demo**

---

## **"How do you store the credentials?"**

**Your Answer (Natural & Brief):**

> "Great question. We actually don't store the credentials at all. Here's how it works: when a user logs in with their ServiceNow username and password, we immediately convert those credentials to what's called a Basic Auth token, which is a Base64 encoded version. We then test that token with ServiceNow to verify it's valid. If it works, we store the token in a signed JWT session that lives in an HTTP-only cookie in the user's browser. The original password is never saved anywhere, it only exists in memory for maybe a hundred milliseconds during the login process, then it's gone. So there's no database with passwords, no plaintext storage, nothing like that. The JWT session is what allows the user to stay logged in, and it expires automatically after a period of inactivity. All of this happens over HTTPS, so everything is encrypted in transit."

---

## **If They Want More Details:**

> "To break it down further: the Basic Auth token is just an encoded version of the username and password, not encrypted but encoded. That's why HTTPS is absolutely required, because it encrypts everything during transmission. The token gets stored in a JWT, which is like a signed tamper-proof container. If anyone tries to modify it, the signature becomes invalid and the server rejects it. And because we're using HTTP-only cookies, JavaScript in the browser can't even access it, which protects against certain types of attacks. For production, we'll upgrade to OAuth 2.0, which is even more secure because it uses temporary access tokens instead of encoding the actual credentials."

---

## **"Where is the token stored?"**

**Your Answer:**

> "The token is stored in a JWT session, which lives in an HTTP-only cookie in the user's browser. HTTP-only means JavaScript can't access it, which provides security against cross-site scripting attacks. The JWT itself is signed with a secret key that only our server knows, so it can't be tampered with. If someone tries to modify the JWT, the signature breaks and the server rejects it. Nothing is stored in our database because there is no database for this, it's all session-based."

---

## **"Is this secure enough for production?"**

**Your Answer:**

> "For internal tools with HTTPS, Basic Auth is reasonably secure, but we're definitely planning to upgrade to OAuth 2.0 for production deployment. OAuth is ServiceNow's recommended authentication method and is more secure because it uses temporary access tokens that can be revoked, rather than encoding the actual credentials. I've already researched and documented the OAuth implementation. The good news is our architecture supports both methods, so it's really just swapping out the authentication provider in the code. The rest of the application stays the same."

---

## **"What if someone steals the token?"**

**Your Answer:**

> "That's a valid concern. The token is protected in a few ways: first, it's in an HTTP-only cookie so browser JavaScript can't access it. Second, all communication is over HTTPS so it's encrypted in transit, making it very difficult to intercept. Third, the JWT has an expiration time built in, so even if someone somehow got the token, it would only work until the session expires. Fourth, the token is tied to the user's session, so if they sign out, it's invalidated. For additional security in production, we could implement things like IP address validation, where the token only works from the same IP it was issued to, or shorter session timeouts that require more frequent re-authentication."

---

## **"Can users see each other's data?"**

**Your Answer:**

> "No, because each user authenticates with their own ServiceNow credentials, and when our app makes API calls to ServiceNow, it includes that user's authentication token. This means ServiceNow enforces all its existing role-based access control. If a user doesn't have permission to see certain incidents or request items in ServiceNow, they won't see them in our app either. We're not creating a separate permission system, we're leveraging ServiceNow's existing one. So all the security policies and access controls you've already configured in ServiceNow automatically apply here."

---

## **"What happens if ServiceNow passwords change?"**

**Your Answer:**

> "If a user changes their ServiceNow password, they'll just need to sign in again with the new password next time their session expires or they sign out. There's no syncing needed because we don't store the actual password. When they log in with the new password, we create a new authentication token and a new session. It's seamless from the user's perspective, and there's no risk of credentials getting out of sync because ServiceNow is always the source of truth for authentication."

---

## **"What about compliance - GDPR, HIPAA, etc.?"**

**Your Answer:**

> "The application is built with security best practices that support compliance, but full compliance depends on how and where it's deployed. What we provide: no long-term credential storage, encrypted data in transit with HTTPS, secure session management, and access control through ServiceNow's existing permissions. For full compliance with GDPR, HIPAA, or SOC 2, we'd work with your compliance and security teams to implement any additional controls needed, like audit logging, data retention policies, or enhanced monitoring. The architecture supports adding these features. I have detailed security documentation I can share that covers all these aspects for your security review."

---

## **Quick Reference Card**

```
┌────────────────────────────────────────────┐
│   CREDENTIAL STORAGE - QUICK ANSWER        │
├────────────────────────────────────────────┤
│                                            │
│ Q: How do you store credentials?          │
│                                            │
│ A: We DON'T store them.                   │
│    • User logs in                          │
│    • Credentials → Basic Auth token        │
│    • Token tested with ServiceNow          │
│    • Token stored in signed JWT            │
│    • JWT in HTTP-only cookie               │
│    • Original password NEVER saved         │
│    • All over HTTPS (encrypted)            │
│                                            │
│ KEY POINTS:                                │
│ ✓ No password storage                     │
│ ✓ Token in signed JWT                     │
│ ✓ HTTP-only cookie                        │
│ ✓ HTTPS required                          │
│ ✓ Will upgrade to OAuth for production    │
│                                            │
└────────────────────────────────────────────┘
```

---

## **The 30-Second Answer (If Time is Short)**

> "We don't store credentials. When users log in, we convert their username and password to a Basic Auth token, test it with ServiceNow, and if valid, we store the token in a signed JWT session in an HTTP-only cookie. The original password is never saved, it only exists in memory during login for a split second. Everything is over HTTPS so it's encrypted. For production we'll upgrade to OAuth 2.0 which is even more secure."

---

## **The 10-Second Answer (If Really Rushed)**

> "We don't store them. Credentials are converted to a token, stored in a signed JWT session, original password never saved. All over HTTPS. Upgrading to OAuth for production."

---

## **Body Language Tips When Answering Security Questions**

- **Maintain eye contact** - Shows confidence
- **Don't rush** - Take your time, security is important
- **Use your hands** - Gesture to emphasize "never stored"
- **Stay calm** - Security questions are normal and expected
- **Offer more info** - "I have detailed documentation on this"

---

## **Red Flags to Avoid Saying**

❌ "It's completely unhackable"  
❌ "We encrypt the passwords" (you don't store them to encrypt)  
❌ "Base64 is encryption" (it's encoding, not encryption)  
❌ "Security isn't really a concern"  
❌ "I haven't thought about that"  

✅ DO say:
- "We follow industry best practices"
- "We never store the actual passwords"
- "HTTPS encrypts everything in transit"
- "We're planning OAuth for production"
- "I can share detailed security documentation"

---

**Remember: This is a GOOD question. It shows they're thinking about security! Answer confidently. 🔒**

