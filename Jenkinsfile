pipeline {
    agent any
    
    tools {
        nodejs 'node20'
    }

    stages {
        stage('Docker Build & Run') {
            steps { // <--- This word ONLY works if 'pipeline' is at the top
                echo 'Starting Docker Build...'
                bat 'docker build -t shopeasy-frontend:latest .'
                
                // Cleanup old containers and run new one
                // Use 'set ERRORLEVEL=0' to tell Windows that an error is okay
bat 'docker stop shopeasy-container >nul 2>&1 & set ERRORLEVEL=0'
bat 'docker rm shopeasy-container >nul 2>&1 & set ERRORLEVEL=0'

// Now run the new container
bat 'docker run -d --name shopeasy-container -p 8081:80 shopeasy-frontend:latest'
            }
        }
    }
}
