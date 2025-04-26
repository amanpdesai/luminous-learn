#!/bin/bash

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install Python dependencies
echo "Installing backend Python dependencies..."
pip install -r backend/requirements.txt

# Navigate to frontend and install npm packages
echo "Installing frontend npm packages..."
cd frontend
npm install

# Return to original directory
cd -