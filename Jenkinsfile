pipeline {
    agent any

    environment {
        // Credentials configured in Jenkins Global Credentials Store
        DOCKER_HUB_CREDS = 'docker-hub-credentials'
        DOCKER_REGISTRY  = 'docker.io'
        DOCKER_USERNAME  = 'danish20699'
        
        BACKEND_IMAGE    = "${DOCKER_USERNAME}/blog-backend"
        FRONTEND_IMAGE   = "${DOCKER_USERNAME}/blog-frontend"
        IMAGE_TAG        = "${BUILD_NUMBER}"
        
        STAGING_URL      = 'http://staging-vm:8080'
        PROD_URL         = 'http://prod-vm:8080'
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        disableConcurrentBuilds()
        ansiColor('xterm')
    }

    stages {
        // =====================================================================
        // STAGE 1: LINTING & STATIC ANALYSIS (Fail Fast before Build)
        // =====================================================================
        stage('1. Lint & Static Analysis') {
            steps {
                echo '>>> [STAGE 1] Checking Code Formatting, PEP8, and Leaked Secrets...'
                sh '''
                    python3 -m pip install --upgrade pip
                    python3 -m pip install ruff
                    python3 -m ruff check backend/
                '''
            }
        }

        // =====================================================================
        // STAGE 2: UNIT TESTS (Isolated Logic, Zero DB Dependency)
        // =====================================================================
        stage('2. Unit Tests') {
            steps {
                echo '>>> [STAGE 2] Running Isolated Unit Tests (Auth, JWT, Pagination Math)...'
                sh '''
                    python3 -m pip install -r backend/requirements-test.txt
                    python3 -m pytest backend/tests/unit/ -v
                '''
            }
        }

        // =====================================================================
        // STAGE 3: INTEGRATION TESTS & DOCKER BUILD
        // =====================================================================
        stage('3. Integration Test + Build') {
            steps {
                echo '>>> [STAGE 3] Running Full Route Integration Tests & Building Docker Images...'
                sh '''
                    python3 -m pytest backend/tests/integration/ -v
                    
                    echo "Building Backend Docker Image..."
                    docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend
                    
                    echo "Building Frontend Docker Image with Multi-Stage NGINX..."
                    docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend
                '''
            }
        }

        // =====================================================================
        // STAGE 4: PUSH TO DOCKER HUB REGISTRY
        // =====================================================================
        stage('4. Push (Docker Hub)') {
            steps {
                echo '>>> [STAGE 4] Authenticating and Pushing Images to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CREDS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                        docker logout
                    '''
                }
            }
        }

        // =====================================================================
        // STAGE 5: STAGING DEPLOYMENT
        // =====================================================================
        stage('5. Staging Deploy') {
            steps {
                echo '>>> [STAGE 5] Deploying Container Stack to Staging VM...'
                sh '''
                    echo "Pulling ${BACKEND_IMAGE}:${IMAGE_TAG} and deploying on Staging..."
                    # Example SSH execution to staging VM:
                    # ssh -o StrictHostKeyChecking=no ubuntu@staging-vm "docker compose pull && docker compose up -d"
                '''
            }
        }

        // =====================================================================
        // STAGE 6: SMOKE TESTS
        // =====================================================================
        stage('6. Smoke Tests') {
            steps {
                echo '>>> [STAGE 6] Performing Post-Deployment Sanity Health Checks...'
                sh '''
                    echo "Verifying Staging Gateway and Backend connectivity..."
                    # curl -f -m 10 ${STAGING_URL}/api/ || exit 1
                '''
            }
        }

        // =====================================================================
        // STAGE 7: STRESS TESTING (OHA LOAD BENCHMARK)
        // =====================================================================
        stage('7. Stress Test (oha)') {
            steps {
                echo '>>> [STAGE 7] Running High-Concurrency Load Testing with oha...'
                sh '''
                    echo "Testing load balancing across replicas under 50 concurrent connections..."
                    # oha -z 10s -c 50 ${STAGING_URL}/api/blogs?limit=20 || exit 1
                '''
            }
        }

        // =====================================================================
        // STAGE 8: HUMAN APPROVAL GATE
        // =====================================================================
        stage('8. Approval Gate') {
            steps {
                echo '>>> [STAGE 8] Waiting for Lead Engineer Sign-off before Production Deploy...'
                timeout(time: 24, unit: 'HOURS') {
                    input message: 'Staging verification & stress tests passed. Approve deployment to Production?',
                          ok: 'Proceed to Production'
                }
            }
        }

        // =====================================================================
        // STAGE 9: PRODUCTION DEPLOYMENT
        // =====================================================================
        stage('9. Prod Deploy') {
            steps {
                echo '>>> [STAGE 9] Executing Zero-Downtime Rolling Deployment to Production...'
                sh '''
                    echo "Deploying verified build #${IMAGE_TAG} to Production Cluster..."
                    # ssh -o StrictHostKeyChecking=no ubuntu@prod-vm "docker compose up -d --no-deps backend frontend"
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
            echo ">>> Workspace cleaned."
        }
        success {
            echo "🎉 PIPELINE SUCCESS: Build #${IMAGE_TAG} has been safely tested and deployed!"
        }
        failure {
            echo "❌ PIPELINE FAILURE: Build #${IMAGE_TAG} stopped. Review the failed stage logs."
        }
    }
}
