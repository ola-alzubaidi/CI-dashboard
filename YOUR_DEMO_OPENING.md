# Your Demo Opening Script - Dashboard Modernization

**What to say in your own words - natural and conversational**

---

## **Opening (5-7 minutes)**

### **1. Introduction (30 seconds)**

**What to say:**

> "Good morning/afternoon everyone, thanks for joining today.
>
> For the past few weeks, I've been working on a dashboard modernization initiative. What I want to show you today is how we're redesigning and replacing our current dashboards by building a custom application outside of ServiceNow using modern web technologies."

---

### **2. The Approach (90 seconds)**

**What to say:**

> "Let me explain the approach we're taking here.
>
> ServiceNow remains our data source - it's still the source of truth for all our data, nothing changes there. But instead of using ServiceNow's built-in dashboard features with all their limitations, we're building a standalone web application using a framework called **Next.js** that integrates with ServiceNow through their REST API in real-time.
>
> **What I've completed so far:**
>
> I've finished the integration piece - getting our custom application to communicate with ServiceNow, pull data, and sync everything in real-time. I've also completed the authentication layer, so users can log in with their ServiceNow credentials.
>
> Now, I should mention - currently I'm using Basic Authentication, which is fine for development and testing. But since we'll eventually deploy this to production, we'll need to change the authentication method to OAuth 2.0, which is the recommended and more secure approach for production environments. That's actually what I'm working on next.
>
> **[Pause]**
>
> So for today's demo, you'll see the Basic Auth version, but just know that the production version will have enhanced security with OAuth."

---

### **3. Why Build Outside ServiceNow (90 seconds)**

**What to say:**

> "Now you might be asking - why not just use ServiceNow's dashboards? Why go through the effort of building something separate?
>
> **Here's the reality:**
>
> ServiceNow has significant limitations when it comes to dashboards.
>
> **First** - Limited customization. We can't fundamentally change how dashboards look or behave. We're stuck with their templates and layouts. If we want something specific that ServiceNow doesn't offer, we simply can't do it.
>
> **Second** - Limited modules and features. We're constrained by what ServiceNow provides out of the box. If we need custom analytics, specific visualizations, or unique workflows, we're often out of luck.
>
> **Third** - Performance and user experience. ServiceNow's dashboard performance can be slow, and we have no control over improving it. The UX is what it is - we can't make it more intuitive or modern.
>
> **By building outside ServiceNow, we get:**
>
> - Complete control over how everything looks and works
> - Modern technology and development practices
> - Faster innovation - we can add features in days instead of weeks
> - Better performance - optimized for our specific needs
> - Unlimited flexibility - if we can design it, we can build it
>
> We're essentially combining the best of both worlds: ServiceNow's powerful data management and ITSM capabilities as our foundation, with a modern, flexible interface built exactly how we want it."

---

### **4. What is Next.js (60 seconds)**

**What to say:**

> "The custom application is built using **Next.js**. For those who aren't familiar with this framework, let me give you a quick explanation.
>
> Next.js is a full-stack framework built on top of React. 
>
> **[Pause to let that sink in]**
>
> What that means is: React is the library for building user interfaces - the buttons, forms, and visual elements. Next.js takes React and adds everything else you need for a complete application: routing, APIs, optimization, security features, and everything required for production deployment.
>
> The key advantage is that it's **frontend and backend in one codebase**. So I can build the user interface AND the API integration with ServiceNow all in the same project. This makes development faster, maintenance easier, and keeps everything organized.
>
> It's also the same technology used by companies like Netflix, Uber, and TikTok - so it's proven at enterprise scale."

---

### **5. Transition to Demo (30 seconds)**

**What to say:**

> "Alright, enough talking about it - let me show you what I've built.
>
> **[Smile]**
>
> I'm going to start by showing you the **ServiceNow instance that I created first**, so you can see what data we have there and understand the integration process. Then I'll switch to the custom application and demonstrate how the data syncs between the two systems in real-time.
>
> This way, you'll see the complete picture of how everything connects together.
>
> **[Start screen share]**
>
> Let me pull up ServiceNow first..."

