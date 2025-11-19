# PWH Referral Management Program

This is a referrer-to-customer referral system where influencers or vet doctors (approved only by the PWH Team) can invite new customers to the platform. New customers receive an auto-applied discount for a defined time period, while the PWH Team can track all referrals, customer details, and billing analytics through the admin dashboard. Referrers do not have their own panel and are credited offline.

---

## Features
- Embeded shopify app.
- Referral analytics view.
- Referral add/edit/delete and view.

---

## Requirements
Before installing the project, ensure you have the following:

- PHP >= 8.2  
- Composer  
- MySQL
- Node.js & NPM
- Laravel CLI  
- Git  

---

## Installation

## Clone the repository:

git clone https://github.com/magecomp-shopify-team/pwh-referral-management.git
cd pwh-referral-management

## Installation
composer install

## Install Node modules
npm install

## Copy the .env file:
cp .env.example .env

## Generate app key:
php artisan key:generate

## Set database credentials inside .env, then run:
php artisan migrate

## Start Laravel server:
php artisan serve

## Start cloudeflared
cloudflared tunnel --url="http://127.0.0.1:8000"

## Add the HTTPS Url in .toml file and deploy:
application_url = "https://geometry-wish-fixtures-chemistry.trycloudflare.com/"

redirect_urls = [
  "https://geometry-wish-fixtures-chemistry.trycloudflare.com/authenticate"
]

## Start react:
npm run dev

## Start store dev
npm run devs

## Open Demo partner and install app in your store.

## Test the app.

## Important Note:
1.This app uses shopify's discount function, and the function managed by the another app whch is QUO Volume Discount app.