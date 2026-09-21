# Just2Profit — Starter Full Project

এটি Just2Profit-এর একটি নিরাপদ starter project। এখানে User Android app, Admin web panel, backend API এবং database schema-এর ভিত্তি দেওয়া হয়েছে।

## গুরুত্বপূর্ণ
এটি এখনো production payment app নয়। Real-money withdrawal চালু করার আগে বৈধ business/payment-provider requirements, KYC/AML, privacy policy, terms এবং security review করতে হবে।

## Project
- android/ — Android User App
- admin/ — Admin Panel-এর starter UI
- backend/ — Node.js API starter
- database/ — PostgreSQL schema

## Database
PostgreSQL ব্যবহার করুন। `database/schema.sql` চালালে users, wallets, tasks, submissions, referrals, transactions, withdrawals এবং notifications-এর tables তৈরি হবে।

## Backend চালানো
1. Node.js 20+ install করুন।
2. backend/.env.example কপি করে .env করুন।
3. DATABASE_URL বসান।
4. `npm install`
5. `npm start`

## Android
Android Studio-তে `android/` খুলুন। প্রথমবার Gradle sync হবে। তারপর emulator বা USB debugging চালু করা ফোনে Run করুন।

## Admin
`admin/index.html` ব্রাউজারে খুলে starter panel দেখা যাবে। Production-এ এটি backend authentication-এর সঙ্গে connect করতে হবে।

## Earning logic
Task → submission → admin/system verification → transaction → wallet balance।
Balance কখনো client-side থেকে trusted হবে না।
