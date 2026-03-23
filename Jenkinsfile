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
                bat 'docker stop shopeasy-container || true'
                bat 'docker rm shopeasy-container || true'
                bat 'docker run -d --name shopeasy-container -p 8081:80 shopeasy-frontend:latest'
            }
        }
    }
}
