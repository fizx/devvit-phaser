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

To build and deploy documentation:

1. First, generate the documentation with TypeDoc:
```
npm run docs
```

2. The docs are generated in the `docs` folder in HTML format
   
3. GitHub Pages is configured to serve directly from the `docs` folder in the main branch

4. After making documentation changes, commit and push the updated docs to the main branch:
```
git add docs
git commit -m "Update documentation"
git push
```

The documentation site will be available at https://fizx.github.io/devvit-phaser