---

## 🎯 **Quick Reference Card**

Print this or keep visible during your demo:

```
┌──────────────────────────────────────────────┐
│         YOUR DEMO OPENING - KEY POINTS       │
├──────────────────────────────────────────────┤
│                                              │
│ 1. INTRODUCTION                              │
│    "Dashboard modernization initiative"      │
│    "Building custom app outside ServiceNow"  │
│                                              │
│ 2. THE APPROACH                              │
│    • ServiceNow = source of truth            │
│    • Custom app built with Next.js           │
│    • REST API integration (real-time)        │
│    • Using Basic Auth now                    │
│    • Will switch to OAuth for production     │
│                                              │
│ 3. WHY OUTSIDE SERVICENOW                    │
│    • Limited customization                   │
│    • Limited modules & features              │
│    • Can't improve performance/UX            │
│    → We get: control, modern tech, speed,    │
│      flexibility, better performance         │
│                                              │
│ 4. WHAT IS NEXT.JS                           │
│    • Full-stack framework (built on React)   │
│    • Frontend + Backend in one codebase      │
│    • Used by Netflix, Uber, TikTok           │
│    • Adds routing, APIs, optimization        │
│                                              │
│ 5. DEMO FLOW                                 │
│    → Show ServiceNow instance FIRST          │
│    → Then show custom app                    │
│    → Demo real-time data sync                │
│                                              │
│ TOTAL TIME: 5-7 minutes                      │
└──────────────────────────────────────────────┘
```

---

## 📋 **Demo Flow After Opening**

After your opening, follow this sequence:

### **Step 1: Show ServiceNow Instance (3-5 minutes)**

**What to say:**

> "Alright, this is the ServiceNow instance I set up for this project.
>
> **[Navigate through ServiceNow]**
>
> Let me show you what we have here:
>
> - **[Go to Request Items]** Here are the RITMs - request items that users have submitted
> - **[Click on one RITM]** You can see the details: request number, description, state, priority, who it's assigned to, creation date
> - **[Go to Incidents if you have them]** Same thing with incidents - all the standard ServiceNow data
> - **[Go to Users]** And our user directory
>
> All of this data is managed in ServiceNow - this is our source of truth.
>
> Now, I've configured the ServiceNow REST API to allow our custom application to access this data. I've set up the proper authentication, permissions, and security settings.
>
> **[If comfortable, briefly show API settings]**
>
> ServiceNow provides standard API endpoints for all their tables - incidents, request items, users, everything. Our custom app calls these APIs to pull the data you're seeing here.
>
> Keep this ServiceNow tab open - I want you to see how the data matches exactly when we switch to our custom app."

---

### **Step 2: Show Your Custom Application (10-12 minutes)**

**What to say:**

> "Now, let me show you the custom application.
>
> **[Switch to your app tab - showing sign-in page]**
>
> This is the landing page. Users sign in with their ServiceNow credentials - the same username and password they use for ServiceNow.
>
> **[Sign in]**
>
> Let me log in...
>
> **[Dashboard loads]**
>
> And here we are! This is the main dashboard.
>
> **[Start showing features - see 30_MIN_DEMO_SCRIPT.md for detailed walkthrough]**
>
> Notice the difference immediately - modern interface, clean design, easy to navigate..."

---

### **Step 3: Demonstrate Real-Time Sync (3-5 minutes)**

**What to say:**

> "Now let me demonstrate the real-time synchronization.
>
> **[Arrange windows to show both ServiceNow and your app, or switch between them]**
>
> I'm going to make a change in ServiceNow and show you how it appears instantly in our custom app.
>
> **[Go to ServiceNow, edit a RITM]**
>
> I'll update this request item's description... let's change it to 'DEMO UPDATE TEST'...
>
> **[Save in ServiceNow]**
>
> Saved.
>
> **[Switch to your app]**
>
> Now in our custom app, I'll refresh the data...
>
> **[Click refresh]**
>
> And there it is - the exact same change, immediately reflected. Same data, just a different, better interface.
>
> This proves that our app is truly integrated with ServiceNow in real-time. No data duplication, no sync delays - just a modern window into your ServiceNow data."

