# Mustard Tree Journey Tracker

The Mustard Tree Journey Tracker is a web application for tracking in-kind donations. This README provides an overview of the project and instructions for running it locally.

## Prerequisites

Before running the Mustard Tree Journey Tracker locally, make sure you have the following:

- Node.js installed
- A Gmail account with an app password generated (see http://myaccount.google.com/apppasswords)

## Getting Started

To get started with the Mustard Tree Journey Tracker, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/mustard-tree-journey-tracker.git
    ```

2. Install the dependencies:

    ```bash
    cd mustard-tree-journey-tracker
    npm install
    ```

3. Create a `.env` file in the root directory of the project and add the following:

    ```plaintext
    GMAIL_USER=gmail address
    GMAIL_PASS=gmail app password
    ```

4. Start the application:

    ```bash
    npm start
    ```

5. Open your web browser and navigate to `http://localhost:3000/api-docs` to access the Mustard Tree Journey Tracker Swagger UI.

## License

The Mustard Tree Journey Tracker is licensed under the [MIT License](./LICENSE).