# Useful Commands

## GitHub Actions

To check GitHub Actions workflow status and logs:
```
./scripts/gh-logs.sh                    # Shows recent workflow runs and usage info
./scripts/gh-logs.sh list               # Lists recent workflow runs
./scripts/gh-logs.sh logs <run-id>      # Gets logs for a specific run ID
./scripts/gh-logs.sh wait [run-id] [timeout] # Wait for run completion with logs (default: latest, 600s)
```

## Documentation

To deploy the documentation site to GitHub Pages:
```
npm run deploy-docs
```

This command builds the project, generates documentation with TypeDoc, and deploys to GitHub Pages using the gh-pages package.