---

## 💡 **Natural Language Tips**

### **Make it conversational:**

❌ **Don't say:** "We have implemented a solution utilizing Next.js framework"
✅ **Do say:** "I've built this using Next.js, which is a modern web framework"

❌ **Don't say:** "The application leverages RESTful API architecture"
✅ **Do say:** "The app connects to ServiceNow through their REST API"

❌ **Don't say:** "We're utilizing Basic Authentication temporarily"
✅ **Do say:** "Right now I'm using Basic Auth, but we'll upgrade to OAuth for production"

### **Use bridging phrases:**

- "Let me show you what I mean..."
- "Here's the thing..."
- "Now, you might be wondering..."
- "The key advantage here is..."
- "What's cool about this is..."

### **Handle pauses naturally:**

After saying something important:
- **Pause for 2-3 seconds**
- Look at your audience (or camera)
- Let the information sink in
- Then continue

---

## ⚠️ **If Someone Asks About Authentication**

**Q: "Why are you using Basic Auth if it's less secure?"**

**Your answer:**

> "Great question. Basic Auth is actually fine for development and internal testing - as long as we're using HTTPS, which we are. It's simpler to implement and lets me focus on building the core features first.
>
> For production deployment, we'll absolutely switch to OAuth 2.0, which is ServiceNow's recommended authentication method for integrations. I've already researched it and documented the implementation - it's actually not a major change, just swapping out the authentication provider in the code.
>
> The important thing is the architecture supports both methods - we're not locked into Basic Auth. It's just the quickest way to get a working demo while I build out the core functionality."

---

## 📧 **Opening Line Variations (Choose What Feels Natural)**

**Option 1 (Formal):**
> "Thank you all for joining today. For the past few weeks, I've been working on an initiative to modernize our dashboards..."

**Option 2 (Conversational):**
> "Hey everyone, thanks for being here. I'm excited to show you what I've been building over the past few weeks..."

**Option 3 (Direct):**
> "Good morning team. I want to show you something I've been working on - a complete redesign of how we interact with ServiceNow data..."

**Option 4 (Problem-focused):**
> "Thanks for joining. We all know ServiceNow dashboards can be frustrating to work with. For the past few weeks, I've been building a solution to that problem..."

---

## ✅ **Pre-Demo Checklist**

Before you start:

- [ ] ServiceNow tab open and logged in
- [ ] Your app tab open (on sign-in page)
- [ ] Know exactly which RITM you'll edit for the sync demo
- [ ] Practice saying "Next.js" confidently (not "next js" or "nextjs")
- [ ] Water nearby
- [ ] Close all other tabs
- [ ] Silence notifications
- [ ] Take a deep breath 😊

---

## ⏱️ **Timing**

| Section | Time |
|---------|------|
| Opening introduction | 30 sec |
| The approach | 90 sec |
| Why outside ServiceNow | 90 sec |
| What is Next.js | 60 sec |
| Transition to demo | 30 sec |
| **TOTAL OPENING** | **5 minutes** |
| Show ServiceNow | 3-5 min |
| Show custom app | 10-12 min |
| Real-time sync demo | 3-5 min |
| Q&A | 5 min |
| **TOTAL DEMO** | **30 minutes** |

---

## 🎯 **Your Key Messages**

**What you want them to remember:**

1. ✅ We're modernizing dashboards by building outside ServiceNow
2. ✅ ServiceNow stays as our data source (source of truth)
3. ✅ Built with Next.js (modern, full-stack framework)
4. ✅ Real-time integration via REST API
5. ✅ More flexibility, better UX than ServiceNow dashboards
6. ✅ Production-ready (just need to upgrade auth)

---

**You've got this! Speak naturally, show enthusiasm, and let your work speak for itself! 🚀**

