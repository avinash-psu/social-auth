# PSU Google Sign-In Project
This project implements Google Sign-In functionality for Pennsylvania State University.

## Setup Instructions
1. Clone the repository:
git clone https://github.com/psu-edu/psgv-se-2025spring-sweng861AT.git cd Sweg861/social-login-app


2. Install dependencies:
npm install


3. Set up your Google OAuth 2.0 Client ID:
- Go to the [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select an existing one
- Enable the Google+ API
- Create OAuth 2.0 credentials (Web application type)
- Add `http://localhost:3000` to the Authorized JavaScript origins
- Add `http://localhost:3000/auth/google/callback` to the Authorized redirect URIs

4. Set up environment variables:
Create a `.env` file in the root directory and add:
GOOGLE_CLIENT_ID=your_google_client_id


5. Update the client-side configuration:
In `public/script.js`, replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID.

6. Start the server:
npm start


7. Open a web browser and navigate to `http://localhost:3000`

## Troubleshooting

- If you encounter CORS issues, ensure that your Google Cloud Console project has the correct Authorized JavaScript origins.
- If authentication fails, double-check that your Client ID is correctly set in both the server environment and the client-side script.
- For database issues, ensure that the application has write permissions in the directory where the SQLite database file is located.

## Security Considerations

- Always use HTTPS in production environments.
- Keep your Client ID and Client Secret secure and never commit them to version control.
- Regularly update dependencies to patch any security vulnerabilities.

