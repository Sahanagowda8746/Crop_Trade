These files were added to help initialize Firebase safely and to document how to add the required GitHub Actions secret for deployment.

Workflow reference: .github/workflows/firebase.yml (ref: d4c2a89389b5acfef7d0a3458058e4bc62b33de5)

Required steps to deploy from GitHub Actions:
1) Create a GCP service account for CI/CD and grant it at minimum the following roles:
   - roles/firebasehosting.admin (Firebase Hosting Admin)
   - roles/iam.serviceAccountUser (if needed)
2) Generate a JSON key for the service account and download the JSON file.
3) In GitHub, go to Settings → Secrets and variables → Actions → New repository secret.
   - Name: FIREBASE_SERVICE_ACCOUNT
   - Value: paste the full JSON contents of the key file (do NOT commit this file to the repo).
4) If you prefer to store the key base64 encoded, adjust the workflow accordingly. The current workflow expects the raw JSON in FIREBASE_SERVICE_ACCOUNT.
5) Ensure your workflow sets the NEXT_PUBLIC_* environment variables for build if they are not present as repository secrets. The workflow currently reads NEXT_PUBLIC_FIREBASE_* from secrets during the Build project step.

Notes on usage:
- lib/firebaseClient.ts initializes Firebase only on the client (avoids build-time "Automatic initialization failed" warnings). Import this only in client code (components, hooks).
- lib/firebaseAdmin.ts initializes the Firebase Admin SDK from process.env.FIREBASE_SERVICE_ACCOUNT; use only in server-side code (API routes, getServerSideProps).

After adding the repository secret, re-run the workflow or push to main to trigger the GitHub Action. If you want, remove the service account JSON and re-create keys periodically for security.