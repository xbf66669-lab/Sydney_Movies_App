# Deployment

## Live URLs

- **Frontend (AWS Amplify)**
  - https://main.d12p5zr8qcw2kd.amplifyapp.com
- **API (AWS API Gateway)**
  - Base invoke URL: https://zjx1845sql.execute-api.us-east-2.amazonaws.com

## AWS resources

- **Region**
  - us-east-2
- **API Gateway (HTTP API)**
  - API ID: `zjx1845sql`
  - Invoke URL: https://zjx1845sql.execute-api.us-east-2.amazonaws.com
- **Lambda**
  - Function name: _(find in AWS Lambda console or via `serverless info` — see commands below)_
- **Secrets Manager**
  - Secret ID (from `api/serverless.yml`): `Sydney_Movies_App/api/prod`

## Supabase

- **Project ref**
  - `qfestxyuayopccextlob`
- **REST base URL**
  - https://qfestxyuayopccextlob.supabase.co

## Deployment commands

### Client (Amplify)

Amplify deploys when you push to `main`.

```bash
git add -A
git commit -m "<message>"
git push origin main
```

### API (Serverless)

```bash
# Deploy
npx --prefix api serverless deploy

# Show deployed endpoints + stack info
npx --prefix api serverless info
```

### Finding the Lambda function name

After deploying, use one of these:

- AWS Console
  - Lambda -> Functions -> look for the Serverless function for service `sydney-movies-api`
- Serverless output
  - `npx --prefix api serverless info`
  - Copy the Lambda function name from the printed resources/stack
