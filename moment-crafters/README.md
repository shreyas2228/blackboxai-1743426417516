# Moment Crafters - Event Vendor Marketplace

A platform connecting event organizers with professional vendors for all types of events.

## Features

- User authentication (login/registration)
- Vendor profiles and listings
- Booking system
- Admin dashboard
- Responsive design

## Technologies Used

- Node.js / Express.js
- MongoDB / Mongoose
- EJS templating
- Tailwind CSS
- Passport.js (authentication)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
```bash
npm run dev
```

## Environment Variables

See `.env.example` for required environment variables.

## Project Structure

```
moment-crafters/
├── app.js            # Main application entry point
├── models/           # Database models
├── routes/           # Application routes  
├── views/            # EJS templates
├── public/           # Static assets
└── .env.example      # Environment variables template
```

## License

MIT