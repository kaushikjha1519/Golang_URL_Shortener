pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = credentials('docker-registry-url') // Update with your registry
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        KUBECONFIG = credentials('kubeconfig') // Path to kubeconfig file
        NAMESPACE = 'url-shortener'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build API Image') {
            steps {
                script {
                    dir('api') {
                        sh '''
                            docker build -t ${DOCKER_REGISTRY}/url-shortener-api:${IMAGE_TAG} .
                            docker tag ${DOCKER_REGISTRY}/url-shortener-api:${IMAGE_TAG} ${DOCKER_REGISTRY}/url-shortener-api:latest
                        '''
                    }
                }
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                script {
                    dir('frontend') {
                        sh '''
                            docker build -t ${DOCKER_REGISTRY}/url-shortener-frontend:${IMAGE_TAG} .
                            docker tag ${DOCKER_REGISTRY}/url-shortener-frontend:${IMAGE_TAG} ${DOCKER_REGISTRY}/url-shortener-frontend:latest
                        '''
                    }
                }
            }
        }
        
        stage('Push Images') {
            steps {
                script {
                    sh '''
                        docker push ${DOCKER_REGISTRY}/url-shortener-api:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/url-shortener-api:latest
                        docker push ${DOCKER_REGISTRY}/url-shortener-frontend:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/url-shortener-frontend:latest
                    '''
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh '''
                        # Update Kubernetes manifests with new image tags
                        sed -i "s|image:.*url-shortener-api.*|image: ${DOCKER_REGISTRY}/url-shortener-api:${IMAGE_TAG}|g" k8s/api-deployment.yaml
                        sed -i "s|image:.*url-shortener-frontend.*|image: ${DOCKER_REGISTRY}/url-shortener-frontend:${IMAGE_TAG}|g" k8s/frontend-deployment.yaml
                        
                        # Apply Kubernetes manifests
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/configmap.yaml
                        kubectl apply -f k8s/secret.yaml
                        kubectl apply -f k8s/redis-deployment.yaml
                        kubectl apply -f k8s/api-deployment.yaml
                        kubectl apply -f k8s/frontend-deployment.yaml
                        kubectl apply -f k8s/services.yaml
                        
                        # Optional: Apply ingress if configured
                        if [ -f k8s/ingress.yaml ]; then
                            kubectl apply -f k8s/ingress.yaml
                        fi
                        
                        # Wait for rollout
                        kubectl rollout status deployment/api -n ${NAMESPACE}
                        kubectl rollout status deployment/frontend -n ${NAMESPACE}
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sh '''
                        # Wait a bit for services to be ready
                        sleep 10
                        
                        # Get service endpoints
                        API_URL=$(kubectl get svc api-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' || echo "localhost:3000")
                        FRONTEND_URL=$(kubectl get svc frontend-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' || echo "localhost:8080")
                        
                        echo "API available at: ${API_URL}"
                        echo "Frontend available at: ${FRONTEND_URL}"
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            // Clean up Docker images if needed
            sh 'docker system prune -f || true'
        }
    }
}

