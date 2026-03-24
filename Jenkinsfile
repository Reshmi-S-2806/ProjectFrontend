pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    environment {
        // Define your image name here for consistency
        IMAGE_NAME = "shopeasy-frontend:latest"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling code from GitHub...'
                git branch: 'main', url: 'https://github.com/Reshmi-S-2806/ProjectFrontend.git'
            }
        }

        stage('Install & Build') {
            steps {
                echo 'Installing packages and building Angular...'
                bat 'npm install --legacy-peer-deps'
                // Ensure your angular.json has the increased budgets we discussed!
                bat 'npx ng build --configuration=production --no-progress'
            }
        }

        stage('Dockerize') {
            steps {
                echo 'Creating Docker Image...'
                // This uses the Dockerfile in your root directory
                bat "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Kubernetes Deployment') {
            steps {
                echo 'Deploying to Local Kubernetes Cluster...'
                
                // 1. Apply the manifests from your k8s folder
                bat 'kubectl apply -f k8s/deployment.yaml'
                bat 'kubectl apply -f k8s/service.yaml'
                
                // 2. Force Kubernetes to refresh the pods with the new local image
                bat 'kubectl rollout restart deployment/shopeasy-frontend'
                
                echo 'Deployment finished! Access at http://localhost:30001'
            }
        }
    }

    post {
        success {
            echo 'Pipeline Success! Shopeasy is live on Kubernetes.'
        }
        failure {
            echo 'Pipeline failed. Check the logs for Docker or Kubectl errors.'
        }
    }
}
