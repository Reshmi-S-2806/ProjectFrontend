pipeline {
    agent any

    tools {
        nodejs 'node20' 
    }

    stages {
        stage('Deploy to Kubernetes') {
    steps {
        bat 'kubectl apply -f k8s/deployment.yaml'
        bat 'kubectl apply -f k8s/service.yaml'
        // This forces Kubernetes to refresh the pods with your newest image
        bat 'kubectl rollout restart deployment/shopeasy-frontend'
    }
}
                }

                // 3. Run the new container
                echo 'Launching new container on port 8081...'
                bat 'docker run -d --name shopeasy-container -p 8081:80 shopeasy-frontend:latest'
            }
        }
    }
}
