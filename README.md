# miniLibrary – Simple Book Borrowing Log

**miniLibrary** is a full-stack web application that provides a simple interface for managing a small library. Users can register, log in, view a list of available books, borrow them, and view their personal borrowing history.

This project was built with a clean, single-page application (SPA) architecture for the frontend and a robust RESTful API on the backend.

## Features

- **User Authentication**: Secure user registration and login using JSON Web Tokens (JWT).
- **Book Management**: Backend models for books with title, author, and quantity.
- **Transaction Logging**: Records every borrow and return action, linked to a user and a book.
- **RESTful API**: A well-defined API for all frontend operations.
  - `POST /api/register` - Create a new user account.
  - `POST /api/login` - Authenticate and receive a JWT.
  - `GET /api/books` - Fetch all books in the library.
  - `POST /api/books/borrow/:id` - Borrow an available book.
  - `POST /api/books/return/:id` - Return a borrowed book.
  - `GET /api/history` - View the logged-in user's personal transaction history.
- **SPA Frontend**: A responsive and intuitive single-page interface built with vanilla HTML, CSS, and JavaScript. No frameworks needed!

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs for password hashing
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Deployment-Ready**: Configured for services like Render.com.

## Project Structure

```
miniLibrary/
|-- .env.example
|-- package.json
|-- server.js
|-- middleware/
|   `-- auth.js
|-- models/
|   |-- Book.js
|   |-- Transaction.js
|   `-- User.js
|-- public/
|   |-- app.js
|   |-- index.html
|   `-- styles.css
`-- README.md
```

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](httpss://nodejs.org/en/) (v14 or higher recommended)
- [MongoDB](httpss://www.mongodb.com/try/download/community) installed and running on your local machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/miniLibrary.git
    cd miniLibrary
    ```

2.  **Install server dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying the example file.
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and add your configuration:
    ```
    # Port for the server to run on
    PORT=3000

    # Your MongoDB connection string
    MONGO_URI=mongodb://localhost:27017/miniLibrary

    # A strong, unique secret for signing JWTs
    JWT_SECRET=your_super_secret_jwt_key
    ```
    **Important:** Replace `your_super_secret_jwt_key` with a long, random string for security.

### Running the Application

1.  **Seed the database (optional):**
    To populate the library with an initial set of books, run the following command. This will clear any existing books and add a predefined list.
    ```bash
    npm run seed
    ```

2.  **Start the server:**
    To run the server with automatic restarts on file changes (recommended for development):
    ```bash
    npm run dev
    ```
    Or, for a standard production start:
    ```bash
    npm start
    ```

3.  **Access the application:**
    Open your web browser and navigate to:
    ```
    http://localhost:3000
    ```
    The port will match the `PORT` variable in your `.env` file.

## How to Use

1.  **Register:** Create a new account using the registration form.
2.  **Login:** Log in with your new credentials.
3.  **View Books:** Once logged in, you will see a list of all books in the library.
4.  **Borrow a Book:** Click the "Borrow" button next to any available book. The quantity will decrease, and a transaction will be recorded.
5.  **View History:** Click on the "My History" link in the navigation bar to see a log of all your borrowed and returned books.
6.  **Return a Book:** In your history view, click the "Return" button next to any book you have currently borrowed.

## Deployment

This application is ready to be deployed on platforms like [Render](httpss://render.com/).

1.  **Push your code** to a GitHub repository.
2.  On Render, create a new **Web Service** and connect it to your repository.
3.  Set the **Start Command** to `npm start`.
4.  Under **Environment Variables**, add the `MONGO_URI` and `JWT_SECRET` from your `.env` file. Render will automatically provide the `PORT`.

And that's it! Your application will be live.
