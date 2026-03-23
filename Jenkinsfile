pipeline {
    agent any

    tools {
        nodejs 'node20' 
    }

    stages {
        stage('Docker Build & Run') {
            steps {
                echo 'Starting Docker Build...'
                
                // 1. Build the image
                bat 'docker build -t shopeasy-frontend:latest .'

                // 2. Handle Windows Docker Cleanup
                script {
                    try {
                        // We use 'catchError' or a try-catch so the build doesn't stop if the container isn't there
                        bat 'docker stop shopeasy-container'
                        bat 'docker rm shopeasy-container'
                    } catch (Exception e) {
                        echo "No existing container found to stop. Moving to run stage..."
                    }
                }

                // 3. Run the new container
                echo 'Launching new container on port 8081...'
                bat 'docker run -d --name shopeasy-container -p 8081:80 shopeasy-frontend:latest'
            }
        }
    }
}
