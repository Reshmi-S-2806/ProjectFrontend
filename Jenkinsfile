pipeline {
    agent any
    
    tools {
        nodejs 'node20'
    }

  stage('Docker Build & Run') {
    steps {
        echo 'Starting Docker Build...'
        // 1. Build the image
        bat 'docker build -t shopeasy-frontend:latest .'
        
        // 2. Safely stop and remove old containers
        script {
            try {
                bat 'docker stop shopeasy-container'
                bat 'docker rm shopeasy-container'
            } catch (Exception e) {
                echo "No existing container to stop. Continuing..."
            }
        }

        // 3. Run the new container
        echo 'Launching new container...'
        bat 'docker run -d --name shopeasy-container -p 8081:80 shopeasy-frontend:latest'
    }
}
}
