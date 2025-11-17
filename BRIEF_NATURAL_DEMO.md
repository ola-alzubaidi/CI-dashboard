# Brief Demo Opening - Natural Flow

**Just talk naturally - no bullets, brief and conversational**

---

## **Your 4-5 Minute Opening**

### **Introduction**

> "Good morning everyone, thanks for joining today. For the past few weeks, I've been working on a dashboard modernization initiative where we're redesigning and replacing our current dashboards by building a custom application outside of ServiceNow using modern web technologies."

---

### **The Approach**

> "Let me explain what we're doing here. ServiceNow remains our data source and source of truth, nothing changes there. But instead of using ServiceNow's built-in dashboard features with all their limitations, we're building a standalone web application using a framework called Next.js that integrates with ServiceNow through their REST API in real-time. I've completed the integration piece where the custom app communicates with ServiceNow and pulls data in real-time, and I've also finished the authentication layer so users can log in with their ServiceNow credentials. Now I should mention, currently I'm using Basic Authentication which is fine for development and testing, but when we deploy to production we'll switch to OAuth 2.0 which is the recommended and more secure approach. So today you'll see it working with Basic Auth, but just know the production version will have that enhanced security."

---

### **Why Outside ServiceNow**

> "You might be asking why not just use ServiceNow's dashboards? Well, ServiceNow has some significant limitations. First, the customization is very limited and we can't fundamentally change how dashboards look or behave, we're basically stuck with their templates and layouts. Second, we're constrained by their modules and features, so if we need custom analytics or specific visualizations, we often can't do it. And third, the performance and user experience can be slow and we have no control over improving it. By building outside ServiceNow, we get complete control over everything, we can use modern technology, innovate faster, improve performance, and have unlimited flexibility. Essentially we're combining ServiceNow's powerful data management capabilities with a modern, flexible interface that we build exactly how we want it."

---

### **What is Next.js**

> "The application is built using Next.js. For those who aren't familiar, Next.js is a full-stack framework that's built on top of React. React handles the user interface like buttons and forms, and Next.js adds everything else you need like routing, APIs, optimization, and all the features required for production deployment. The key advantage is that it's frontend and backend in one codebase, so I can build the user interface and the API integration with ServiceNow all in the same project, which makes development faster and maintenance easier. It's also the same technology used by companies like Netflix, Uber, and TikTok, so it's proven at enterprise scale."

---

### **Transition to Demo**

> "Alright, let me show you what I've built. I'm going to start by showing you the ServiceNow instance that I created first so you can see what data we have there and understand the integration process, then I'll switch to the custom application and demonstrate how the data syncs between the two systems in real-time. This way you'll see the complete picture of how everything connects together. Let me pull up ServiceNow first..."

---

## **If They Ask About Authentication**

> "That's a great question. Basic Auth is actually fine for development and internal testing as long as we're using HTTPS, which we are. It's simpler to implement and lets me focus on building the core features first. For production we'll absolutely switch to OAuth 2.0, which is ServiceNow's recommended authentication method. I've already researched and documented the implementation, and it's not a major change, just swapping out the authentication provider in the code. The architecture supports both methods so we're not locked in."

---

## **Quick Summary Card**

```
WHAT: Dashboard modernization - custom app outside ServiceNow
WHY: ServiceNow dashboards are limited and constrained
HOW: Next.js full-stack framework + ServiceNow REST API
AUTH: Basic Auth now, OAuth for production
DEMO: Show ServiceNow first, then custom app, then sync
```

---

**Total time: 4-5 minutes, then show the demo. Simple, natural, conversational. 🚀**

