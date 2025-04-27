#!/bin/bash

# Exit on any error
set -e

# Change to script directory
cd "$(dirname "$0")"

# Activate virtual environment if exists
if [ -f ../.venv/bin/activate ]; then
    source ../.venv/bin/activate
fi

# Clear any existing logs
mkdir -p logs
rm -f logs/agent_*.log

# Define log files
SYLLABUS_LOG="logs/agent_syllabus.log"
QUICKLEARN_LOG="logs/agent_quicklearn.log"
COURSE_LOG="logs/agent_course.log"
FLASK_LOG="logs/flask.log"

echo "Starting Syllabus Agent..."
python -m agents.syllabus_agent > $SYLLABUS_LOG 2>&1 &
SYLLABUS_PID=$!
echo "Syllabus Agent started with PID: $SYLLABUS_PID (logs: $SYLLABUS_LOG)"

echo "Starting QuickLearn Agent..."
python -m agents.quick_learn_agent > $QUICKLEARN_LOG 2>&1 &
QUICKLEARN_PID=$!
echo "QuickLearn Agent started with PID: $QUICKLEARN_PID (logs: $QUICKLEARN_LOG)"

echo "Starting Course Content Agent..."
python -m agents.course_content_agent > $COURSE_LOG 2>&1 &
COURSE_PID=$!
echo "Course Content Agent started with PID: $COURSE_PID (logs: $COURSE_LOG)"

# Wait for agents to initialize (3 seconds)
echo "Waiting for agents to initialize..."
sleep 3

# Save PIDs to file for easy cleanup later
echo "$SYLLABUS_PID $QUICKLEARN_PID $COURSE_PID" > logs/agent_pids.txt

# Start Flask app (in foreground)
echo "Starting Flask server..."
python app.py

# When Flask exits (Ctrl+C), script continues to cleanup
wait

# Cleanup function
function cleanup {
    echo "Stopping all agents..."
    [ -f logs/agent_pids.txt ] && kill $(cat logs/agent_pids.txt) 2>/dev/null || true
    echo "All processes stopped."
}

# Register cleanup to happen on script exit
trap cleanup EXIT
