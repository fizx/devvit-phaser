#!/bin/bash

# List recent workflow runs
list_runs() {
  gh run list --limit 10
}

# Get logs from a specific workflow run
get_logs() {
  if [ -z "$1" ]; then
    echo "Usage: $0 logs <run-id>"
    exit 1
  fi
  
  gh run view "$1" --log
}

# Wait for a workflow run to complete
wait_for_run() {
  if [ -z "$1" ]; then
    # Get the most recent run ID
    local run_id=$(gh run list --limit 1 --json databaseId --jq ".[0].databaseId")
    if [ -z "$run_id" ]; then
      echo "No recent runs found"
      exit 1
    fi
  else
    local run_id=$1
  fi
  
  local timeout=${2:-600}  # Default timeout: 10 minutes
  local start_time=$(date +%s)
  local end_time=$((start_time + timeout))
  
  echo "Waiting for run $run_id to complete (timeout: ${timeout}s)..."
  
  while true; do
    local status=$(gh run view "$run_id" --json status --jq ".status")
    local conclusion=$(gh run view "$run_id" --json conclusion --jq ".conclusion")
    
    echo "Current status: $status, conclusion: $conclusion"
    
    if [ "$status" = "completed" ]; then
      echo "Run $run_id completed with conclusion: $conclusion"
      
      # Show logs for the completed run
      echo "Displaying logs for run $run_id:"
      gh run view "$run_id" --log
      
      if [ "$conclusion" = "success" ]; then
        return 0
      else
        return 1
      fi
    fi
    
    # Check timeout
    current_time=$(date +%s)
    if [ $current_time -gt $end_time ]; then
      echo "Timeout reached. Run $run_id is still in progress."
      return 2
    fi
    
    sleep 10
  done
}

# Main command processing
case "$1" in
  list)
    list_runs
    ;;
  logs)
    get_logs "$2"
    ;;
  wait)
    wait_for_run "$2" "$3"
    ;;
  *)
    echo "GitHub Actions Logs Helper"
    echo ""
    echo "Usage:"
    echo "  $0 list                     # List recent workflow runs"
    echo "  $0 logs <run-id>            # Get logs for a specific run"
    echo "  $0 wait [run-id] [timeout]  # Wait for a run to complete (default: latest run, 600s timeout)"
    echo ""
    list_runs
    ;;
esac