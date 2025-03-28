### Setup

First, you'll need to create a `.env` file in the root of this project. It should have the following values:

```bash
GMAIL_SENDER=your_sender_email_address
POSTGRES_HOST=db
POSTGRES_DB=table_aura
POSTGRES_USER=postgres
POSTGRES_PASSWORD=some_password
PROD_URL=http://<your_server_url>
```

Then, you'll need to create a Gmail service account and download the credentials, as well as an OAuth token. These should go in a folder in the root directory called `mounted` as follows:

```
mounted
    uploads/
    creds.json
    token.json
```

### Build Client

```bash
cd client && pnpm i && pnpm run build
```

### Build & Run Server

```bash
docker compose up --build
```

### How to Use

Access the website by visiting http://localhost:3000

Upload CSV files in the following format:

```
name,phone,email
Bob Jones,111-222-3333,test@email.com
```
